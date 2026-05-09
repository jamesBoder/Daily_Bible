package journaltest

// Phase 7 — Settings backend tests
//
// Covers the active_theme field added to UserSettings and the dark_mode
// derivation logic in the UpdateSettings handler.
//
// Lives in the same package as journal_test.go so it inherits setupTestDB,
// injectUser, doGet, doPut, parseBody, and the other HTTP helpers.

import (
	"fmt"
	"net/http"
	"testing"

	"dailybible/internal/config"
	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Constants ─────────────────────────────────────────────────────────────────

// Separate IDs from journal/unlock tests to avoid cross-test interference.
const settingsUserID uint = 77771

// ── User helpers ──────────────────────────────────────────────────────────────

// createSettingsTestUser inserts a minimal User row so that the FK constraint
// on user_settings.user_id is satisfied. Uses a fake GoogleID to bypass the
// password-hashing BeforeCreate hook (OAuth users don't need a password).
func createSettingsTestUser(t *testing.T, db *gorm.DB, userID uint) {
	t.Helper()
	googleID := "settings_test_google_" + fmt.Sprintf("%d", userID)
	email := fmt.Sprintf("settings_test_%d@test.local", userID)

	// Upsert-style: only insert if the user doesn't already exist.
	var count int64
	db.Raw("SELECT COUNT(*) FROM users WHERE id = ?", userID).Scan(&count)
	if count > 0 {
		return
	}

	// Insert with explicit ID via raw SQL to bypass GORM's auto-increment and
	// the BeforeCreate password hook.
	err := db.Exec(
		`INSERT INTO users (id, email, username, google_id, is_google_linked, email_verified, preferred_language, created_at, updated_at)
		 VALUES (?, ?, ?, ?, true, true, 'en', NOW(), NOW())
		 ON CONFLICT (id) DO NOTHING`,
		userID, email, "settings_test_user", googleID,
	).Error
	if err != nil {
		t.Fatalf("createSettingsTestUser: %v", err)
	}
}

// cleanupSettingsTestUser hard-deletes the synthetic user row created by
// createSettingsTestUser. Called as part of test cleanup.
func cleanupSettingsTestUser(db *gorm.DB, userID uint) {
	db.Exec("DELETE FROM users WHERE id = ?", userID)
}

// ── Setup ─────────────────────────────────────────────────────────────────────

// setupSettingsRouter wires a minimal router for settings endpoints,
// injecting userID as the authenticated user. It also creates the synthetic
// test user row so the FK constraint on user_settings.user_id is satisfied.
func setupSettingsRouter(t *testing.T, db *gorm.DB, userID uint) *gin.Engine {
	t.Helper()
	createSettingsTestUser(t, db, userID)
	gin.SetMode(gin.TestMode)
	settingsService := services.NewSettingsService(db)
	tokenService := services.NewTokenService(&config.Config{JWTSecret: "settings-test-secret"})
	h := handlers.NewSettingsHandler(settingsService, tokenService)

	r := gin.New()
	api := r.Group("/api")
	api.Use(injectUser(userID))
	{
		api.GET("/settings", h.GetSettings)
		api.PUT("/settings", h.UpdateSettings)
	}
	return r
}

// setupSettingsRouterNoAuth wires the same routes without any auth middleware,
// so handlers will find no userID in context and return 401.
func setupSettingsRouterNoAuth(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	settingsService := services.NewSettingsService(db)
	tokenService := services.NewTokenService(&config.Config{JWTSecret: "settings-test-secret"})
	h := handlers.NewSettingsHandler(settingsService, tokenService)

	r := gin.New()
	api := r.Group("/api")
	{
		api.GET("/settings", h.GetSettings)
		api.PUT("/settings", h.UpdateSettings)
	}
	return r
}

// cleanupSettings hard-deletes all settings records and the synthetic test user
// so each test run starts from a clean slate.
func cleanupSettings(db *gorm.DB) {
	db.Unscoped().Where("user_id = ?", settingsUserID).Delete(&models.UserSettings{})
	cleanupSettingsTestUser(db, settingsUserID)
}

// ── GET /api/settings ─────────────────────────────────────────────────────────

func TestGetSettings_ReturnsActiveThemeField(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	w := doGet(r, "/api/settings")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	theme, ok := body["active_theme"]
	if !ok {
		t.Fatalf("response missing 'active_theme' field: %v", body)
	}
	// Default for new users is 'parchment'
	if theme != "parchment" {
		t.Fatalf("expected default active_theme 'parchment', got %q", theme)
	}
	t.Logf("✅ GET /api/settings returns active_theme: %q", theme)
}

func TestGetSettings_DefaultDarkModeIsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	w := doGet(r, "/api/settings")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	darkMode, ok := body["dark_mode"]
	if !ok {
		t.Fatalf("response missing 'dark_mode' field: %v", body)
	}
	if darkMode != false {
		t.Fatalf("expected default dark_mode false, got %v", darkMode)
	}
	t.Logf("✅ GET /api/settings default dark_mode is false")
}

func TestGetSettings_Unauthenticated_Returns401(t *testing.T) {
	db := setupTestDB(t)
	r := setupSettingsRouterNoAuth(db)

	w := doGet(r, "/api/settings")
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
	t.Logf("✅ GET /api/settings unauthenticated returns 401")
}

// ── PUT /api/settings — active_theme validation ───────────────────────────────

func TestUpdateSettings_ValidTheme_Accepted(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	w := doPut(r, "/api/settings", map[string]any{"active_theme": "parchment"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	t.Logf("✅ PUT /api/settings with valid theme returns 200")
}

func TestUpdateSettings_InvalidTheme_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	w := doPut(r, "/api/settings", map[string]any{"active_theme": "not-a-real-theme"})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	if body["error"] != "invalid_theme" {
		t.Fatalf("expected error 'invalid_theme', got %v", body["error"])
	}
	t.Logf("✅ PUT /api/settings with invalid theme returns 400 invalid_theme")
}

func TestUpdateSettings_EmptyBody_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	w := doPut(r, "/api/settings", map[string]any{})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", w.Code, w.Body.String())
	}
	t.Logf("✅ PUT /api/settings with empty body returns 400")
}

func TestUpdateSettings_Unauthenticated_Returns401(t *testing.T) {
	db := setupTestDB(t)
	r := setupSettingsRouterNoAuth(db)

	w := doPut(r, "/api/settings", map[string]any{"active_theme": "midnight"})
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", w.Code, w.Body.String())
	}
	t.Logf("✅ PUT /api/settings unauthenticated returns 401")
}

// ── dark_mode derivation: light themes ───────────────────────────────────────

func TestUpdateSettings_ParchmentTheme_DarkModeFalse(t *testing.T) {
	testThemeDarkMode(t, "parchment", false)
}

func TestUpdateSettings_DesertSandTheme_DarkModeFalse(t *testing.T) {
	testThemeDarkMode(t, "desert-sand", false)
}

// ── dark_mode derivation: dark themes ────────────────────────────────────────

func TestUpdateSettings_MidnightTheme_DarkModeTrue(t *testing.T) {
	testThemeDarkMode(t, "midnight", true)
}

func TestUpdateSettings_SanctuaryTheme_DarkModeTrue(t *testing.T) {
	testThemeDarkMode(t, "sanctuary", true)
}

func TestUpdateSettings_CelestialTheme_DarkModeTrue(t *testing.T) {
	testThemeDarkMode(t, "celestial", true)
}

func TestUpdateSettings_ScarletGraceTheme_DarkModeTrue(t *testing.T) {
	testThemeDarkMode(t, "scarlet-grace", true)
}

// testThemeDarkMode is a shared helper that PUTs active_theme and verifies
// dark_mode is derived correctly in both the response and a subsequent GET.
func testThemeDarkMode(t *testing.T, theme string, expectDark bool) {
	t.Helper()
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	// PUT the theme
	w := doPut(r, "/api/settings", map[string]any{"active_theme": theme})
	if w.Code != http.StatusOK {
		t.Fatalf("[%s] PUT expected 200, got %d: %s", theme, w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	settings, ok := body["settings"].(map[string]any)
	if !ok {
		t.Fatalf("[%s] expected 'settings' object in response, got: %v", theme, body)
	}

	// Verify active_theme in PUT response
	if settings["active_theme"] != theme {
		t.Fatalf("[%s] PUT response active_theme = %v, want %q", theme, settings["active_theme"], theme)
	}

	// Verify dark_mode derived correctly in PUT response
	if settings["dark_mode"] != expectDark {
		t.Fatalf("[%s] PUT response dark_mode = %v, want %v", theme, settings["dark_mode"], expectDark)
	}

	// Verify persistence: GET should return the same values
	w2 := doGet(r, "/api/settings")
	if w2.Code != http.StatusOK {
		t.Fatalf("[%s] GET expected 200, got %d: %s", theme, w2.Code, w2.Body.String())
	}

	get := parseBody(t, w2)
	if get["active_theme"] != theme {
		t.Fatalf("[%s] GET active_theme = %v, want %q (not persisted)", theme, get["active_theme"], theme)
	}
	if get["dark_mode"] != expectDark {
		t.Fatalf("[%s] GET dark_mode = %v, want %v (not persisted)", theme, get["dark_mode"], expectDark)
	}

	t.Logf("✅ theme=%q → dark_mode=%v (PUT + GET both correct)", theme, expectDark)
}

// ── theme switching ───────────────────────────────────────────────────────────

// TestUpdateSettings_ThemeSwitchLightToDark verifies switching from a light
// theme to a dark theme correctly flips dark_mode from false to true.
func TestUpdateSettings_ThemeSwitchLightToDark(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	// Start with a light theme
	w := doPut(r, "/api/settings", map[string]any{"active_theme": "parchment"})
	if w.Code != http.StatusOK {
		t.Fatalf("PUT parchment: expected 200, got %d", w.Code)
	}

	// Switch to a dark theme
	w2 := doPut(r, "/api/settings", map[string]any{"active_theme": "midnight"})
	if w2.Code != http.StatusOK {
		t.Fatalf("PUT midnight: expected 200, got %d", w2.Code)
	}

	body := parseBody(t, w2)
	settings := body["settings"].(map[string]any)
	if settings["active_theme"] != "midnight" {
		t.Fatalf("expected active_theme 'midnight', got %v", settings["active_theme"])
	}
	if settings["dark_mode"] != true {
		t.Fatalf("expected dark_mode true after switching to midnight, got %v", settings["dark_mode"])
	}
	t.Logf("✅ Switching parchment → midnight correctly sets dark_mode=true")
}

// TestUpdateSettings_ThemeSwitchDarkToLight verifies switching from dark to
// light correctly flips dark_mode back to false.
func TestUpdateSettings_ThemeSwitchDarkToLight(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	// Start with a dark theme
	w := doPut(r, "/api/settings", map[string]any{"active_theme": "sanctuary"})
	if w.Code != http.StatusOK {
		t.Fatalf("PUT sanctuary: expected 200, got %d", w.Code)
	}

	// Switch to a light theme
	w2 := doPut(r, "/api/settings", map[string]any{"active_theme": "desert-sand"})
	if w2.Code != http.StatusOK {
		t.Fatalf("PUT desert-sand: expected 200, got %d", w2.Code)
	}

	body := parseBody(t, w2)
	settings := body["settings"].(map[string]any)
	if settings["active_theme"] != "desert-sand" {
		t.Fatalf("expected active_theme 'desert-sand', got %v", settings["active_theme"])
	}
	if settings["dark_mode"] != false {
		t.Fatalf("expected dark_mode false after switching to desert-sand, got %v", settings["dark_mode"])
	}
	t.Logf("✅ Switching sanctuary → desert-sand correctly sets dark_mode=false")
}

// ── non-theme fields are unaffected ──────────────────────────────────────────

// TestUpdateSettings_LanguageChangeDoesNotAffectTheme verifies that updating
// the language alone does not reset active_theme or dark_mode.
func TestUpdateSettings_LanguageChangeDoesNotAffectTheme(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	// Set a dark theme first
	w := doPut(r, "/api/settings", map[string]any{"active_theme": "celestial"})
	if w.Code != http.StatusOK {
		t.Fatalf("PUT celestial: expected 200, got %d", w.Code)
	}

	// Update language — no active_theme in this request
	w2 := doPut(r, "/api/settings", map[string]any{"preferred_language": "es"})
	if w2.Code != http.StatusOK {
		t.Fatalf("PUT language: expected 200, got %d: %s", w2.Code, w2.Body.String())
	}

	// GET and verify theme is still celestial with dark_mode=true
	w3 := doGet(r, "/api/settings")
	body := parseBody(t, w3)
	if body["active_theme"] != "celestial" {
		t.Fatalf("language update changed active_theme: got %v, want 'celestial'", body["active_theme"])
	}
	if body["dark_mode"] != true {
		t.Fatalf("language update changed dark_mode: got %v, want true", body["dark_mode"])
	}
	if body["preferred_language"] != "es" {
		t.Fatalf("language not updated: got %v, want 'es'", body["preferred_language"])
	}
	t.Logf("✅ Language update does not disturb active_theme or dark_mode")
}

// TestUpdateSettings_ThemeChangeDoesNotAffectNotifications verifies that
// updating active_theme does not reset notification preferences.
func TestUpdateSettings_ThemeChangeDoesNotAffectNotifications(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSettings(db) })
	r := setupSettingsRouter(t, db, settingsUserID)

	// Disable both notification flags
	w := doPut(r, "/api/settings", map[string]any{
		"email_notifications":  false,
		"daily_verse_reminder": false,
	})
	if w.Code != http.StatusOK {
		t.Fatalf("PUT notifications: expected 200, got %d", w.Code)
	}

	// Change theme only
	w2 := doPut(r, "/api/settings", map[string]any{"active_theme": "scarlet-grace"})
	if w2.Code != http.StatusOK {
		t.Fatalf("PUT scarlet-grace: expected 200, got %d", w2.Code)
	}

	// GET and confirm notifications still off
	w3 := doGet(r, "/api/settings")
	body := parseBody(t, w3)
	if body["email_notifications"] != false {
		t.Fatalf("theme change reset email_notifications: got %v, want false", body["email_notifications"])
	}
	if body["daily_verse_reminder"] != false {
		t.Fatalf("theme change reset daily_verse_reminder: got %v, want false", body["daily_verse_reminder"])
	}
	t.Logf("✅ Theme change does not disturb notification preferences")
}
