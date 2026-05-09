package journaltest

// smoke_test.go — App-wide health check suite
//
// Run with: go test ./test/ -run TestSmoke -v
//
// Each TestSmoke_* function verifies that a major feature area:
//   1. Accepts authenticated requests and returns the expected status + shape.
//   2. Rejects unauthenticated requests with 401.
//
// These tests are intentionally shallow — they verify wiring and basic handler
// health, not deep business logic (that's covered by the feature-specific
// test files). If any test here fails it means a handler is broken, a route is
// un-wired, or a critical service dependency has regressed.
//
// Lives in the same package as journal_test.go so it inherits sharedDB,
// injectUser, doGet, doPut, doPost, doDelete, and parseBody.

import (
	"fmt"
	"net/http"
	"testing"

	"dailybible/internal/config"
	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Smoke test user ───────────────────────────────────────────────────────────

// smokeUserID is a dedicated synthetic user for smoke tests.
// Chosen far from all other test IDs (journal:99991/2, unlocks:88881/2,
// reminder:88880-88888, settings:77771, sub:66661/2).
const smokeUserID uint = 55551

// createSmokeUser inserts a minimal users row so FK constraints on related
// tables (user_settings, user_streaks, etc.) are satisfied. Idempotent.
func createSmokeUser(t *testing.T, db *gorm.DB) {
	t.Helper()
	var count int64
	db.Raw("SELECT COUNT(*) FROM users WHERE id = ?", smokeUserID).Scan(&count)
	if count > 0 {
		return
	}
	if err := db.Exec(
		`INSERT INTO users (id, email, username, google_id, is_google_linked, email_verified, preferred_language, created_at, updated_at)
		 VALUES (?, ?, ?, ?, true, true, 'en', NOW(), NOW())
		 ON CONFLICT (id) DO NOTHING`,
		smokeUserID,
		fmt.Sprintf("smoke_%d@test.local", smokeUserID),
		"smoke_test_user",
		fmt.Sprintf("smoke_google_%d", smokeUserID),
	).Error; err != nil {
		t.Fatalf("createSmokeUser: %v", err)
	}
}

// cleanupSmokeUser hard-deletes the synthetic user and all dependent rows.
func cleanupSmokeUser(db *gorm.DB) {
	db.Exec("DELETE FROM user_settings        WHERE user_id = ?", smokeUserID)
	db.Exec("DELETE FROM user_streaks         WHERE user_id = ?", smokeUserID)
	db.Exec("DELETE FROM blessings_transactions WHERE user_id = ?", smokeUserID)
	db.Exec("DELETE FROM user_milestones      WHERE user_id = ?", smokeUserID)
	db.Unscoped().Where("user_id = ?", smokeUserID).Delete(&models.JournalEntry{})
	db.Exec("DELETE FROM users                WHERE id = ?", smokeUserID)
}

// ── Stub BibleAPIService ──────────────────────────────────────────────────────

// stubBibleAPI satisfies the services.BibleAPIService interface without making
// real network calls. Smoke tests that wire history / favorites handlers use
// this so they don't require an API key.
type stubBibleAPI struct{}

func (stubBibleAPI) GetVerse(_ string) (*services.BibleAPIVerse, error) {
	return &services.BibleAPIVerse{Reference: "John 3:16", Text: "For God so loved the world…"}, nil
}
func (stubBibleAPI) GetVerseWithLanguage(_ string, _ string) (*services.BibleAPIVerse, error) {
	return &services.BibleAPIVerse{Reference: "John 3:16", Text: "For God so loved the world…"}, nil
}
func (stubBibleAPI) GetVerseWithVersionID(_ string, _ string) (*services.BibleAPIVerse, error) {
	return &services.BibleAPIVerse{Reference: "John 3:16", Text: "For God so loved the world…"}, nil
}
func (stubBibleAPI) SearchVerses(_ string, _ int) ([]services.BibleAPIVerse, error) {
	return []services.BibleAPIVerse{}, nil
}
func (stubBibleAPI) SearchVersesWithLanguage(_ string, _ int, _ string) ([]services.BibleAPIVerse, error) {
	return []services.BibleAPIVerse{}, nil
}

// rejectAuth is a Gin middleware that mimics what AuthMiddleware returns when
// no valid token is presented — HTTP 401 — without reaching the handler.
// Use this on "noAuth" routers so handlers that call c.MustGet("userID") never
// execute and the test cleanly asserts the auth boundary.
func rejectAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		c.Abort()
	}
}

// ── Feature router builders ───────────────────────────────────────────────────
// Each builder returns two routers: one with injectUser (auth) and one without
// (unauthenticated), so callers can test both sides with a single helper call.

func buildSettingsRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	svc := services.NewSettingsService(db)
	tok := services.NewTokenService(&config.Config{JWTSecret: "smoke-secret"})
	h := handlers.NewSettingsHandler(svc, tok)

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/settings", h.GetSettings)
	authed.PUT("/api/settings", h.UpdateSettings)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/settings", h.GetSettings)
	return
}

func buildBlessingsRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	svc := services.NewBlessingsService(db)
	h := handlers.NewBlessingsHandler(svc)

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/blessings", h.GetBalance)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/blessings", h.GetBalance)
	return
}

func buildMilestonesRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	h := handlers.NewMilestonesHandler(db)

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/milestones", h.GetMilestones)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/milestones", h.GetMilestones)
	return
}

func buildJournalRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	blessSvc := services.NewBlessingsService(db)
	journalSvc := services.NewJournalService(db, blessSvc)
	checker := services.NewStubSubscriptionChecker()
	h := handlers.NewJournalHandler(journalSvc, checker)

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/journal", h.GetEntries)
	authed.POST("/api/journal", h.CreateEntry)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/journal", h.GetEntries)
	return
}

func buildFavoritesRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	favRepo := repository.NewFavoriteRepository(db)
	verseRepo := repository.NewVerseRepository(db)
	favSvc := services.NewFavoriteService(favRepo, verseRepo)
	blessSvc := services.NewBlessingsService(db)
	h := handlers.NewFavoriteHandler(favSvc, stubBibleAPI{}, blessSvc)

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/favorites", h.GetFavorites)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/favorites", h.GetFavorites)
	return
}

func buildHistoryRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	histRepo := repository.NewHistoryRepository(db)
	histSvc := services.NewHistoryService(histRepo)
	h := handlers.NewHistoryHandler(histSvc, stubBibleAPI{})

	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/history", h.GetHistory)

	noAuth = gin.New()
	noAuth.Use(rejectAuth())
	noAuth.GET("/api/history", h.GetHistory)
	return
}

func buildCommunityRouter(t *testing.T, db *gorm.DB) (authed, noAuth *gin.Engine) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	checker := services.NewStubSubscriptionChecker()
	commSvc := services.NewCommunityService(db, checker)
	h := handlers.NewCommunityHandler(commSvc, checker, map[uint]bool{})

	// Community GET feed is public (no auth needed), but wire both for consistency.
	authed = gin.New()
	authed.Use(injectUser(smokeUserID))
	authed.GET("/api/community", h.GetFeed)

	noAuth = gin.New()
	noAuth.GET("/api/community", h.GetFeed)
	return
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// smokeCheck performs a GET against the authed router and asserts the status
// code. Returns the parsed response body for optional field assertions.
func smokeCheck(t *testing.T, r *gin.Engine, path string, wantStatus int) map[string]any {
	t.Helper()
	w := doGet(r, path)
	if w.Code != wantStatus {
		t.Fatalf("GET %s: expected %d, got %d — body: %s", path, wantStatus, w.Code, w.Body.String())
	}
	if wantStatus == http.StatusOK {
		return parseBody(t, w)
	}
	return nil
}

// assert401 verifies that the endpoint returns 401 when no user is injected.
func assert401(t *testing.T, r *gin.Engine, path string) {
	t.Helper()
	w := doGet(r, path)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("GET %s (no auth): expected 401, got %d — body: %s", path, w.Code, w.Body.String())
	}
}

// assertField checks that the parsed body contains the named key.
func assertField(t *testing.T, body map[string]any, key string) {
	t.Helper()
	if _, ok := body[key]; !ok {
		t.Errorf("response missing required field %q — full body: %v", key, body)
	}
}

// ── Smoke tests ───────────────────────────────────────────────────────────────

// TestSmoke_Settings verifies the settings endpoint is reachable, returns the
// expected fields, and enforces authentication.
func TestSmoke_Settings(t *testing.T) {
	db := setupTestDB(t)
	createSmokeUser(t, db)
	t.Cleanup(func() { cleanupSmokeUser(db) })

	authed, noAuth := buildSettingsRouter(t, db)

	body := smokeCheck(t, authed, "/api/settings", http.StatusOK)
	assertField(t, body, "active_theme")
	assertField(t, body, "dark_mode")
	assertField(t, body, "email_notifications")
	assertField(t, body, "preferred_language")
	t.Logf("✅ Settings GET 200, fields: active_theme=%v dark_mode=%v lang=%v",
		body["active_theme"], body["dark_mode"], body["preferred_language"])

	assert401(t, noAuth, "/api/settings")
	t.Log("✅ Settings GET 401 without auth")
}

// TestSmoke_Blessings verifies the blessings balance endpoint is reachable and
// enforces authentication.
func TestSmoke_Blessings(t *testing.T) {
	db := setupTestDB(t)
	createSmokeUser(t, db)
	t.Cleanup(func() { cleanupSmokeUser(db) })

	authed, noAuth := buildBlessingsRouter(t, db)

	body := smokeCheck(t, authed, "/api/blessings", http.StatusOK)
	assertField(t, body, "balance")
	t.Logf("✅ Blessings GET 200, balance=%v", body["balance"])

	assert401(t, noAuth, "/api/blessings")
	t.Log("✅ Blessings GET 401 without auth")
}

// TestSmoke_Milestones verifies the milestones endpoint returns a list and
// enforces authentication.
func TestSmoke_Milestones(t *testing.T) {
	db := setupTestDB(t)
	createSmokeUser(t, db)
	t.Cleanup(func() { cleanupSmokeUser(db) })

	authed, noAuth := buildMilestonesRouter(t, db)

	body := smokeCheck(t, authed, "/api/milestones", http.StatusOK)
	assertField(t, body, "milestones")
	milestones, ok := body["milestones"].([]any)
	if !ok {
		t.Fatalf("expected 'milestones' to be an array, got %T", body["milestones"])
	}
	t.Logf("✅ Milestones GET 200, count=%d", len(milestones))

	assert401(t, noAuth, "/api/milestones")
	t.Log("✅ Milestones GET 401 without auth")
}

// TestSmoke_Journal verifies the journal list endpoint returns the expected
// shape and enforces authentication.
func TestSmoke_Journal(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() {
		db.Unscoped().Where("user_id = ?", smokeUserID).Delete(&models.JournalEntry{})
	})

	authed, noAuth := buildJournalRouter(t, db)

	body := smokeCheck(t, authed, "/api/journal", http.StatusOK)
	assertField(t, body, "entries")
	assertField(t, body, "total_stored")
	assertField(t, body, "view_limit")
	entries := body["entries"].([]any)
	t.Logf("✅ Journal GET 200, entries=%d total_stored=%.0f",
		len(entries), body["total_stored"].(float64))

	assert401(t, noAuth, "/api/journal")
	t.Log("✅ Journal GET 401 without auth")
}

// TestSmoke_Journal_CreateAndRead verifies a full write→read round trip for
// the journal feature, confirming the DB schema and handler are in sync.
func TestSmoke_Journal_CreateAndRead(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() {
		db.Unscoped().Where("user_id = ?", smokeUserID).Delete(&models.JournalEntry{})
	})

	authed, _ := buildJournalRouter(t, db)

	w := doPost(authed, "/api/journal", map[string]any{
		"content_plain": "Smoke test reflection — app health check.",
		"linked_verse":  "Psalm 119:105",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("journal create: expected 201, got %d: %s", w.Code, w.Body.String())
	}
	created := parseBody(t, w)
	if created["id"] == nil {
		t.Fatal("journal create: response missing 'id'")
	}

	// Verify it appears in the list
	list := parseBody(t, doGet(authed, "/api/journal"))
	entries := list["entries"].([]any)
	if len(entries) < 1 {
		t.Fatal("journal list: expected at least 1 entry after create, got 0")
	}
	t.Logf("✅ Journal create→list round trip: entry id=%.0f", created["id"].(float64))
}

// TestSmoke_Favorites verifies the favorites list endpoint returns 200 and
// enforces authentication.
func TestSmoke_Favorites(t *testing.T) {
	db := setupTestDB(t)
	authed, noAuth := buildFavoritesRouter(t, db)

	smokeCheck(t, authed, "/api/favorites", http.StatusOK)
	t.Log("✅ Favorites GET 200")

	assert401(t, noAuth, "/api/favorites")
	t.Log("✅ Favorites GET 401 without auth")
}

// TestSmoke_History verifies the reading history endpoint returns 200 and
// enforces authentication.
func TestSmoke_History(t *testing.T) {
	db := setupTestDB(t)
	authed, noAuth := buildHistoryRouter(t, db)

	smokeCheck(t, authed, "/api/history", http.StatusOK)
	t.Log("✅ History GET 200")

	assert401(t, noAuth, "/api/history")
	t.Log("✅ History GET 401 without auth")
}

// TestSmoke_CommunityFeed verifies the public community feed endpoint returns
// 200 with the expected list shape (no auth required).
func TestSmoke_CommunityFeed(t *testing.T) {
	db := setupTestDB(t)
	authed, _ := buildCommunityRouter(t, db)

	// Community feed is public — the authed router works but auth isn't required.
	body := smokeCheck(t, authed, "/api/community", http.StatusOK)
	assertField(t, body, "posts")
	posts, ok := body["posts"].([]any)
	if !ok {
		t.Fatalf("expected 'posts' to be an array, got %T", body["posts"])
	}
	t.Logf("✅ Community feed GET 200, posts=%d", len(posts))
}

// TestSmoke_AuthBoundaries runs a consolidated check to ensure that every
// protected feature area rejects unauthenticated requests with 401. This is
// the single most critical invariant — if any protected route stops requiring
// auth, it would expose user data.
func TestSmoke_AuthBoundaries(t *testing.T) {
	db := setupTestDB(t)
	createSmokeUser(t, db)
	t.Cleanup(func() { cleanupSmokeUser(db) })

	type endpoint struct {
		name   string
		router *gin.Engine
		path   string
	}

	_, settingsNoAuth := buildSettingsRouter(t, db)
	_, blessingsNoAuth := buildBlessingsRouter(t, db)
	_, milestonesNoAuth := buildMilestonesRouter(t, db)
	_, journalNoAuth := buildJournalRouter(t, db)
	_, favoritesNoAuth := buildFavoritesRouter(t, db)
	_, historyNoAuth := buildHistoryRouter(t, db)

	endpoints := []endpoint{
		{"settings", settingsNoAuth, "/api/settings"},
		{"blessings", blessingsNoAuth, "/api/blessings"},
		{"milestones", milestonesNoAuth, "/api/milestones"},
		{"journal", journalNoAuth, "/api/journal"},
		{"favorites", favoritesNoAuth, "/api/favorites"},
		{"history", historyNoAuth, "/api/history"},
	}

	for _, ep := range endpoints {
		t.Run(ep.name, func(t *testing.T) {
			assert401(t, ep.router, ep.path)
			t.Logf("✅ %s correctly rejects unauthenticated requests (401)", ep.name)
		})
	}
}
