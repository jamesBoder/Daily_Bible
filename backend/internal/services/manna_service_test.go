package services_test

// Manna service integration tests
//
// These tests connect to the Postgres container exposed by docker-compose and
// read the (already-seeded) manna_words table read-only — no fixtures needed.
//
// Prerequisites:
//   docker-compose up -d db
//
// Run (from the backend/ directory):
//
//   source ../.env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB \
//     go test ./internal/services/ -run TestManna -v

import (
	"os"
	"testing"

	"dailybible/internal/config"
	"dailybible/internal/database"
	"dailybible/internal/services"

	"gorm.io/gorm"
)

// openMannaTestDB opens a test DB and skips the test if unavailable.
// setEnvDefault is shared from community_service_test.go (same package).
func openMannaTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	setEnvDefault("DB_HOST", "localhost")
	setEnvDefault("DB_PORT", "5433")
	setEnvDefault("DB_USER", "dailybible_user")
	if os.Getenv("DB_NAME") == "" {
		if pg := os.Getenv("POSTGRES_DB"); pg != "" {
			os.Setenv("DB_NAME", pg)
		} else {
			os.Setenv("DB_NAME", "daily_bible_dev")
		}
	}
	setEnvDefault("DB_SSLMODE", "disable")

	if os.Getenv("DB_PASSWORD") == "" {
		t.Skip("DB_PASSWORD not set — run: source .env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB go test ./internal/services/ -run TestManna -v")
	}

	cfg, err := config.Load()
	if err != nil {
		t.Skipf("config.Load failed: %v", err)
	}
	db, err := database.Connect(cfg)
	if err != nil {
		t.Skipf("DB connect failed (DB not available): %v", err)
	}
	return db
}

// TestManna_GuestWordDiffersFromSignedInWord guards against a real bug found
// 2026-09-16: guest and signed-in play used the exact same date-seeded word,
// so a guest could exhaust their free guesses (or solve it) to see today's
// answer revealed, then sign in and "solve" the identical signed-in daily
// puzzle they'd already been told the answer to.
func TestManna_GuestWordDiffersFromSignedInWord(t *testing.T) {
	db := openMannaTestDB(t)
	svc := services.NewMannaService(db, services.NewBlessingsService(db))

	signedInWord, err := svc.GetTodayWord()
	if err != nil {
		t.Fatalf("GetTodayWord: %v", err)
	}

	// Force the guest word to be revealed via a deliberately-wrong final guess.
	result, err := svc.EvaluateGuestGuess("ZZZZZ", true)
	if err != nil {
		t.Fatalf("EvaluateGuestGuess: %v", err)
	}
	if result.Answer == nil {
		t.Fatal("expected guest word to be revealed on final wrong guess, got nil Answer")
	}

	if *result.Answer == signedInWord.Word {
		t.Fatalf("guest word must not match the signed-in daily word, both were %q", signedInWord.Word)
	}
}

// TestManna_GuestWordIsDeterministic verifies the guest word is stable across
// calls for the same day (same PRNG-and-cache guarantee as the signed-in word).
func TestManna_GuestWordIsDeterministic(t *testing.T) {
	db := openMannaTestDB(t)
	svc := services.NewMannaService(db, services.NewBlessingsService(db))

	first, err := svc.EvaluateGuestGuess("ZZZZZ", true)
	if err != nil {
		t.Fatalf("EvaluateGuestGuess (1): %v", err)
	}
	second, err := svc.EvaluateGuestGuess("ZZZZZ", true)
	if err != nil {
		t.Fatalf("EvaluateGuestGuess (2): %v", err)
	}
	if first.Answer == nil || second.Answer == nil || *first.Answer != *second.Answer {
		t.Fatalf("guest word should be stable within the same day, got %v then %v", first.Answer, second.Answer)
	}
}
