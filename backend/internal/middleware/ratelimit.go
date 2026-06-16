package middleware

import (
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"

	sentry "github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

// rateLimitBucket is a sliding-window counter of request timestamps for a
// single client key. Access is guarded by its own mutex so independent keys
// never contend with one another. lastReported throttles observability
// signals to one per key per window (see allow).
type rateLimitBucket struct {
	mu           sync.Mutex
	times        []time.Time
	lastReported time.Time
}

// rateLimiter is an in-memory, IP-keyed sliding-window limiter. It is process-
// local (not shared across instances), which is sufficient for throttling
// brute-force and email-bombing attempts against the public auth endpoints.
type rateLimiter struct {
	buckets sync.Map // key (string) -> *rateLimitBucket
	max     int
	window  time.Duration
}

// allow records the request for key and reports whether it is within the limit.
// It prunes timestamps that have fallen outside the window before deciding.
//
// When the request is blocked, reportBlock is true only for the first block
// within the window for this key. This de-duplicates observability signals so
// an attack burst from one IP yields a single WARN log + Sentry event rather
// than one per request (the access logger still records every individual 429).
func (rl *rateLimiter) allow(key string) (allowed bool, reportBlock bool) {
	actual, _ := rl.buckets.LoadOrStore(key, &rateLimitBucket{})
	b := actual.(*rateLimitBucket)
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)
	valid := b.times[:0]
	for _, t := range b.times {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	b.times = valid
	if len(b.times) >= rl.max {
		if now.Sub(b.lastReported) >= rl.window {
			b.lastReported = now
			return false, true
		}
		return false, false
	}
	b.times = append(b.times, now)
	return true, false
}

// RateLimit returns a Gin middleware that allows at most max requests per
// window from a single client IP. Exceeding the limit returns HTTP 429 with a
// generic JSON error and aborts the chain.
//
// Each call constructs its own limiter, so different endpoints get independent
// budgets (e.g. login vs. forgot-password). The client IP is taken from
// gin's c.ClientIP(), resolved from Fly-Client-IP in production and X-Real-IP
// locally (see RemoteIPHeaders in main.go). The first block per key per window
// emits a WARN log and a Sentry event so brute-force attempts are visible.
func RateLimit(max int, window time.Duration) gin.HandlerFunc {
	rl := &rateLimiter{max: max, window: window}

	// Periodically drop buckets that have gone idle so the map does not grow
	// without bound under a stream of distinct IPs.
	go func() {
		ticker := time.NewTicker(window * 2)
		defer ticker.Stop()
		for range ticker.C {
			cutoff := time.Now().Add(-window)
			rl.buckets.Range(func(k, v any) bool {
				b := v.(*rateLimitBucket)
				b.mu.Lock()
				idle := len(b.times) == 0 || b.times[len(b.times)-1].Before(cutoff)
				b.mu.Unlock()
				if idle {
					rl.buckets.Delete(k)
				}
				return true
			})
		}
	}()

	retryAfter := strconv.Itoa(int(window.Seconds()))

	return func(c *gin.Context) {
		allowed, reportBlock := rl.allow(c.ClientIP())
		if !allowed {
			if reportBlock {
				reportRateLimitExceeded(c, max, window)
			}
			c.Header("Retry-After", retryAfter)
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please wait a moment and try again.",
				"code":  "RATE_LIMITED",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

// reportRateLimitExceeded emits the once-per-window observability signal for a
// blocked client: a structured WARN log (greppable on event=rate_limit_exceeded)
// and a Sentry warning event tagged with the client IP and route. Sentry's
// global client is a safe no-op when uninitialised (e.g. in tests / no DSN).
func reportRateLimitExceeded(c *gin.Context, max int, window time.Duration) {
	clientIP := c.ClientIP()
	route := c.FullPath()

	log.Printf(`{"level":"warn","event":"rate_limit_exceeded","client_ip":%q,"method":%q,"path":%q,"limit":%d,"window":%q}`,
		clientIP, c.Request.Method, route, max, window.String())

	capture := func(scope *sentry.Scope, hub *sentry.Hub) {
		scope.SetLevel(sentry.LevelWarning)
		scope.SetTag("client_ip", clientIP)
		scope.SetTag("route", route)
		hub.CaptureMessage("Auth rate limit exceeded: " + route)
	}
	if hub := sentrygin.GetHubFromContext(c); hub != nil {
		hub.WithScope(func(scope *sentry.Scope) { capture(scope, hub) })
	} else {
		sentry.WithScope(func(scope *sentry.Scope) { capture(scope, sentry.CurrentHub()) })
	}
}
