package services

// token_service_test.go — unit tests for GenerateUnsubscribeToken / VerifyUnsubscribeToken.
//
// These tests are pure unit tests: no database, no network. They only need a
// Config with a JWTSecret, which is provided inline.
//
// Run from the backend/ directory:
//   go test ./internal/services/ -run TestUnsubscribeToken -v

import (
	"testing"
	"time"

	"dailybible/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

func testTokenConfig() *config.Config {
	return &config.Config{JWTSecret: "test-secret-for-token-unit-tests-only"}
}

// TestUnsubscribeToken_RoundTrip verifies that a token generated for a given
// userID can be verified and returns the same userID.
func TestUnsubscribeToken_RoundTrip(t *testing.T) {
	tc := NewTokenService(testTokenConfig())
	const userID uint = 42

	tokenStr, err := tc.GenerateUnsubscribeToken(userID)
	if err != nil {
		t.Fatalf("GenerateUnsubscribeToken: %v", err)
	}

	gotID, err := tc.VerifyUnsubscribeToken(tokenStr)
	if err != nil {
		t.Fatalf("VerifyUnsubscribeToken: %v", err)
	}
	if gotID != userID {
		t.Fatalf("expected userID %d, got %d", userID, gotID)
	}
	t.Logf("✅ unsubscribe token round-trip: userID %d verified", gotID)
}

// TestUnsubscribeToken_WrongType verifies that a regular auth token (type ≠ "unsub")
// is rejected by VerifyUnsubscribeToken.
func TestUnsubscribeToken_WrongType(t *testing.T) {
	tc := NewTokenService(testTokenConfig())

	// Generate a standard auth token — it has no "type":"unsub" field.
	authToken, err := tc.GenerateToken(99, "auth@example.com")
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}

	_, err = tc.VerifyUnsubscribeToken(authToken)
	if err == nil {
		t.Fatal("expected error when verifying a regular auth token as unsub token, got nil")
	}
	t.Logf("✅ auth token correctly rejected by VerifyUnsubscribeToken: %v", err)
}

// TestUnsubscribeToken_Expired verifies that a token with a past expiry is rejected.
func TestUnsubscribeToken_Expired(t *testing.T) {
	tc := NewTokenService(testTokenConfig())

	// Manually craft a token that expired 1 hour ago.
	claims := &UnsubClaims{
		UserID: 1,
		Type:   "unsub",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	expired, err := tok.SignedString([]byte(tc.config.JWTSecret))
	if err != nil {
		t.Fatalf("SignedString: %v", err)
	}

	_, err = tc.VerifyUnsubscribeToken(expired)
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
	t.Logf("✅ expired unsubscribe token correctly rejected: %v", err)
}
