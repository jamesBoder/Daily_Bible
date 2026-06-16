package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// rateLimitBucket is a sliding-window counter of request timestamps for a
// single client key. Access is guarded by its own mutex so independent keys
// never contend with one another.
type rateLimitBucket struct {
	mu    sync.Mutex
	times []time.Time
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
func (rl *rateLimiter) allow(key string) bool {
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
		return false
	}
	b.times = append(b.times, now)
	return true
}

// RateLimit returns a Gin middleware that allows at most max requests per
// window from a single client IP. Exceeding the limit returns HTTP 429 with a
// generic JSON error and aborts the chain.
//
// Each call constructs its own limiter, so different endpoints get independent
// budgets (e.g. login vs. forgot-password). The client IP is taken from
// gin's c.ClientIP(), which honours the X-Forwarded-For header set by the
// Nginx proxy in front of the backend.
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
		if !rl.allow(c.ClientIP()) {
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
