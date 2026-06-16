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
		if allowed, _ := rl.allow("1.2.3.4"); !allowed {
			t.Fatalf("request %d should be allowed (within max=3)", i)
		}
	}
	if allowed, _ := rl.allow("1.2.3.4"); allowed {
		t.Fatal("4th request should be blocked once max is reached")
	}
}

func TestRateLimiter_KeysAreIndependent(t *testing.T) {
	rl := &rateLimiter{max: 1, window: time.Minute}

	if allowed, _ := rl.allow("1.1.1.1"); !allowed {
		t.Fatal("first request for IP A should be allowed")
	}
	if allowed, _ := rl.allow("1.1.1.1"); allowed {
		t.Fatal("second request for IP A should be blocked")
	}
	if allowed, _ := rl.allow("2.2.2.2"); !allowed {
		t.Fatal("IP B must have its own independent budget")
	}
}

func TestRateLimiter_WindowExpiryFreesBudget(t *testing.T) {
	rl := &rateLimiter{max: 1, window: 30 * time.Millisecond}

	if allowed, _ := rl.allow("9.9.9.9"); !allowed {
		t.Fatal("first request should be allowed")
	}
	if allowed, _ := rl.allow("9.9.9.9"); allowed {
		t.Fatal("second request inside window should be blocked")
	}
	time.Sleep(40 * time.Millisecond)
	if allowed, _ := rl.allow("9.9.9.9"); !allowed {
		t.Fatal("request after the window elapses should be allowed again")
	}
}

func TestRateLimiter_ReportBlockOncePerWindow(t *testing.T) {
	rl := &rateLimiter{max: 1, window: time.Minute}

	if _, report := rl.allow("7.7.7.7"); report {
		t.Fatal("an allowed request must not trigger a report")
	}
	if allowed, report := rl.allow("7.7.7.7"); allowed || !report {
		t.Fatalf("first block should report: allowed=%v report=%v", allowed, report)
	}
	if _, report := rl.allow("7.7.7.7"); report {
		t.Fatal("subsequent blocks within the window must not report again")
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
