package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRateLimiter_AllowWithinLimitThenBlocks(t *testing.T) {
	rl := &rateLimiter{max: 3, window: time.Minute}

	for i := 1; i <= 3; i++ {
		if !rl.allow("1.2.3.4") {
			t.Fatalf("request %d should be allowed (within max=3)", i)
		}
	}
	if rl.allow("1.2.3.4") {
		t.Fatal("4th request should be blocked once max is reached")
	}
}

func TestRateLimiter_KeysAreIndependent(t *testing.T) {
	rl := &rateLimiter{max: 1, window: time.Minute}

	if !rl.allow("1.1.1.1") {
		t.Fatal("first request for IP A should be allowed")
	}
	if rl.allow("1.1.1.1") {
		t.Fatal("second request for IP A should be blocked")
	}
	if !rl.allow("2.2.2.2") {
		t.Fatal("IP B must have its own independent budget")
	}
}

func TestRateLimiter_WindowExpiryFreesBudget(t *testing.T) {
	rl := &rateLimiter{max: 1, window: 30 * time.Millisecond}

	if !rl.allow("9.9.9.9") {
		t.Fatal("first request should be allowed")
	}
	if rl.allow("9.9.9.9") {
		t.Fatal("second request inside window should be blocked")
	}
	time.Sleep(40 * time.Millisecond)
	if !rl.allow("9.9.9.9") {
		t.Fatal("request after the window elapses should be allowed again")
	}
}

func TestRateLimit_Middleware429WithRetryAfter(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/x", RateLimit(2, time.Minute), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	do := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest(http.MethodGet, "/x", nil)
		req.RemoteAddr = "5.5.5.5:1234"
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		return w
	}

	if got := do().Code; got != http.StatusOK {
		t.Fatalf("request 1: want 200, got %d", got)
	}
	if got := do().Code; got != http.StatusOK {
		t.Fatalf("request 2: want 200, got %d", got)
	}

	w := do()
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("request 3: want 429, got %d", w.Code)
	}
	if w.Header().Get("Retry-After") != "60" {
		t.Fatalf("want Retry-After=60, got %q", w.Header().Get("Retry-After"))
	}
}
