package database

// BackfillDailyDates integration tests
//
// These tests connect to the Postgres container exposed by docker-compose.
// All fixtures are wrapped in a transaction that is rolled back after each
// test — no permanent data changes are made.
//
// The docker-compose.yml maps 5433:5432, so the DB is reachable on the host
// at localhost:5433.  Credentials come from the root .env file.
//
// Run with (from project root):
//   source .env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB \
//     go test ./backend/internal/database/ -run TestBackfill -v
//
// Or use the helper script:
//   ./scripts/test-backfill.sh
//
// Defaults applied when env vars are absent:
//   DB_HOST=localhost  DB_PORT=5433  DB_USER=dailybible_user
//   DB_NAME=daily_bible_dev  DB_SSLMODE=disable

import (
	"fmt"
	"os"
	"testing"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"

	"gorm.io/gorm"
)

// setDefaultEnv sets an env var only when it is not already set in the
// environment. This lets callers override any value without editing the test.
func setDefaultEnv(key, value string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, value)
	}
}

// openTestDB opens a connection to the Docker Postgres container. Credentials
// are taken from the environment; non-secret defaults are applied for anything
// not already set. DB_NAME falls back to POSTGRES_DB (the var used in the root
// .env). Skips (not fails) when the DB is unreachable so the suite stays green
// in CI where the container is unavailable.
func openTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	setDefaultEnv("DB_HOST", "localhost")
	setDefaultEnv("DB_PORT", "5433") // docker-compose maps 5433:5432
	setDefaultEnv("DB_USER", "dailybible_user")
	// DB_NAME may be set as POSTGRES_DB in the root .env; accept either name.
	if os.Getenv("DB_NAME") == "" {
		if pg := os.Getenv("POSTGRES_DB"); pg != "" {
			os.Setenv("DB_NAME", pg)
		} else {
			os.Setenv("DB_NAME", "daily_bible_dev")
		}
	}
	setDefaultEnv("DB_SSLMODE", "disable")
	// DB_PASSWORD intentionally not defaulted — must come from the environment.

	if os.Getenv("DB_PASSWORD") == "" {
		t.Skip("DB_PASSWORD not set — run: source .env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB go test ./internal/database/ -run TestBackfill -v")
	}

	cfg, err := config.Load()
	if err != nil {
		t.Skipf("config.Load failed (DB not available): %v", err)
	}
	db, err := Connect(cfg)
	if err != nil {
		t.Skipf("DB connect failed (DB not available): %v", err)
	}
	return db
}

// TestBackfillDailyDates_BackfillsNullRows — the happy path: a verse with
// daily_date IS NULL receives the correct derived date from viewed_at.
//
// viewed_at = 2026-02-16T15:00:00Z  →  UTC-10 effective = 2026-02-16
func TestBackfillDailyDates_BackfillsNullRows(t *testing.T) {
	db := openTestDB(t)

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Begin: %v", tx.Error)
	}
	defer tx.Rollback()

	// Temporarily disable FK enforcement so we can insert history rows
	// without needing a real user row in this transaction.
	tx.Exec("SET session_replication_role = 'replica'")

	uniqueRef := fmt.Sprintf("TestBackfillA %d:1", time.Now().UnixNano())
	verse := models.Verse{
		Reference:   uniqueRef,
		Text:        "test",
		Book:        "Test",
		Chapter:     1,
		VerseNumber: 1,
		Version:     "KJV",
		Translation: "KJV",
		DailyDate:   nil,
	}
	if err := tx.Create(&verse).Error; err != nil {
		t.Fatalf("create verse: %v", err)
	}

	// viewed_at 15:00 UTC → UTC-10 effective time is 05:00, same calendar day
	hist := models.History{
		UserID:   1,
		VerseID:  verse.ID,
		ViewedAt: time.Date(2026, 2, 16, 15, 0, 0, 0, time.UTC),
	}
	if err := tx.Create(&hist).Error; err != nil {
		t.Fatalf("create history: %v", err)
	}

	n, err := BackfillDailyDates(tx)
	if err != nil {
		t.Fatalf("BackfillDailyDates: %v", err)
	}
	if n == 0 {
		t.Error("expected ≥1 rows updated, got 0")
	}
	t.Logf("updated %d row(s)", n)

	var got models.Verse
	if err := tx.First(&got, verse.ID).Error; err != nil {
		t.Fatalf("reload: %v", err)
	}
	if got.DailyDate == nil {
		t.Fatal("daily_date still NULL after backfill")
	}
	date := *got.DailyDate
	if len(date) > 10 {
		date = date[:10]
	}
	if date != "2026-02-16" {
		t.Errorf("daily_date: got %q, want %q", date, "2026-02-16")
	} else {
		t.Logf("✅ daily_date = %q (correct)", date)
	}
}

// TestBackfillDailyDates_RollsBackAcrossMidnight — viewed_at before 10:00 UTC
// means the UTC-10 effective date is the previous calendar day.
//
// viewed_at = 2026-02-16T05:00:00Z  →  UTC-10 effective = 2026-02-15
func TestBackfillDailyDates_RollsBackAcrossMidnight(t *testing.T) {
	db := openTestDB(t)

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Begin: %v", tx.Error)
	}
	defer tx.Rollback()
	tx.Exec("SET session_replication_role = 'replica'")

	uniqueRef := fmt.Sprintf("TestBackfillMid %d:1", time.Now().UnixNano())
	verse := models.Verse{
		Reference: uniqueRef, Text: "test", Book: "Test",
		Chapter: 1, VerseNumber: 1, Version: "KJV", Translation: "KJV",
		DailyDate: nil,
	}
	if err := tx.Create(&verse).Error; err != nil {
		t.Fatalf("create verse: %v", err)
	}

	// 05:00 UTC - 10h = 19:00 the previous day UTC → date is Feb 15
	hist := models.History{
		UserID: 1, VerseID: verse.ID,
		ViewedAt: time.Date(2026, 2, 16, 5, 0, 0, 0, time.UTC),
	}
	if err := tx.Create(&hist).Error; err != nil {
		t.Fatalf("create history: %v", err)
	}

	if _, err := BackfillDailyDates(tx); err != nil {
		t.Fatalf("BackfillDailyDates: %v", err)
	}

	var got models.Verse
	if err := tx.First(&got, verse.ID).Error; err != nil {
		t.Fatalf("reload: %v", err)
	}
	if got.DailyDate == nil {
		t.Fatal("daily_date still NULL")
	}
	date := *got.DailyDate
	if len(date) > 10 {
		date = date[:10]
	}
	if date != "2026-02-15" {
		t.Errorf("daily_date: got %q, want %q (midnight-rollback failed)", date, "2026-02-15")
	} else {
		t.Logf("✅ Midnight rollback: daily_date = %q (correct)", date)
	}
}

// TestBackfillDailyDates_Idempotent — running the backfill twice must not
// change rows that were already filled on the first run.
func TestBackfillDailyDates_Idempotent(t *testing.T) {
	db := openTestDB(t)

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Begin: %v", tx.Error)
	}
	defer tx.Rollback()
	tx.Exec("SET session_replication_role = 'replica'")

	uniqueRef := fmt.Sprintf("TestBackfillIdem %d:1", time.Now().UnixNano())
	verse := models.Verse{
		Reference: uniqueRef, Text: "test", Book: "Test",
		Chapter: 1, VerseNumber: 1, Version: "KJV", Translation: "KJV",
		DailyDate: nil,
	}
	if err := tx.Create(&verse).Error; err != nil {
		t.Fatalf("create verse: %v", err)
	}

	hist := models.History{
		UserID: 1, VerseID: verse.ID,
		ViewedAt: time.Date(2026, 2, 20, 12, 0, 0, 0, time.UTC),
	}
	if err := tx.Create(&hist).Error; err != nil {
		t.Fatalf("create history: %v", err)
	}

	n1, err := BackfillDailyDates(tx)
	if err != nil {
		t.Fatalf("first run: %v", err)
	}
	t.Logf("first run: %d row(s) updated", n1)

	n2, err := BackfillDailyDates(tx)
	if err != nil {
		t.Fatalf("second run: %v", err)
	}
	t.Logf("second run: %d row(s) updated", n2)

	var got models.Verse
	if err := tx.First(&got, verse.ID).Error; err != nil {
		t.Fatalf("reload: %v", err)
	}
	if got.DailyDate == nil {
		t.Fatal("daily_date is NULL after two runs")
	}
	date := *got.DailyDate
	if len(date) > 10 {
		date = date[:10]
	}
	if date != "2026-02-20" {
		t.Errorf("date changed on second run: got %q, want %q", date, "2026-02-20")
	} else {
		t.Logf("✅ Idempotency: daily_date stable at %q after two runs", date)
	}
}

// TestBackfillDailyDates_ConflictGuard — when the derived date is already
// owned by another verse, the NULL verse must be left untouched (not updated),
// so no unique-constraint violation can occur.
func TestBackfillDailyDates_ConflictGuard(t *testing.T) {
	db := openTestDB(t)

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Begin: %v", tx.Error)
	}
	defer tx.Rollback()
	tx.Exec("SET session_replication_role = 'replica'")

	takenDate := "2026-01-10"

	// Verse A already owns 2026-01-10.
	verseA := models.Verse{
		Reference: fmt.Sprintf("TestCGA %d:1", time.Now().UnixNano()),
		Text:      "A", Book: "Test", Chapter: 1, VerseNumber: 1,
		Version: "KJV", Translation: "KJV",
		DailyDate: &takenDate,
	}
	if err := tx.Create(&verseA).Error; err != nil {
		t.Fatalf("create verseA: %v", err)
	}

	// Verse B has daily_date = NULL; its viewed_at derives the same date.
	verseB := models.Verse{
		Reference: fmt.Sprintf("TestCGB %d:1", time.Now().UnixNano()),
		Text:      "B", Book: "Test", Chapter: 1, VerseNumber: 2,
		Version: "KJV", Translation: "KJV",
		DailyDate: nil,
	}
	if err := tx.Create(&verseB).Error; err != nil {
		t.Fatalf("create verseB: %v", err)
	}

	// viewed_at 15:00 UTC → UTC-10 = 2026-01-10 (same as verseA)
	hist := models.History{
		UserID: 1, VerseID: verseB.ID,
		ViewedAt: time.Date(2026, 1, 10, 15, 0, 0, 0, time.UTC),
	}
	if err := tx.Create(&hist).Error; err != nil {
		t.Fatalf("create history: %v", err)
	}

	if _, err := BackfillDailyDates(tx); err != nil {
		t.Fatalf("BackfillDailyDates: %v", err)
	}

	var got models.Verse
	if err := tx.First(&got, verseB.ID).Error; err != nil {
		t.Fatalf("reload verseB: %v", err)
	}
	if got.DailyDate != nil {
		t.Errorf("conflict guard failed: verseB.daily_date should be NULL, got %q", *got.DailyDate)
	} else {
		t.Log("✅ Conflict guard: verseB correctly left as NULL")
	}
}

// TestBackfillDailyDates_NoHistory — a verse with no history entries at all
// must remain NULL after the backfill (EXISTS guard in the SQL).
func TestBackfillDailyDates_NoHistory(t *testing.T) {
	db := openTestDB(t)

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("Begin: %v", tx.Error)
	}
	defer tx.Rollback()

	uniqueRef := fmt.Sprintf("TestNoHist %d:1", time.Now().UnixNano())
	verse := models.Verse{
		Reference: uniqueRef, Text: "test", Book: "Test",
		Chapter: 1, VerseNumber: 1, Version: "KJV", Translation: "KJV",
		DailyDate: nil,
	}
	if err := tx.Create(&verse).Error; err != nil {
		t.Fatalf("create verse: %v", err)
	}

	// No history entries — just run the backfill.
	if _, err := BackfillDailyDates(tx); err != nil {
		t.Fatalf("BackfillDailyDates: %v", err)
	}

	var got models.Verse
	if err := tx.First(&got, verse.ID).Error; err != nil {
		t.Fatalf("reload: %v", err)
	}
	if got.DailyDate != nil {
		t.Errorf("verse with no history: daily_date should be NULL, got %q", *got.DailyDate)
	} else {
		t.Log("✅ No-history verse correctly left as NULL")
	}
}
