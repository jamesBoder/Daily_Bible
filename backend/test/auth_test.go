package journaltest

// auth_test.go — integration tests for the public auth endpoints.
//
// Covers two security-relevant behaviours of the auth surface:
//   1. forgot-username returns an identical generic response whether or not the
//      email exists (no user enumeration).
//   2. login is rate-limited per client IP (429 + Retry-After once the budget
//      is exhausted), mirroring the production limits wired in routes.go.
//
// Same package as journal_test.go, so it reuses sharedDB, doPost, and parseBody.

import (
	"net/http"
	"testing"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/handlers"
	"dailybible/internal/middleware"
	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

const authTestUserID uint = 44441

// setupAuthRouter wires the AuthHandler with the same per-route rate limits as
// production (login 10/min, forgot-username 5/15min). Each call builds a fresh
// engine, so each test starts with empty rate-limit buckets.
func setupAuthRouter() *gin.Engine {
	cfg := &config.Config{JWTSecret: "auth-test-secret"}
	h := handlers.NewAuthHandler(
		repository.NewUserRepository(sharedDB),
		services.NewTokenService(cfg),
		services.NewEmailValidationService(),
		// Invalid key — SendUsernameReminderEmail fails internally but the
		// handler logs and still returns the generic response, which is what
		// these tests assert.
		services.NewEmailService("invalid-test-key-do-not-use", "test@test.local", "http://localhost"),
		repository.NewPasswordHistoryRepository(sharedDB),
	)

	r := gin.New()
	auth := r.Group("/api/auth")
	auth.POST("/login", middleware.RateLimit(10, time.Minute), h.Login)
	auth.POST("/forgot-username", middleware.RateLimit(5, 15*time.Minute), h.ForgotUsername)
	return r
}

func createAuthTestUser(t *testing.T) string {
	t.Helper()
	email := "authtest_44441@test.local"
	if err := sharedDB.Exec(
		`INSERT INTO users (id, email, username, google_id, is_google_linked, email_verified, preferred_language, created_at, updated_at)
		 VALUES (?, ?, 'authtest_user', 'auth_google_44441', true, true, 'en', NOW(), NOW())
		 ON CONFLICT (id) DO NOTHING`,
		authTestUserID, email,
	).Error; err != nil {
		t.Fatalf("createAuthTestUser: %v", err)
	}
	t.Cleanup(func() { sharedDB.Exec("DELETE FROM users WHERE id = ?", authTestUserID) })
	return email
}

// TestAuth_ForgotUsername_NoEnumeration verifies the response is identical for
// an existing and a non-existing email — the anti-enumeration guarantee.
func TestAuth_ForgotUsername_NoEnumeration(t *testing.T) {
	r := setupAuthRouter()
	existing := createAuthTestUser(t)

	wExisting := doPost(r, "/api/auth/forgot-username", map[string]string{"email": existing})
	wMissing := doPost(r, "/api/auth/forgot-username", map[string]string{"email": "does-not-exist-44441@test.local"})

	if wExisting.Code != http.StatusOK || wMissing.Code != http.StatusOK {
		t.Fatalf("expected 200 for both, got existing=%d missing=%d", wExisting.Code, wMissing.Code)
	}

	msgExisting := parseBody(t, wExisting)["message"]
	msgMissing := parseBody(t, wMissing)["message"]
	if msgExisting == nil || msgExisting != msgMissing {
		t.Fatalf("responses must be identical to prevent enumeration: existing=%q missing=%q", msgExisting, msgMissing)
	}
}

// TestAuth_Login_RateLimited verifies login is throttled per IP: the first 10
// requests pass through to the handler (401 for bad credentials), and the 11th
// is rejected with 429 + Retry-After before reaching the handler.
func TestAuth_Login_RateLimited(t *testing.T) {
	r := setupAuthRouter()
	body := map[string]string{"email": "ratelimit-probe-44441@test.local", "password": "wrong-password"}

	for i := 1; i <= 10; i++ {
		w := doPost(r, "/api/auth/login", body)
		if w.Code != http.StatusUnauthorized {
			t.Fatalf("request %d: want 401 (bad creds, within limit), got %d", i, w.Code)
		}
	}

	w := doPost(r, "/api/auth/login", body)
	if w.Code != http.StatusTooManyRequests {
		t.Fatalf("request 11: want 429 (rate limited), got %d", w.Code)
	}
	if w.Header().Get("Retry-After") == "" {
		t.Fatal("429 response must include a Retry-After header")
	}
	if code := parseBody(t, w)["code"]; code != "RATE_LIMITED" {
		t.Fatalf("want code RATE_LIMITED, got %v", code)
	}
}
