package journaltest

// reminder_test.go — integration tests for the email reminder system.
//
// These tests connect to the Postgres container and the Resend API (with an
// intentionally invalid key for send-failure tests). They share the DB
// connection initialised by TestMain in testmain_test.go.
//
// Run from the backend/ directory (with Docker DB running):
//   source ../.env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB \
//     go test ./test/ -run TestScheduler -v
//   go test ./test/ -run TestUnsubscribeHandler -v

import (
	"context"
	"fmt"
	"net/http"
	"testing"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── User IDs ─────────────────────────────────────────────────────────────────
// Chosen to avoid collisions with IDs used in other test files.

const (
	rUserEligible  uint = 88880 // fully eligible user
	rUserUnverif   uint = 88881 // email_verified = false
	rUserNoEmail   uint = 88882 // email_notifications = false
	rUserNoRemind  uint = 88883 // daily_verse_reminder = false
	rUserTZ        uint = 88884 // timezone-filter test
	rUserDedup     uint = 88885 // deduplication test
	rUserVerse     uint = 88886 // verse-failure test
	rUserSendFail  uint = 88887 // send-failure test (separate from eligibility)
	rUserUnsub     uint = 88888 // unsubscribe handler test
)

// ── DB helpers ────────────────────────────────────────────────────────────────

func createReminderUser(t *testing.T, db *gorm.DB, userID uint, emailVerified bool) {
	t.Helper()
	var count int64
	db.Raw("SELECT COUNT(*) FROM users WHERE id = ?", userID).Scan(&count)
	if count > 0 {
		return
	}
	err := db.Exec(`
		INSERT INTO users (id, email, username, google_id, is_google_linked,
		                   email_verified, preferred_language, created_at, updated_at)
		VALUES (?, ?, ?, ?, true, ?, 'en', NOW(), NOW())
		ON CONFLICT (id) DO NOTHING`,
		userID,
		fmt.Sprintf("reminder_test_%d@test.local", userID),
		fmt.Sprintf("reminder_user_%d", userID),
		fmt.Sprintf("reminder_google_%d", userID),
		emailVerified,
	).Error
	if err != nil {
		t.Fatalf("createReminderUser %d: %v", userID, err)
	}
}

func createReminderSettings(t *testing.T, db *gorm.DB, userID uint, emailNotif, dailyRemind bool, tz string) {
	t.Helper()
	db.Exec("DELETE FROM user_settings WHERE user_id = ?", userID)
	err := db.Exec(`
		INSERT INTO user_settings
		    (user_id, email_notifications, daily_verse_reminder, preferred_timezone,
		     preferred_language, preferred_bible_version, dark_mode, active_theme,
		     created_at, updated_at)
		VALUES (?, ?, ?, ?, 'en', 'kjv', false, 'parchment', NOW(), NOW())
		ON CONFLICT (user_id) DO UPDATE SET
		    email_notifications  = EXCLUDED.email_notifications,
		    daily_verse_reminder = EXCLUDED.daily_verse_reminder,
		    preferred_timezone   = EXCLUDED.preferred_timezone`,
		userID, emailNotif, dailyRemind, tz,
	).Error
	if err != nil {
		t.Fatalf("createReminderSettings %d: %v", userID, err)
	}
}

// cleanupReminderUsers hard-deletes all test-generated rows for the given IDs.
func cleanupReminderUsers(db *gorm.DB, ids ...uint) {
	for _, id := range ids {
		db.Exec("DELETE FROM email_reminder_logs WHERE user_id = ?", id)
		db.Exec("DELETE FROM user_settings WHERE user_id = ?", id)
		db.Exec("DELETE FROM users WHERE id = ?", id)
	}
}

// seedTodayVerse ensures a verse row with today's date (UTC-10 boundary) exists.
// It inserts a minimal test verse if none is present. Idempotent.
// Returns today's date string. Skips the test if the verse cannot be made available.
func seedTodayVerse(t *testing.T, db *gorm.DB) string {
	t.Helper()
	today := time.Now().UTC().Add(-10 * time.Hour).Format("2006-01-02")

	// Try to insert a test verse; silently skip if today's date or the reference
	// is already taken (ON CONFLICT DO NOTHING covers both unique indexes).
	db.Exec(`
		INSERT INTO verses
		    (reference, text, book, chapter, verse_number,
		     version, translation, daily_date, created_at, updated_at)
		VALUES
		    ('Reminder Test 99:99', 'For this is a test verse.', 'Reminder Test',
		     99, 99, 'KJV', 'KJV', ?, NOW(), NOW())
		ON CONFLICT DO NOTHING`, today)

	var count int64
	db.Raw("SELECT COUNT(*) FROM verses WHERE daily_date = ?", today).Scan(&count)
	if count == 0 {
		t.Skip("no verse available for today — skipping scheduler integration test")
	}
	return today
}

// ── Scheduler factory helpers ─────────────────────────────────────────────────

func newReminderCfg(sendHour int) *config.Config {
	return &config.Config{
		JWTSecret:         "reminder-test-jwt-secret",
		ReminderEnabled:   true,
		ReminderSendHour:  sendHour,
		ReminderBatchSize: 100,
		FrontendURL:       "http://localhost",
	}
}

// newFailingEmailService returns an EmailService whose Send calls always fail
// because the API key is intentionally invalid. This triggers the "failed" log
// path in the scheduler without actually delivering any email.
//
// NOTE: this makes a real HTTP request to Resend that returns 401 quickly.
func newFailingEmailService() *services.EmailService {
	return services.NewEmailService("invalid-test-key-do-not-use", "test@test.local", "http://localhost")
}

func newTestDailyVerseService(db *gorm.DB) *services.DailyVerseService {
	verseRepo := repository.NewVerseRepository(db)
	bibleAPI := services.NewBibleAPIService("", "", "")
	return services.NewDailyVerseService(bibleAPI, verseRepo)
}

// utcHour returns the current UTC hour (0-23).
func utcHour() int { return time.Now().UTC().Hour() }

// ── Scheduler tests ───────────────────────────────────────────────────────────

// TestSchedulerEligibility verifies that only users who are:
//   - email_verified = true
//   - email_notifications = true
//   - daily_verse_reminder = true
//
// are processed by SendBatch. Users missing any flag must not receive a log entry.
func TestSchedulerEligibility(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() {
		cleanupReminderUsers(db, rUserEligible, rUserUnverif, rUserNoEmail, rUserNoRemind)
	})

	// User A — eligible
	createReminderUser(t, db, rUserEligible, true)
	createReminderSettings(t, db, rUserEligible, true, true, "UTC")

	// User B — not email-verified
	createReminderUser(t, db, rUserUnverif, false)
	createReminderSettings(t, db, rUserUnverif, true, true, "UTC")

	// User C — email notifications off
	createReminderUser(t, db, rUserNoEmail, true)
	createReminderSettings(t, db, rUserNoEmail, false, true, "UTC")

	// User D — daily reminder off
	createReminderUser(t, db, rUserNoRemind, true)
	createReminderSettings(t, db, rUserNoRemind, true, false, "UTC")

	seedTodayVerse(t, db)

	cfg := newReminderCfg(utcHour())
	scheduler := services.NewReminderScheduler(
		db,
		newFailingEmailService(),
		newTestDailyVerseService(db),
		services.NewTokenService(cfg),
		cfg,
	)
	scheduler.SendBatch(context.Background())

	// User A must have a log entry (status may be "failed" — bad key is expected).
	var logA models.EmailReminderLog
	if err := db.Where("user_id = ?", rUserEligible).First(&logA).Error; err != nil {
		t.Fatalf("eligible user should have a log entry, got none: %v", err)
	}

	// Users B, C, D must have no log entries.
	for name, id := range map[string]uint{
		"unverified":           rUserUnverif,
		"email_notif=false":    rUserNoEmail,
		"daily_reminder=false": rUserNoRemind,
	} {
		var count int64
		db.Raw("SELECT COUNT(*) FROM email_reminder_logs WHERE user_id = ?", id).Scan(&count)
		if count > 0 {
			t.Errorf("ineligible user %s (id=%d) should have no log entry, got %d", name, id, count)
		}
	}
	t.Logf("✅ only eligible user processed; status=%q", logA.Status)
}

// TestSchedulerTimezoneFilter verifies that a user whose local hour does NOT
// match ReminderSendHour is skipped and receives no log entry.
func TestSchedulerTimezoneFilter(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserTZ) })

	createReminderUser(t, db, rUserTZ, true)
	createReminderSettings(t, db, rUserTZ, true, true, "UTC")

	seedTodayVerse(t, db)

	// Send hour 25 is outside 0–23 and will never match time.Now().Hour().
	cfg := newReminderCfg(25)
	scheduler := services.NewReminderScheduler(
		db,
		newFailingEmailService(),
		newTestDailyVerseService(db),
		services.NewTokenService(cfg),
		cfg,
	)
	scheduler.SendBatch(context.Background())

	var count int64
	db.Raw("SELECT COUNT(*) FROM email_reminder_logs WHERE user_id = ?", rUserTZ).Scan(&count)
	if count > 0 {
		t.Fatalf("user should be skipped when send_hour=25 ≠ local hour, got %d log entries", count)
	}
	t.Logf("✅ user skipped — local UTC hour %d does not match send_hour=25", utcHour())
}

// TestSchedulerDeduplication verifies that a second SendBatch call on the same
// calendar day writes no new log row — the (user_id, sent_date) unique constraint
// is the final safety net.
func TestSchedulerDeduplication(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserDedup) })

	createReminderUser(t, db, rUserDedup, true)
	createReminderSettings(t, db, rUserDedup, true, true, "UTC")

	today := seedTodayVerse(t, db)

	// Pre-insert today's log entry as if already sent.
	db.Create(&models.EmailReminderLog{
		UserID:   rUserDedup,
		SentDate: today,
		SentAt:   time.Now(),
		Status:   "sent",
	})

	cfg := newReminderCfg(utcHour())
	scheduler := services.NewReminderScheduler(
		db,
		newFailingEmailService(),
		newTestDailyVerseService(db),
		services.NewTokenService(cfg),
		cfg,
	)
	scheduler.SendBatch(context.Background())

	// Must still be exactly 1 log entry — no duplicate.
	var count int64
	db.Raw("SELECT COUNT(*) FROM email_reminder_logs WHERE user_id = ? AND sent_date = ?",
		rUserDedup, today).Scan(&count)
	if count != 1 {
		t.Fatalf("expected exactly 1 log entry after dedup check, got %d", count)
	}
	t.Logf("✅ deduplication prevents second send on %s", today)
}

// TestSchedulerVerseFailure verifies that SendBatch skips the entire batch and
// writes no log entries when GetDailyVerse cannot return a verse.
//
// DailyVerseService falls back to finding a verse by reference even when the
// daily_date column is NULL, so this test only runs in environments where no
// curated verse exists in the DB at all (e.g. a freshly created CI database).
// In the live Docker environment with a seeded verse table it is automatically
// skipped — the skip message explains why.
func TestSchedulerVerseFailure(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserVerse) })

	// DailyVerseService with empty API key.
	verseRepo := repository.NewVerseRepository(db)
	dailyVerseService := services.NewDailyVerseService(
		services.NewBibleAPIService("", "", ""),
		verseRepo,
	)

	// Skip when the service can resolve a verse even without a real API key
	// (i.e. the verse table is seeded — GetDailyVerse succeeds via GetByReference).
	if _, err := dailyVerseService.GetDailyVerse(); err == nil {
		t.Skip("verse table is seeded — GetDailyVerse succeeds by reference; " +
			"verse-failure path requires a database with no curated verses")
	}

	createReminderUser(t, db, rUserVerse, true)
	createReminderSettings(t, db, rUserVerse, true, true, "UTC")

	cfg := newReminderCfg(utcHour())
	scheduler := services.NewReminderScheduler(
		db,
		newFailingEmailService(),
		dailyVerseService,
		services.NewTokenService(cfg),
		cfg,
	)
	scheduler.SendBatch(context.Background())

	var count int64
	db.Raw("SELECT COUNT(*) FROM email_reminder_logs WHERE user_id = ?", rUserVerse).Scan(&count)
	if count > 0 {
		t.Fatalf("expected no log entries when verse unavailable, got %d", count)
	}
	t.Logf("✅ batch skipped cleanly when daily verse is unavailable")
}

// TestSchedulerSendFailure verifies that when the email send fails, the
// scheduler writes a log entry with status="failed" and a non-empty Error
// field, and does not panic or stop processing subsequent users.
func TestSchedulerSendFailure(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserSendFail) })

	createReminderUser(t, db, rUserSendFail, true)
	createReminderSettings(t, db, rUserSendFail, true, true, "UTC")
	seedTodayVerse(t, db)

	cfg := newReminderCfg(utcHour())
	scheduler := services.NewReminderScheduler(
		db,
		newFailingEmailService(), // invalid API key → Resend returns 401
		newTestDailyVerseService(db),
		services.NewTokenService(cfg),
		cfg,
	)
	scheduler.SendBatch(context.Background())

	var log models.EmailReminderLog
	if err := db.Where("user_id = ?", rUserSendFail).First(&log).Error; err != nil {
		t.Fatalf("expected a log entry for failed send, got none: %v", err)
	}
	if log.Status != "failed" {
		t.Fatalf("expected status 'failed', got %q", log.Status)
	}
	if log.Error == "" {
		t.Fatal("expected non-empty Error field on failed log entry")
	}
	t.Logf("✅ send failure logged: status=%q error=%q", log.Status, log.Error)
}

// ── Unsubscribe handler tests ─────────────────────────────────────────────────

func setupUnsubscribeRouter(t *testing.T, db *gorm.DB, userID uint) (*gin.Engine, *services.TokenService) {
	t.Helper()
	createReminderUser(t, db, userID, true)
	// Ensure settings row exists so UpdateUserSettings has something to UPDATE.
	createReminderSettings(t, db, userID, true, true, "UTC")

	gin.SetMode(gin.TestMode)
	cfg := &config.Config{JWTSecret: "unsub-handler-test-secret"}
	settingsService := services.NewSettingsService(db)
	tokenService := services.NewTokenService(cfg)
	h := handlers.NewSettingsHandler(settingsService, tokenService)

	r := gin.New()
	r.GET("/api/settings/unsubscribe", h.Unsubscribe)
	return r, tokenService
}

// TestUnsubscribeHandler_ValidToken verifies that a valid unsubscribe token
// flips daily_verse_reminder to false and redirects to /settings?unsubscribed=true.
func TestUnsubscribeHandler_ValidToken(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserUnsub) })

	r, tokenService := setupUnsubscribeRouter(t, db, rUserUnsub)

	token, err := tokenService.GenerateUnsubscribeToken(rUserUnsub)
	if err != nil {
		t.Fatalf("GenerateUnsubscribeToken: %v", err)
	}

	w := doGet(r, "/api/settings/unsubscribe?token="+token)

	if w.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d: %s", w.Code, w.Body.String())
	}
	loc := w.Header().Get("Location")
	if loc != "/settings?unsubscribed=true" {
		t.Fatalf("expected redirect to /settings?unsubscribed=true, got %q", loc)
	}

	// Verify daily_verse_reminder was flipped to false in the DB.
	var s models.UserSettings
	if err := db.Where("user_id = ?", rUserUnsub).First(&s).Error; err != nil {
		t.Fatalf("could not fetch settings after unsubscribe: %v", err)
	}
	if s.DailyVerseReminder {
		t.Fatal("expected daily_verse_reminder=false after unsubscribe, still true")
	}
	t.Logf("✅ valid token → redirect to /settings?unsubscribed=true, daily_verse_reminder=false")
}

// TestUnsubscribeHandler_MissingToken verifies that a request with no token
// query parameter is redirected to the invalid-token error page.
func TestUnsubscribeHandler_MissingToken(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserUnsub) })

	r, _ := setupUnsubscribeRouter(t, db, rUserUnsub)

	w := doGet(r, "/api/settings/unsubscribe")

	if w.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", w.Code)
	}
	loc := w.Header().Get("Location")
	if loc != "/settings?unsubscribe=invalid" {
		t.Fatalf("expected redirect to /settings?unsubscribe=invalid, got %q", loc)
	}
	t.Logf("✅ missing token → redirect to /settings?unsubscribe=invalid")
}

// TestUnsubscribeHandler_InvalidToken verifies that a tampered or garbage
// token is rejected and redirected to the invalid-token error page.
func TestUnsubscribeHandler_InvalidToken(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupReminderUsers(db, rUserUnsub) })

	r, _ := setupUnsubscribeRouter(t, db, rUserUnsub)

	w := doGet(r, "/api/settings/unsubscribe?token=this.is.not.a.valid.jwt")

	if w.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", w.Code)
	}
	loc := w.Header().Get("Location")
	if loc != "/settings?unsubscribe=invalid" {
		t.Fatalf("expected redirect to /settings?unsubscribe=invalid, got %q", loc)
	}
	t.Logf("✅ invalid token → redirect to /settings?unsubscribe=invalid")
}
