package journaltest

// NOTE: This file lives in the same package as journal_test.go so it reuses
// setupTestDB, injectUser, doGet, doPost, parseBody, and the HTTP helpers.

import (
	"net/http"
	"testing"

	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Constants ────────────────────────────────────────────────────────────────

// Separate IDs from journal tests to avoid cross-test interference.
const unlockUserID uint = 88881
const unlockUserID2 uint = 88882

// ── Setup ────────────────────────────────────────────────────────────────────

func setupUnlocksRouter(db *gorm.DB, userID uint) (*gin.Engine, *services.BlessingsService) {
	gin.SetMode(gin.TestMode)
	blessingsService := services.NewBlessingsService(db)
	unlockService := services.NewUnlockService(db, blessingsService)
	h := handlers.NewUnlocksHandler(unlockService, blessingsService)

	r := gin.New()
	api := r.Group("/api")
	api.Use(injectUser(userID))
	{
		api.GET("/unlocks", h.GetUnlocks)
		api.POST("/blessings/spend", h.SpendBlessings)
	}
	return r, blessingsService
}

// cleanupUnlocks hard-deletes all unlock and blessings records for test users.
func cleanupUnlocks(db *gorm.DB) {
	ids := []uint{unlockUserID, unlockUserID2}
	db.Unscoped().Where("user_id IN ?", ids).Delete(&models.UserUnlock{})
	db.Unscoped().Where("user_id IN ?", ids).Delete(&models.UserBlessings{})
	db.Unscoped().Where("user_id IN ?", ids).Delete(&models.BlessingsTransaction{})
}

// seedBlessings credits the user synchronously so tests can rely on the balance.
func seedBlessings(t *testing.T, bs *services.BlessingsService, userID uint, amount int) {
	t.Helper()
	if _, err := bs.Credit(userID, amount, "test_seed", 1.0); err != nil {
		t.Fatalf("seedBlessings: %v", err)
	}
}

// ── GET /api/unlocks ─────────────────────────────────────────────────────────

func TestGetUnlocks_ReturnsAllSixThemes(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)

	w := doGet(r, "/api/unlocks")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	themes, ok := body["themes"].([]any)
	if !ok {
		t.Fatalf("expected 'themes' array, got: %v", body)
	}
	if len(themes) != 6 {
		t.Fatalf("expected 6 themes, got %d", len(themes))
	}
	t.Logf("✅ GetUnlocks returns all 6 themes")
}

func TestGetUnlocks_FreeThemesAlwaysOwned(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)

	w := doGet(r, "/api/unlocks")
	body := parseBody(t, w)
	themes := body["themes"].([]any)

	for _, raw := range themes {
		theme := raw.(map[string]any)
		if theme["is_free"].(bool) {
			if !theme["is_owned"].(bool) {
				t.Errorf("free theme %q should always be owned", theme["theme_id"])
			}
		}
	}
	t.Log("✅ Free themes (parchment, midnight) are always is_owned=true")
}

func TestGetUnlocks_PaidThemesNotOwnedByDefault(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)

	w := doGet(r, "/api/unlocks")
	body := parseBody(t, w)
	themes := body["themes"].([]any)

	lockedCount := 0
	for _, raw := range themes {
		theme := raw.(map[string]any)
		if !theme["is_free"].(bool) {
			if theme["is_owned"].(bool) {
				t.Errorf("paid theme %q should not be owned by a new user", theme["theme_id"])
			}
			lockedCount++
		}
	}
	if lockedCount != 4 {
		t.Errorf("expected 4 paid themes, got %d", lockedCount)
	}
	t.Logf("✅ All 4 paid themes are is_owned=false for a new user")
}

func TestGetUnlocks_IncludesBlessingsBalance(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 300)

	w := doGet(r, "/api/unlocks")
	body := parseBody(t, w)

	balance, ok := body["blessings_balance"].(float64)
	if !ok {
		t.Fatalf("expected 'blessings_balance' in response, got: %v", body)
	}
	if int(balance) != 300 {
		t.Errorf("expected balance=300, got %.0f", balance)
	}
	t.Log("✅ GetUnlocks includes the user's Blessings balance")
}

// ── POST /api/blessings/spend ─────────────────────────────────────────────────

func TestSpendBlessings_Success(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 600)

	w := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	if body["theme_id"] != "sanctuary" {
		t.Errorf("expected theme_id=sanctuary, got: %v", body["theme_id"])
	}
	remaining := body["blessings_balance"].(float64)
	if int(remaining) != 100 { // 600 - 500
		t.Errorf("expected balance=100 after purchase, got %.0f", remaining)
	}
	t.Log("✅ SpendBlessings deducts correct cost and returns new balance")
}

func TestSpendBlessings_OwnedAfterPurchase(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 750)

	// Purchase celestial
	w1 := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "celestial"})
	if w1.Code != http.StatusOK {
		t.Fatalf("purchase failed: %d %s", w1.Code, w1.Body.String())
	}

	// GET /unlocks should now show celestial as owned
	w2 := doGet(r, "/api/unlocks")
	body := parseBody(t, w2)
	themes := body["themes"].([]any)

	for _, raw := range themes {
		theme := raw.(map[string]any)
		if theme["theme_id"] == "celestial" {
			if !theme["is_owned"].(bool) {
				t.Error("celestial should be is_owned=true after purchase")
			}
			t.Log("✅ Purchased theme shows as is_owned=true in subsequent GetUnlocks")
			return
		}
	}
	t.Error("celestial theme not found in response")
}

func TestSpendBlessings_AlreadyUnlocked_Returns409(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 1500)

	// First purchase
	w1 := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})
	if w1.Code != http.StatusOK {
		t.Fatalf("first purchase failed: %d", w1.Code)
	}

	// Second purchase of same theme
	w2 := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})
	if w2.Code != http.StatusConflict {
		t.Fatalf("expected 409 for duplicate purchase, got %d: %s", w2.Code, w2.Body.String())
	}
	body := parseBody(t, w2)
	if body["error"] != "already_unlocked" {
		t.Errorf("expected error='already_unlocked', got: %v", body["error"])
	}
	t.Log("✅ Duplicate purchase returns 409 already_unlocked")
}

func TestSpendBlessings_AlreadyUnlocked_BalanceNotDebited(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 1500)

	// First purchase deducts 500
	doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})

	// Second purchase attempt should fail and NOT deduct again
	doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})

	balance, err := bs.GetBalance(unlockUserID)
	if err != nil {
		t.Fatalf("GetBalance: %v", err)
	}
	if balance != 1000 { // 1500 - 500 (one deduction only)
		t.Errorf("expected balance=1000 after one deduction, got %d", balance)
	}
	t.Log("✅ Balance only debited once on duplicate purchase attempt")
}

func TestSpendBlessings_InsufficientBlessings_Returns402(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)
	// No blessings seeded — user has zero balance

	w := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})
	if w.Code != http.StatusPaymentRequired {
		t.Fatalf("expected 402 for insufficient balance, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["error"] != "insufficient_blessings" {
		t.Errorf("expected error='insufficient_blessings', got: %v", body["error"])
	}
	t.Log("✅ Insufficient balance returns 402 insufficient_blessings")
}

func TestSpendBlessings_InvalidTheme_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 9999)

	w := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": "not-a-real-theme"})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid theme, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["error"] != "invalid_theme" {
		t.Errorf("expected error='invalid_theme', got: %v", body["error"])
	}
	t.Log("✅ Invalid theme ID returns 400 invalid_theme")
}

func TestSpendBlessings_FreeTheme_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, bs := setupUnlocksRouter(db, unlockUserID)

	seedBlessings(t, bs, unlockUserID, 9999)

	for _, freeTheme := range []string{"parchment", "midnight"} {
		w := doPost(r, "/api/blessings/spend", map[string]any{"theme_id": freeTheme})
		if w.Code != http.StatusBadRequest {
			t.Fatalf("expected 400 for free theme %q, got %d: %s", freeTheme, w.Code, w.Body.String())
		}
		body := parseBody(t, w)
		if body["error"] != "invalid_theme" {
			t.Errorf("expected error='invalid_theme' for %q, got: %v", freeTheme, body["error"])
		}
	}
	t.Log("✅ Purchasing free themes returns 400 invalid_theme")
}

func TestSpendBlessings_MissingThemeID_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)

	w := doPost(r, "/api/blessings/spend", map[string]any{})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for missing theme_id, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ Missing theme_id returns 400")
}

func TestSpendBlessings_UserIsolation(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })

	r1, bs1 := setupUnlocksRouter(db, unlockUserID)
	r2, bs2 := setupUnlocksRouter(db, unlockUserID2)

	seedBlessings(t, bs1, unlockUserID, 600)
	seedBlessings(t, bs2, unlockUserID2, 600)

	// User 1 buys sanctuary
	w1 := doPost(r1, "/api/blessings/spend", map[string]any{"theme_id": "sanctuary"})
	if w1.Code != http.StatusOK {
		t.Fatalf("user1 purchase failed: %d", w1.Code)
	}

	// User 2's unlocks should NOT include sanctuary
	w2 := doGet(r2, "/api/unlocks")
	body := parseBody(t, w2)
	themes := body["themes"].([]any)
	for _, raw := range themes {
		theme := raw.(map[string]any)
		if theme["theme_id"] == "sanctuary" && theme["is_owned"].(bool) {
			t.Error("user2 should not own sanctuary just because user1 bought it")
		}
	}
	t.Log("✅ Theme unlocks are isolated per user")
}

func TestGetUnlocks_CostFieldsCorrect(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupUnlocks(db) })
	r, _ := setupUnlocksRouter(db, unlockUserID)

	w := doGet(r, "/api/unlocks")
	body := parseBody(t, w)
	themes := body["themes"].([]any)

	expected := map[string]int{
		"parchment":     0,
		"midnight":      0,
		"sanctuary":     500,
		"desert-sand":   500,
		"celestial":     750,
		"scarlet-grace": 750,
	}

	for _, raw := range themes {
		theme := raw.(map[string]any)
		id := theme["theme_id"].(string)
		cost := int(theme["cost"].(float64))
		if expected[id] != cost {
			t.Errorf("theme %q: expected cost=%d, got=%d", id, expected[id], cost)
		}
	}
	t.Log("✅ All theme costs are correct")
}
