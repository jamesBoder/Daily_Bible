package journaltest

// Phase 8 — Subscription & Purchase test suite
//
// Lives in the same package as journal_test.go so it inherits setupTestDB,
// injectUser, doGet, doPost, parseBody, and the other HTTP helpers.
//
// Coverage:
//   StripeSubscriptionChecker — IsPremium for every status branch + dev override
//   SubscriptionService       — GetSubscription, HasOneTimePurchase,
//                               GetOwnedPurchaseKeys, SyncFromWebhook,
//                               HandleOneTimePurchase (all 9 product types)
//   SubscriptionHandler       — GetStatus response shape + CreateCheckout validation
//
// NOTE: Tests that require live Stripe API calls (CreateCheckout happy path,
// CreatePortalSession, GetOrCreateStripeCustomer) are intentionally excluded —
// they require Stripe test-mode credentials and are covered by test_phase8.sh.

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Constants ─────────────────────────────────────────────────────────────────

// Use IDs well away from journal (99991/2), unlocks (88881/2), settings (77771).
const subUserID uint = 66661
const subUserID2 uint = 66662

// ── Helpers ───────────────────────────────────────────────────────────────────

// createSubTestUser inserts a minimal User row so FK constraints on related
// tables (e.g. user_streaks) are satisfied. Uses a fake GoogleID to bypass the
// BeforeCreate password-hashing hook (same pattern as settings_test.go).
func createSubTestUser(t *testing.T, db *gorm.DB, userID uint) {
	t.Helper()
	var count int64
	db.Raw("SELECT COUNT(*) FROM users WHERE id = ?", userID).Scan(&count)
	if count > 0 {
		return
	}
	err := db.Exec(
		`INSERT INTO users (id, email, username, google_id, is_google_linked, email_verified, preferred_language, created_at, updated_at)
		 VALUES (?, ?, ?, ?, true, true, 'en', NOW(), NOW())
		 ON CONFLICT (id) DO NOTHING`,
		userID,
		fmt.Sprintf("sub_test_%d@test.local", userID),
		fmt.Sprintf("sub_test_user_%d", userID),
		fmt.Sprintf("sub_test_google_%d", userID),
	).Error
	if err != nil {
		t.Fatalf("createSubTestUser(%d): %v", userID, err)
	}
}

// newSubscriptionService builds a SubscriptionService backed by the real DB.
// Does NOT require a live Stripe key — the methods tested here don't call Stripe.
func newSubscriptionService(db *gorm.DB) *services.SubscriptionService {
	blessingsService := services.NewBlessingsService(db)
	stubChecker := services.NewStubSubscriptionChecker()
	streakService := services.NewStreakService(db, stubChecker)
	rewardsService := services.NewRewardsService(db, blessingsService)
	return services.NewSubscriptionService(db, rewardsService, streakService)
}

// newRealSubscriptionChecker builds a StripeSubscriptionChecker pointed at the
// test DB. It reads DEV_PREMIUM_USER_IDS from the environment if set.
func newRealSubscriptionChecker(db *gorm.DB) services.SubscriptionChecker {
	return services.NewStripeSubscriptionChecker(db)
}

// seedSubscription inserts a UserSubscription row directly into the DB.
// periodOffset controls how far in the future (positive) or past (negative)
// CurrentPeriodEnd falls. canceledAtOffset is nil unless explicitly provided.
func seedSubscription(db *gorm.DB, userID uint, status, plan, customerID string, periodOffset time.Duration, canceledAtOffset *time.Duration) {
	t := time.Now().Add(periodOffset)
	sub := models.UserSubscription{
		UserID:               userID,
		Status:               status,
		Plan:                 plan,
		StripeCustomerID:     customerID,
		StripeSubscriptionID: fmt.Sprintf("sub_test_%d", userID),
		CurrentPeriodEnd:     &t,
	}
	if canceledAtOffset != nil {
		ca := time.Now().Add(*canceledAtOffset)
		sub.CanceledAt = &ca
	}
	db.Save(&sub)
}

// cleanupSubscription hard-deletes all Phase 8 test data for the sentinel users.
func cleanupSubscription(db *gorm.DB) {
	ids := []uint{subUserID, subUserID2}
	db.Exec("DELETE FROM user_subscriptions WHERE user_id IN ?", ids)
	db.Exec("DELETE FROM user_unlocks WHERE user_id IN ?", ids)
	db.Exec("DELETE FROM user_streaks WHERE user_id IN ?", ids)
	db.Exec("DELETE FROM user_blessings WHERE user_id IN ?", ids)
	db.Exec("DELETE FROM blessings_transactions WHERE user_id IN ?", ids)
	db.Exec("DELETE FROM users WHERE id IN ?", ids)
}

// setupSubscriptionRouter wires a minimal Gin router with the subscription
// status and checkout endpoints, injecting userID as the authenticated user.
func setupSubscriptionRouter(db *gorm.DB, userID uint) *gin.Engine {
	gin.SetMode(gin.TestMode)
	svc := newSubscriptionService(db)
	checker := newRealSubscriptionChecker(db)
	userRepo := repository.NewUserRepository(db)
	h := handlers.NewSubscriptionHandler(svc, checker, nil, userRepo)

	r := gin.New()
	api := r.Group("/api/subscription")
	api.Use(injectUser(userID))
	{
		api.GET("/status", h.GetStatus)
		api.POST("/checkout", h.CreateCheckout)
	}
	return r
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 1 — StripeSubscriptionChecker.IsPremium
// ═══════════════════════════════════════════════════════════════════════════════

func TestIsPremium_NoRecord_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	checker := newRealSubscriptionChecker(db)
	if checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=false for user with no subscription record")
	}
	t.Log("✅ IsPremium: no record → false")
}

func TestIsPremium_ActiveStatus_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "monthly", "cus_active_001", 30*24*time.Hour, nil)

	checker := newRealSubscriptionChecker(db)
	if !checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=true for active subscription")
	}
	t.Log("✅ IsPremium: status=active → true")
}

func TestIsPremium_TrialingStatus_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "trialing", "monthly", "cus_trialing_001", 14*24*time.Hour, nil)

	checker := newRealSubscriptionChecker(db)
	if !checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=true for trialing subscription")
	}
	t.Log("✅ IsPremium: status=trialing → true")
}

func TestIsPremium_CanceledBeforePeriodEnd_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Canceled but current period still in the future — access preserved.
	neg := -1 * time.Hour
	seedSubscription(db, subUserID, "canceled", "monthly", "cus_canceled_active", 7*24*time.Hour, &neg)

	checker := newRealSubscriptionChecker(db)
	if !checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=true: canceled but still within paid period")
	}
	t.Log("✅ IsPremium: status=canceled, period active → true")
}

func TestIsPremium_CanceledAfterPeriodEnd_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Canceled and period already expired.
	neg := -48 * time.Hour
	seedSubscription(db, subUserID, "canceled", "monthly", "cus_canceled_expired", -24*time.Hour, &neg)

	checker := newRealSubscriptionChecker(db)
	if checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=false: canceled and period expired")
	}
	t.Log("✅ IsPremium: status=canceled, period expired → false")
}

func TestIsPremium_PastDueWithinGraceWindow_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Payment failed but period still live — keep access during Stripe retry window.
	seedSubscription(db, subUserID, "past_due", "annual", "cus_pastdue_active", 3*24*time.Hour, nil)

	checker := newRealSubscriptionChecker(db)
	if !checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=true: past_due within grace window")
	}
	t.Log("✅ IsPremium: status=past_due, within grace window → true")
}

func TestIsPremium_PastDueExpiredPeriod_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Payment failed and period has ended.
	seedSubscription(db, subUserID, "past_due", "annual", "cus_pastdue_expired", -48*time.Hour, nil)

	checker := newRealSubscriptionChecker(db)
	if checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=false: past_due with expired period")
	}
	t.Log("✅ IsPremium: status=past_due, period expired → false")
}

func TestIsPremium_NoneStatus_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Record exists (customer created) but user never subscribed.
	seedSubscription(db, subUserID, "none", "", "cus_none_001", 0, nil)

	checker := newRealSubscriptionChecker(db)
	if checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=false for status=none")
	}
	t.Log("✅ IsPremium: status=none → false")
}

func TestIsPremium_DevOverride_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// No subscription record — but user ID is in DEV_PREMIUM_USER_IDS override.
	prev := os.Getenv("DEV_PREMIUM_USER_IDS")
	os.Setenv("DEV_PREMIUM_USER_IDS", fmt.Sprintf("%d", subUserID))
	defer os.Setenv("DEV_PREMIUM_USER_IDS", prev)

	// Re-create checker AFTER setting the env var so it parses the override list.
	checker := newRealSubscriptionChecker(db)
	if !checker.IsPremium(subUserID) {
		t.Fatal("expected IsPremium=true for user in DEV_PREMIUM_USER_IDS")
	}
	t.Log("✅ IsPremium: DEV_PREMIUM_USER_IDS override → true")
}

func TestIsPremium_DevOverride_DoesNotAffectOtherUsers(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Only subUserID is overridden — subUserID2 has no record.
	prev := os.Getenv("DEV_PREMIUM_USER_IDS")
	os.Setenv("DEV_PREMIUM_USER_IDS", fmt.Sprintf("%d", subUserID))
	defer os.Setenv("DEV_PREMIUM_USER_IDS", prev)

	checker := newRealSubscriptionChecker(db)
	if checker.IsPremium(subUserID2) {
		t.Fatal("expected IsPremium=false for user NOT in DEV_PREMIUM_USER_IDS")
	}
	t.Log("✅ IsPremium: dev override does not bleed to other users")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 2 — SubscriptionService.GetSubscription
// ═══════════════════════════════════════════════════════════════════════════════

func TestGetSubscription_NoRecord_ReturnsNoneStatus(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	sub := svc.GetSubscription(subUserID)

	if sub.Status != "none" {
		t.Fatalf("expected Status='none' for missing record, got %q", sub.Status)
	}
	if sub.UserID != 0 {
		t.Fatalf("expected sentinel UserID=0 for missing record, got %d", sub.UserID)
	}
	t.Log("✅ GetSubscription: no record → Status=none, UserID=0")
}

func TestGetSubscription_ExistingRecord_ReturnsData(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "annual", "cus_existing_001", 365*24*time.Hour, nil)

	svc := newSubscriptionService(db)
	sub := svc.GetSubscription(subUserID)

	if sub.Status != "active" {
		t.Fatalf("expected Status='active', got %q", sub.Status)
	}
	if sub.Plan != "annual" {
		t.Fatalf("expected Plan='annual', got %q", sub.Plan)
	}
	if sub.StripeCustomerID != "cus_existing_001" {
		t.Fatalf("expected StripeCustomerID='cus_existing_001', got %q", sub.StripeCustomerID)
	}
	if sub.CurrentPeriodEnd == nil {
		t.Fatal("expected CurrentPeriodEnd to be non-nil")
	}
	t.Log("✅ GetSubscription: existing record → returns status, plan, customerID, periodEnd")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 3 — SubscriptionService.HasOneTimePurchase
// ═══════════════════════════════════════════════════════════════════════════════

func TestHasOneTimePurchase_NoRecord_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	if svc.HasOneTimePurchase(subUserID, "journal_unlock") {
		t.Fatal("expected false for user with no purchase record")
	}
	t.Log("✅ HasOneTimePurchase: no record → false")
}

func TestHasOneTimePurchase_MatchingRecord_ReturnsTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	db.Create(&models.UserUnlock{
		UserID: subUserID, UnlockType: "purchase", UnlockKey: "journal_unlock", Source: "stripe",
	})

	svc := newSubscriptionService(db)
	if !svc.HasOneTimePurchase(subUserID, "journal_unlock") {
		t.Fatal("expected true for user with matching purchase record")
	}
	t.Log("✅ HasOneTimePurchase: matching record → true")
}

func TestHasOneTimePurchase_WrongUnlockType_ReturnsFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Same key but unlock_type = "theme", not "purchase".
	db.Create(&models.UserUnlock{
		UserID: subUserID, UnlockType: "theme", UnlockKey: "journal_unlock", Source: "stripe",
	})

	svc := newSubscriptionService(db)
	if svc.HasOneTimePurchase(subUserID, "journal_unlock") {
		t.Fatal("expected false — HasOneTimePurchase only checks unlock_type='purchase'")
	}
	t.Log("✅ HasOneTimePurchase: wrong unlock_type='theme' → false")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 4 — SubscriptionService.GetOwnedPurchaseKeys
// ═══════════════════════════════════════════════════════════════════════════════

func TestGetOwnedPurchaseKeys_NoPurchases_ReturnsEmptySlice(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	keys := svc.GetOwnedPurchaseKeys(subUserID)

	if keys == nil {
		t.Fatal("expected empty []string{}, not nil")
	}
	if len(keys) != 0 {
		t.Fatalf("expected 0 keys, got %d: %v", len(keys), keys)
	}
	t.Log("✅ GetOwnedPurchaseKeys: no purchases → []string{} (not nil)")
}

func TestGetOwnedPurchaseKeys_ReturnsPurchaseKeys(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	for _, key := range []string{"journal_unlock", "reflection_archive", "modern_translations"} {
		db.Create(&models.UserUnlock{
			UserID: subUserID, UnlockType: "purchase", UnlockKey: key, Source: "stripe",
		})
	}

	svc := newSubscriptionService(db)
	keys := svc.GetOwnedPurchaseKeys(subUserID)

	if len(keys) != 3 {
		t.Fatalf("expected 3 keys, got %d: %v", len(keys), keys)
	}
	keySet := make(map[string]bool)
	for _, k := range keys {
		keySet[k] = true
	}
	for _, want := range []string{"journal_unlock", "reflection_archive", "modern_translations"} {
		if !keySet[want] {
			t.Fatalf("expected key %q in result, got: %v", want, keys)
		}
	}
	t.Log("✅ GetOwnedPurchaseKeys: returns all non-consumable purchase keys")
}

func TestGetOwnedPurchaseKeys_ExcludesGraceDayPackSessionKeys(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Grace day pack keys use the pattern "grace_day_pack_<sessionID>" — must be excluded.
	db.Create(&models.UserUnlock{
		UserID: subUserID, UnlockType: "purchase", UnlockKey: "grace_day_pack_cs_test_abc123", Source: "stripe",
	})
	// A regular purchase that should be included.
	db.Create(&models.UserUnlock{
		UserID: subUserID, UnlockType: "purchase", UnlockKey: "journal_unlock", Source: "stripe",
	})

	svc := newSubscriptionService(db)
	keys := svc.GetOwnedPurchaseKeys(subUserID)

	for _, k := range keys {
		if k == "grace_day_pack_cs_test_abc123" {
			t.Fatalf("GetOwnedPurchaseKeys must exclude grace_day_pack_* keys, but returned %q", k)
		}
	}
	if len(keys) != 1 || keys[0] != "journal_unlock" {
		t.Fatalf("expected only [journal_unlock], got: %v", keys)
	}
	t.Log("✅ GetOwnedPurchaseKeys: excludes grace_day_pack_* consumable keys")
}

func TestGetOwnedPurchaseKeys_ExcludesThemeTypeUnlocks(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Theme unlocks use unlock_type="theme" — must NOT appear in purchase key list.
	db.Create(&models.UserUnlock{
		UserID: subUserID, UnlockType: "theme", UnlockKey: "sanctuary", Source: "stripe",
	})

	svc := newSubscriptionService(db)
	keys := svc.GetOwnedPurchaseKeys(subUserID)

	if len(keys) != 0 {
		t.Fatalf("expected 0 keys (theme records excluded), got: %v", keys)
	}
	t.Log("✅ GetOwnedPurchaseKeys: excludes theme-type unlocks")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 5 — SubscriptionService.SyncFromWebhook
// ═══════════════════════════════════════════════════════════════════════════════

func TestSyncFromWebhook_UnknownCustomer_ReturnsError(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	_, err := svc.SyncFromWebhook("sub_xxx", "active", "", "cus_does_not_exist", nil, nil)
	if err == nil {
		t.Fatal("expected error for unknown Stripe customer, got nil")
	}
	t.Logf("✅ SyncFromWebhook: unknown customer → error: %v", err)
}

func TestSyncFromWebhook_UpdatesStatusPlanAndSubID(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Pre-seed a record with the customer ID so SyncFromWebhook can find it.
	seedSubscription(db, subUserID, "none", "", "cus_sync_test_001", 0, nil)

	periodEnd := time.Now().Add(30 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	_, err := svc.SyncFromWebhook("sub_sync_001", "active", os.Getenv("STRIPE_PRICE_MONTHLY"), "cus_sync_test_001", &periodEnd, nil)
	if err != nil {
		t.Fatalf("SyncFromWebhook: unexpected error: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)

	if sub.Status != "active" {
		t.Fatalf("expected Status='active', got %q", sub.Status)
	}
	if sub.StripeSubscriptionID != "sub_sync_001" {
		t.Fatalf("expected StripeSubscriptionID='sub_sync_001', got %q", sub.StripeSubscriptionID)
	}
	if sub.CurrentPeriodEnd == nil {
		t.Fatal("expected CurrentPeriodEnd to be set")
	}
	t.Log("✅ SyncFromWebhook: upserts status, subID, and period_end correctly")
}

func TestSyncFromWebhook_SetsMonthlyPlanFromEnvPriceID(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Set the price IDs that planFromPriceID reads.
	prev := os.Getenv("STRIPE_PRICE_MONTHLY")
	os.Setenv("STRIPE_PRICE_MONTHLY", "price_test_monthly_abc")
	defer os.Setenv("STRIPE_PRICE_MONTHLY", prev)

	seedSubscription(db, subUserID, "none", "", "cus_plan_monthly_test", 0, nil)

	periodEnd := time.Now().Add(30 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	_, err := svc.SyncFromWebhook("sub_plan_m", "active", "price_test_monthly_abc", "cus_plan_monthly_test", &periodEnd, nil)
	if err != nil {
		t.Fatalf("SyncFromWebhook: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.Plan != "monthly" {
		t.Fatalf("expected Plan='monthly', got %q", sub.Plan)
	}
	t.Log("✅ SyncFromWebhook: STRIPE_PRICE_MONTHLY price ID → Plan='monthly'")
}

func TestSyncFromWebhook_MapsUnpaidToPastDue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "monthly", "cus_unpaid_map_test", 0, nil)

	periodEnd := time.Now().Add(7 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	if _, err := svc.SyncFromWebhook("sub_unpaid", "unpaid", "", "cus_unpaid_map_test", &periodEnd, nil); err != nil {
		t.Fatalf("SyncFromWebhook: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.Status != "past_due" {
		t.Fatalf("Stripe 'unpaid' must map to internal 'past_due', got %q", sub.Status)
	}
	t.Log("✅ SyncFromWebhook: Stripe status 'unpaid' → internal 'past_due'")
}

func TestSyncFromWebhook_MapsUnknownStatusToNone(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "monthly", "cus_unknown_status_test", 0, nil)

	periodEnd := time.Now().Add(7 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	if _, err := svc.SyncFromWebhook("sub_incomplete", "incomplete_expired", "", "cus_unknown_status_test", &periodEnd, nil); err != nil {
		t.Fatalf("SyncFromWebhook: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.Status != "none" {
		t.Fatalf("unknown Stripe status must map to 'none', got %q", sub.Status)
	}
	t.Log("✅ SyncFromWebhook: unknown Stripe status → internal 'none'")
}

func TestSyncFromWebhook_IsIdempotent(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "none", "", "cus_idem_test", 0, nil)

	periodEnd := time.Now().Add(30 * 24 * time.Hour)
	svc := newSubscriptionService(db)

	// Call twice with the same data.
	for i := 0; i < 2; i++ {
		if _, err := svc.SyncFromWebhook("sub_idem_001", "active", "", "cus_idem_test", &periodEnd, nil); err != nil {
			t.Fatalf("SyncFromWebhook call %d: %v", i+1, err)
		}
	}

	var count int64
	db.Model(&models.UserSubscription{}).Where("user_id = ?", subUserID).Count(&count)
	if count != 1 {
		t.Fatalf("expected exactly 1 subscription record after idempotent sync, got %d", count)
	}
	t.Log("✅ SyncFromWebhook: idempotent — duplicate calls don't create extra records")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 6 — SubscriptionService.HandleOneTimePurchase
// ═══════════════════════════════════════════════════════════════════════════════

func TestHandleOneTimePurchase_GraceDayPack_CreatesSessionScopedUnlock(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	createSubTestUser(t, db, subUserID)

	svc := newSubscriptionService(db)
	sessionID := "cs_test_gdp_001"
	if err := svc.HandleOneTimePurchase(subUserID, "grace_day_pack", sessionID); err != nil {
		t.Fatalf("HandleOneTimePurchase(grace_day_pack): %v", err)
	}

	// Idempotency key format: "grace_day_pack_<sessionID>"
	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_key = ?", subUserID, "grace_day_pack_"+sessionID).
		Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 session-scoped unlock record, got %d", count)
	}
	t.Log("✅ HandleOneTimePurchase(grace_day_pack): creates session-scoped unlock record")
}

func TestHandleOneTimePurchase_GraceDayPack_DuplicateSessionIsIdempotent(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	createSubTestUser(t, db, subUserID)

	svc := newSubscriptionService(db)
	sessionID := "cs_test_gdp_idem_001"

	if err := svc.HandleOneTimePurchase(subUserID, "grace_day_pack", sessionID); err != nil {
		t.Fatalf("first HandleOneTimePurchase: %v", err)
	}
	// Second call with same session ID — must not create a second record.
	if err := svc.HandleOneTimePurchase(subUserID, "grace_day_pack", sessionID); err != nil {
		t.Fatalf("duplicate HandleOneTimePurchase: %v", err)
	}

	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_key = ?", subUserID, "grace_day_pack_"+sessionID).
		Count(&count)
	if count != 1 {
		t.Fatalf("expected exactly 1 record after duplicate replay, got %d", count)
	}
	t.Log("✅ HandleOneTimePurchase(grace_day_pack): duplicate session → idempotent")
}

func TestHandleOneTimePurchase_GraceDayPack_DifferentSessionsEachFulfilled(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	createSubTestUser(t, db, subUserID)

	svc := newSubscriptionService(db)
	// Two separate purchases each get their own session ID.
	svc.HandleOneTimePurchase(subUserID, "grace_day_pack", "cs_test_gdp_session_A")
	svc.HandleOneTimePurchase(subUserID, "grace_day_pack", "cs_test_gdp_session_B")

	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_key LIKE 'grace_day_pack_%'", subUserID).
		Count(&count)
	if count != 2 {
		t.Fatalf("expected 2 separate grace_day_pack records for 2 sessions, got %d", count)
	}
	t.Log("✅ HandleOneTimePurchase(grace_day_pack): different sessions each create a record")
}

func TestHandleOneTimePurchase_FullThemeLibrary_CreatesFiveTotalRecords(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	if err := svc.HandleOneTimePurchase(subUserID, "full_theme_library", "cs_test_ftl_001"); err != nil {
		t.Fatalf("HandleOneTimePurchase(full_theme_library): %v", err)
	}

	// Expect: 1 master purchase record + 4 individual theme records = 5 total
	var total int64
	db.Model(&models.UserUnlock{}).Where("user_id = ?", subUserID).Count(&total)
	if total != 5 {
		t.Fatalf("expected 5 unlock records for full_theme_library, got %d", total)
	}

	// Master bundle record: unlock_type="purchase", unlock_key="full_theme_library"
	var masterCount int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = 'full_theme_library'", subUserID).
		Count(&masterCount)
	if masterCount != 1 {
		t.Fatalf("expected 1 master purchase record, got %d", masterCount)
	}

	// Each individual theme must have its own unlock_type="theme" record.
	for _, themeID := range []string{"sanctuary", "desert-sand", "celestial", "scarlet-grace"} {
		var c int64
		db.Model(&models.UserUnlock{}).
			Where("user_id = ? AND unlock_type = 'theme' AND unlock_key = ?", subUserID, themeID).
			Count(&c)
		if c != 1 {
			t.Fatalf("expected 1 theme record for %q, got %d", themeID, c)
		}
	}
	t.Log("✅ HandleOneTimePurchase(full_theme_library): 1 master purchase + 4 theme records")
}

func TestHandleOneTimePurchase_FullThemeLibrary_Idempotent(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	svc.HandleOneTimePurchase(subUserID, "full_theme_library", "cs_test_ftl_a")
	// Second purchase must not create duplicates.
	if err := svc.HandleOneTimePurchase(subUserID, "full_theme_library", "cs_test_ftl_b"); err != nil {
		t.Fatalf("second full_theme_library purchase returned error: %v", err)
	}

	var total int64
	db.Model(&models.UserUnlock{}).Where("user_id = ?", subUserID).Count(&total)
	if total != 5 {
		t.Fatalf("expected 5 records (no duplicates), got %d", total)
	}
	t.Log("✅ HandleOneTimePurchase(full_theme_library): idempotent on re-purchase")
}

// individualThemeCase couples a product key with its canonical theme unlock key.
type individualThemeCase struct {
	productKey string
	themeID    string
}

func TestHandleOneTimePurchase_IndividualThemes_WriteThemeUnlockRecord(t *testing.T) {
	cases := []individualThemeCase{
		{"theme_sanctuary", "sanctuary"},
		{"theme_desert_sand", "desert-sand"},
		{"theme_celestial", "celestial"},
		{"theme_scarlet_grace", "scarlet-grace"},
	}

	for _, tc := range cases {
		t.Run(tc.productKey, func(t *testing.T) {
			db := setupTestDB(t)
			t.Cleanup(func() { cleanupSubscription(db) })

			svc := newSubscriptionService(db)
			if err := svc.HandleOneTimePurchase(subUserID, tc.productKey, "cs_test_"+tc.productKey); err != nil {
				t.Fatalf("HandleOneTimePurchase(%q): %v", tc.productKey, err)
			}

			var count int64
			db.Model(&models.UserUnlock{}).
				Where("user_id = ? AND unlock_type = 'theme' AND unlock_key = ?", subUserID, tc.themeID).
				Count(&count)
			if count != 1 {
				t.Fatalf("expected theme unlock with key=%q, got %d records", tc.themeID, count)
			}
			t.Logf("✅ HandleOneTimePurchase(%q) → theme unlock key=%q", tc.productKey, tc.themeID)
		})
	}
}

func TestHandleOneTimePurchase_PremiumBadges_WritesPurchaseUnlock(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	if err := svc.HandleOneTimePurchase(subUserID, "premium_badges", "cs_test_badges"); err != nil {
		t.Fatalf("HandleOneTimePurchase(premium_badges): %v", err)
	}

	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = 'premium_badges'", subUserID).
		Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 purchase unlock for premium_badges, got %d", count)
	}
	t.Log("✅ HandleOneTimePurchase(premium_badges): writes purchase unlock record")
}

func TestHandleOneTimePurchase_DefaultProducts_WritesPurchaseUnlock(t *testing.T) {
	for _, productKey := range []string{
		"journal_unlock",
		"reflection_archive",
		"modern_translations",
		"support_developer",
	} {
		t.Run(productKey, func(t *testing.T) {
			db := setupTestDB(t)
			t.Cleanup(func() { cleanupSubscription(db) })

			svc := newSubscriptionService(db)
			if err := svc.HandleOneTimePurchase(subUserID, productKey, "cs_test_"+productKey); err != nil {
				t.Fatalf("HandleOneTimePurchase(%q): %v", productKey, err)
			}

			var count int64
			db.Model(&models.UserUnlock{}).
				Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = ?", subUserID, productKey).
				Count(&count)
			if count != 1 {
				t.Fatalf("expected 1 purchase unlock for %q, got %d", productKey, count)
			}
			t.Logf("✅ HandleOneTimePurchase(%q): writes purchase unlock record", productKey)
		})
	}
}

func TestHandleOneTimePurchase_NonConsumable_Idempotent(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	svc := newSubscriptionService(db)
	svc.HandleOneTimePurchase(subUserID, "journal_unlock", "cs_test_ju_001")
	// Second call for the same non-consumable product — must be a no-op.
	if err := svc.HandleOneTimePurchase(subUserID, "journal_unlock", "cs_test_ju_002"); err != nil {
		t.Fatalf("second non-consumable purchase returned error: %v", err)
	}

	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = 'journal_unlock'", subUserID).
		Count(&count)
	if count != 1 {
		t.Fatalf("expected exactly 1 record (ON CONFLICT DO NOTHING), got %d", count)
	}
	t.Log("✅ HandleOneTimePurchase(journal_unlock): non-consumable idempotent — second purchase is no-op")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 7 — Handler: GET /api/subscription/status
// ═══════════════════════════════════════════════════════════════════════════════

func TestGetStatus_ReturnsAllSixRequiredFields(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	for _, field := range []string{"status", "plan", "period_end", "is_premium", "canceled_at", "owned_purchase_keys"} {
		if _, ok := body[field]; !ok {
			t.Fatalf("GetStatus response missing required field %q — present fields: %v", field, body)
		}
	}
	t.Log("✅ GetStatus: all 6 required fields present in response")
}

func TestGetStatus_FreeUser_StatusNoneAndNotPremium(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	if body["status"] != "none" {
		t.Fatalf("expected status='none' for free user, got %v", body["status"])
	}
	if body["is_premium"] != false {
		t.Fatalf("expected is_premium=false for free user, got %v", body["is_premium"])
	}
	t.Log("✅ GetStatus: free user → status=none, is_premium=false")
}

func TestGetStatus_ActiveUser_IsPremiumTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "monthly", "cus_status_active", 30*24*time.Hour, nil)

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	body := parseBody(t, w)
	if body["status"] != "active" {
		t.Fatalf("expected status='active', got %v", body["status"])
	}
	if body["is_premium"] != true {
		t.Fatalf("expected is_premium=true for active sub, got %v", body["is_premium"])
	}
	if body["plan"] != "monthly" {
		t.Fatalf("expected plan='monthly', got %v", body["plan"])
	}
	t.Log("✅ GetStatus: active sub → status=active, is_premium=true, plan=monthly")
}

func TestGetStatus_OwnedPurchaseKeysIncludedInResponse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	db.Create(&models.UserUnlock{UserID: subUserID, UnlockType: "purchase", UnlockKey: "journal_unlock", Source: "stripe"})
	db.Create(&models.UserUnlock{UserID: subUserID, UnlockType: "purchase", UnlockKey: "reflection_archive", Source: "stripe"})

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	body := parseBody(t, w)
	rawKeys, ok := body["owned_purchase_keys"].([]any)
	if !ok {
		t.Fatalf("expected owned_purchase_keys to be an array, got %T: %v", body["owned_purchase_keys"], body["owned_purchase_keys"])
	}
	if len(rawKeys) != 2 {
		t.Fatalf("expected 2 owned keys, got %d: %v", len(rawKeys), rawKeys)
	}
	t.Logf("✅ GetStatus: owned_purchase_keys contains %d items", len(rawKeys))
}

func TestGetStatus_OwnedPurchaseKeys_GraceDayPackExcluded(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	// Grace day pack consumable must NOT appear in owned_purchase_keys.
	db.Create(&models.UserUnlock{UserID: subUserID, UnlockType: "purchase", UnlockKey: "grace_day_pack_cs_xyz", Source: "stripe"})
	db.Create(&models.UserUnlock{UserID: subUserID, UnlockType: "purchase", UnlockKey: "modern_translations", Source: "stripe"})

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	body := parseBody(t, w)
	rawKeys, _ := body["owned_purchase_keys"].([]any)
	for _, k := range rawKeys {
		if k == "grace_day_pack_cs_xyz" {
			t.Fatal("owned_purchase_keys must not contain grace_day_pack_* consumable keys")
		}
	}
	if len(rawKeys) != 1 {
		t.Fatalf("expected 1 key (modern_translations), got: %v", rawKeys)
	}
	t.Log("✅ GetStatus: owned_purchase_keys excludes grace_day_pack_* consumable keys")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 8 — Handler: POST /api/subscription/checkout (validation only)
//
// Only the validation paths that short-circuit before any Stripe API call
// are tested here. Happy-path checkout requires live Stripe credentials and
// is covered by test/test_phase8.sh.
// ═══════════════════════════════════════════════════════════════════════════════

func TestCreateCheckout_BothPlanAndProductKey_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	r := setupSubscriptionRouter(db, subUserID)
	w := doPost(r, "/api/subscription/checkout", map[string]any{
		"plan":        "monthly",
		"product_key": "journal_unlock",
	})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 when both plan and product_key are provided, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ CreateCheckout: plan + product_key → 400")
}

func TestCreateCheckout_NeitherPlanNorProductKey_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	r := setupSubscriptionRouter(db, subUserID)
	w := doPost(r, "/api/subscription/checkout", map[string]any{})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 when neither plan nor product_key is set, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ CreateCheckout: no plan or product_key → 400")
}

func TestCreateCheckout_InvalidPlanValue_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	r := setupSubscriptionRouter(db, subUserID)
	w := doPost(r, "/api/subscription/checkout", map[string]any{
		"plan": "weekly", // only "monthly" and "annual" are valid
	})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid plan value, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ CreateCheckout: invalid plan value → 400")
}

func TestCreateCheckout_ValidPlanValues_PassValidation(t *testing.T) {
	// Verifies that "monthly" and "annual" pass the plan-value check.
	// The requests proceed further (to Stripe) and fail with 500 if no Stripe key
	// is configured — that's expected; we're only checking the validation path here.
	for _, plan := range []string{"monthly", "annual"} {
		t.Run(plan, func(t *testing.T) {
			db := setupTestDB(t)
			t.Cleanup(func() { cleanupSubscription(db) })

			r := setupSubscriptionRouter(db, subUserID)
			w := doPost(r, "/api/subscription/checkout", map[string]any{"plan": plan})

			// Must not return the "plan must be monthly or annual" 400.
			if w.Code == http.StatusBadRequest {
				body := parseBody(t, w)
				if body["error"] == "plan must be 'monthly' or 'annual'" {
					t.Fatalf("plan=%q was rejected by validation — should have passed", plan)
				}
			}
			t.Logf("✅ CreateCheckout: plan=%q passes validation (code=%d)", plan, w.Code)
		})
	}
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 5 (continued) — SyncFromWebhook additional cases
// ═══════════════════════════════════════════════════════════════════════════════

func TestSyncFromWebhook_SetsAnnualPlanFromEnvPriceID(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	prev := os.Getenv("STRIPE_PRICE_ANNUAL")
	os.Setenv("STRIPE_PRICE_ANNUAL", "price_test_annual_xyz")
	defer os.Setenv("STRIPE_PRICE_ANNUAL", prev)

	seedSubscription(db, subUserID, "none", "", "cus_plan_annual_test", 0, nil)

	periodEnd := time.Now().Add(365 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	if _, err := svc.SyncFromWebhook("sub_plan_a", "active", "price_test_annual_xyz", "cus_plan_annual_test", &periodEnd, nil); err != nil {
		t.Fatalf("SyncFromWebhook: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.Plan != "annual" {
		t.Fatalf("expected Plan='annual', got %q", sub.Plan)
	}
	t.Log("✅ SyncFromWebhook: STRIPE_PRICE_ANNUAL price ID → Plan='annual'")
}

func TestSyncFromWebhook_PreservesCanceledAt(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "active", "monthly", "cus_cancelat_test", 30*24*time.Hour, nil)

	canceledAt := time.Now().Add(-1 * time.Hour).UTC().Truncate(time.Second)
	periodEnd := time.Now().Add(7 * 24 * time.Hour)
	svc := newSubscriptionService(db)
	if _, err := svc.SyncFromWebhook("sub_cancelat_001", "canceled", "", "cus_cancelat_test", &periodEnd, &canceledAt); err != nil {
		t.Fatalf("SyncFromWebhook: %v", err)
	}

	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.CanceledAt == nil {
		t.Fatal("expected CanceledAt to be set after sync")
	}
	if sub.CanceledAt.UTC().Truncate(time.Second) != canceledAt {
		t.Fatalf("expected CanceledAt=%v, got %v", canceledAt, sub.CanceledAt.UTC().Truncate(time.Second))
	}
	t.Log("✅ SyncFromWebhook: canceled_at field written to DB correctly")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 7 (continued) — Handler: GET /api/subscription/status — more states
// ═══════════════════════════════════════════════════════════════════════════════

func TestGetStatus_Trialing_IsPremiumTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "trialing", "monthly", "cus_status_trialing", 14*24*time.Hour, nil)

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["status"] != "trialing" {
		t.Fatalf("expected status='trialing', got %v", body["status"])
	}
	if body["is_premium"] != true {
		t.Fatalf("expected is_premium=true for trialing sub, got %v", body["is_premium"])
	}
	t.Log("✅ GetStatus: status=trialing → is_premium=true")
}

func TestGetStatus_CanceledWithinPeriod_IsPremiumTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	neg := -1 * time.Hour
	seedSubscription(db, subUserID, "canceled", "monthly", "cus_status_canceled_active", 7*24*time.Hour, &neg)

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["status"] != "canceled" {
		t.Fatalf("expected status='canceled', got %v", body["status"])
	}
	if body["is_premium"] != true {
		t.Fatalf("expected is_premium=true (canceled but within paid period), got %v", body["is_premium"])
	}
	if body["canceled_at"] == nil {
		t.Fatal("expected canceled_at to be non-null")
	}
	t.Log("✅ GetStatus: canceled within paid period → is_premium=true, canceled_at set")
}

func TestGetStatus_CanceledExpired_IsPremiumFalse(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	neg := -48 * time.Hour
	seedSubscription(db, subUserID, "canceled", "monthly", "cus_status_canceled_exp", -24*time.Hour, &neg)

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["is_premium"] != false {
		t.Fatalf("expected is_premium=false (canceled, period expired), got %v", body["is_premium"])
	}
	t.Log("✅ GetStatus: canceled + period expired → is_premium=false")
}

func TestGetStatus_PastDueWithinPeriod_IsPremiumTrue(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "past_due", "annual", "cus_status_pastdue_active", 3*24*time.Hour, nil)

	r := setupSubscriptionRouter(db, subUserID)
	w := doGet(r, "/api/subscription/status")

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["status"] != "past_due" {
		t.Fatalf("expected status='past_due', got %v", body["status"])
	}
	if body["is_premium"] != true {
		t.Fatalf("expected is_premium=true (past_due within grace window), got %v", body["is_premium"])
	}
	t.Log("✅ GetStatus: past_due within grace window → is_premium=true")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 8 (continued) — Handler: POST /api/subscription/checkout — 409 conflict
// ═══════════════════════════════════════════════════════════════════════════════

func TestCreateCheckout_ActiveSubscription_Returns409(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	createSubTestUser(t, db, subUserID)

	// Seeding with a stripe_customer_id means GetOrCreateStripeCustomer
	// short-circuits (returns existing ID, no Stripe API call).
	// The 409 check then fires before checkoutsession.New.
	seedSubscription(db, subUserID, "active", "monthly", "cus_conflict_active_409", 30*24*time.Hour, nil)

	r := setupSubscriptionRouter(db, subUserID)
	w := doPost(r, "/api/subscription/checkout", map[string]any{"plan": "monthly"})

	if w.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict for active subscription checkout, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["error"] == nil {
		t.Fatal("expected 'error' field in 409 response")
	}
	t.Log("✅ CreateCheckout: active subscription → 409 Conflict")
}

func TestCreateCheckout_TrialingSubscription_Returns409(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	createSubTestUser(t, db, subUserID)

	seedSubscription(db, subUserID, "trialing", "monthly", "cus_conflict_trial_409", 14*24*time.Hour, nil)

	r := setupSubscriptionRouter(db, subUserID)
	w := doPost(r, "/api/subscription/checkout", map[string]any{"plan": "monthly"})

	if w.Code != http.StatusConflict {
		t.Fatalf("expected 409 Conflict for trialing subscription checkout, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ CreateCheckout: trialing subscription → 409 Conflict")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 9 — SubscriptionService.StorePendingCheckout
// ═══════════════════════════════════════════════════════════════════════════════

func TestStorePendingCheckout_StoresSessionID(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })

	seedSubscription(db, subUserID, "none", "", "cus_pending_ck_test", 0, nil)

	svc := newSubscriptionService(db)
	expiresAt := time.Now().Add(24 * time.Hour)
	svc.StorePendingCheckout(subUserID, "cs_test_pending_001", expiresAt)

	sub := svc.GetSubscription(subUserID)
	if sub.PendingCheckoutSessionID != "cs_test_pending_001" {
		t.Fatalf("expected PendingCheckoutSessionID='cs_test_pending_001', got %q", sub.PendingCheckoutSessionID)
	}
	if sub.PendingCheckoutExpiresAt == nil {
		t.Fatal("expected PendingCheckoutExpiresAt to be non-nil")
	}
	if !sub.PendingCheckoutExpiresAt.After(time.Now()) {
		t.Fatal("expected PendingCheckoutExpiresAt to be in the future")
	}
	t.Log("✅ StorePendingCheckout: session ID and expiry stored and retrievable via GetSubscription")
}

// ═══════════════════════════════════════════════════════════════════════════════
// Section 10 — Handler: POST /api/webhooks/stripe
// ═══════════════════════════════════════════════════════════════════════════════

// testWebhookSecret is used for unit tests only — never a real Stripe secret.
const testWebhookSecret = "test_wh_secret_phase8_unit_tests"

// setupWebhookRouter wires a minimal Gin router with only the webhook endpoint.
func setupWebhookRouter(db *gorm.DB) *gin.Engine {
	gin.SetMode(gin.TestMode)
	svc := newSubscriptionService(db)
	checker := newRealSubscriptionChecker(db)
	userRepo := repository.NewUserRepository(db)
	h := handlers.NewSubscriptionHandler(svc, checker, nil, userRepo)

	r := gin.New()
	r.POST("/api/webhooks/stripe", h.HandleStripeWebhook)
	return r
}

// signedWebhookHeader computes a valid Stripe-Signature header value for the given payload and secret.
func signedWebhookHeader(payload []byte, secret string) string {
	ts := fmt.Sprintf("%d", time.Now().Unix())
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(ts + "." + string(payload)))
	sig := hex.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("t=%s,v1=%s", ts, sig)
}

// doWebhookRequest sends a POST to /api/webhooks/stripe with the given raw payload and signature header.
func doWebhookRequest(r *gin.Engine, payload []byte, sig string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/api/webhooks/stripe", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Stripe-Signature", sig)
	r.ServeHTTP(w, req)
	return w
}

// withTestWebhookSecret sets STRIPE_WEBHOOK_SECRET to testWebhookSecret for the duration of a test.
func withTestWebhookSecret(t *testing.T) {
	t.Helper()
	prev := os.Getenv("STRIPE_WEBHOOK_SECRET")
	os.Setenv("STRIPE_WEBHOOK_SECRET", testWebhookSecret)
	t.Cleanup(func() { os.Setenv("STRIPE_WEBHOOK_SECRET", prev) })
}

func TestHandleStripeWebhook_InvalidSignature_Returns400(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	r := setupWebhookRouter(db)
	payload := []byte(`{"type":"customer.subscription.created"}`)
	w := doWebhookRequest(r, payload, "t=bad,v1=invalidsignature")

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid signature, got %d", w.Code)
	}
	t.Log("✅ HandleStripeWebhook: invalid signature → 400")
}

func TestHandleStripeWebhook_SubCreated_UpdatesDB(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	// Pre-seed so SyncFromWebhook can look up by stripe_customer_id.
	seedSubscription(db, subUserID, "none", "", "cus_wh_sub_create_001", 0, nil)

	periodEnd := time.Now().Add(30 * 24 * time.Hour).Unix()
	payload := []byte(fmt.Sprintf(`{
		"id": "evt_wh_sub_create",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "customer.subscription.created",
		"data": {
			"object": {
				"id": "sub_wh_create_001",
				"object": "subscription",
				"status": "active",
				"customer": "cus_wh_sub_create_001",
				"current_period_end": %d,
				"canceled_at": 0,
				"items": {
					"object": "list",
					"data": [{"price": {"id": "price_wh_test_monthly"}}],
					"has_more": false,
					"url": "/v1/subscription_items"
				}
			}
		}
	}`, periodEnd))

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for valid subscription event, got %d: %s", w.Code, w.Body.String())
	}

	// Verify DB was updated by SyncFromWebhook.
	var sub models.UserSubscription
	db.Where("user_id = ?", subUserID).First(&sub)
	if sub.Status != "active" {
		t.Fatalf("expected Status='active' after webhook sync, got %q", sub.Status)
	}
	if sub.StripeSubscriptionID != "sub_wh_create_001" {
		t.Fatalf("expected StripeSubscriptionID='sub_wh_create_001', got %q", sub.StripeSubscriptionID)
	}
	t.Log("✅ HandleStripeWebhook: subscription.created → DB updated, 200 returned")
}

func TestHandleStripeWebhook_SubUnknownCustomer_Returns200(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	// No subscription record with this customer ID — SyncFromWebhook will log error.
	// Handler must still return 200 (no Stripe retry storm).
	payload := []byte(`{
		"id": "evt_wh_unknown_cus",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "customer.subscription.updated",
		"data": {
			"object": {
				"id": "sub_wh_unknown",
				"object": "subscription",
				"status": "active",
				"customer": "cus_does_not_exist_in_db",
				"current_period_end": 1893456000,
				"canceled_at": 0,
				"items": {"object":"list","data":[{"price":{"id":"price_x"}}],"has_more":false,"url":"/v1/subscription_items"}
			}
		}
	}`)

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 even for unknown customer (no retry storm), got %d", w.Code)
	}
	t.Log("✅ HandleStripeWebhook: unknown customer → logs error, returns 200")
}

func TestHandleStripeWebhook_CheckoutCompleted_PaymentMode_FulfillsPurchase(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)
	createSubTestUser(t, db, subUserID)

	payload := []byte(fmt.Sprintf(`{
		"id": "evt_wh_checkout_payment",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "checkout.session.completed",
		"data": {
			"object": {
				"id": "cs_test_wh_session_001",
				"object": "checkout.session",
				"mode": "payment",
				"metadata": {
					"user_id": "%d",
					"product_key": "journal_unlock"
				}
			}
		}
	}`, subUserID))

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	// HandleOneTimePurchase should have created the unlock record.
	var count int64
	db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = 'journal_unlock'", subUserID).
		Count(&count)
	if count != 1 {
		t.Fatalf("expected 1 unlock record for journal_unlock after checkout webhook, got %d", count)
	}
	t.Log("✅ HandleStripeWebhook: checkout.session.completed (payment mode) → unlock record created, 200")
}

func TestHandleStripeWebhook_CheckoutCompleted_SubscriptionMode_Skips(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	payload := []byte(`{
		"id": "evt_wh_checkout_sub",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "checkout.session.completed",
		"data": {
			"object": {
				"id": "cs_test_wh_sub_mode",
				"object": "checkout.session",
				"mode": "subscription",
				"metadata": {"user_id": "66661", "product_key": "monthly"}
			}
		}
	}`)

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	// Subscription-mode checkout is handled by customer.subscription.created — handler skips it.
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}

	// No unlock records should have been created.
	var count int64
	db.Model(&models.UserUnlock{}).Where("user_id = ?", subUserID).Count(&count)
	if count != 0 {
		t.Fatalf("expected 0 unlock records for subscription-mode checkout, got %d", count)
	}
	t.Log("✅ HandleStripeWebhook: checkout.session.completed (subscription mode) → skipped, 200")
}

func TestHandleStripeWebhook_CheckoutCompleted_MissingMetadata_Returns200(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	// Missing product_key in metadata — handler logs and returns 200 (not 500).
	payload := []byte(`{
		"id": "evt_wh_checkout_nometa",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "checkout.session.completed",
		"data": {
			"object": {
				"id": "cs_test_wh_nometa",
				"object": "checkout.session",
				"mode": "payment",
				"metadata": {"user_id": "66661"}
			}
		}
	}`)

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for missing metadata (log and skip), got %d", w.Code)
	}
	t.Log("✅ HandleStripeWebhook: checkout.session.completed missing product_key → logs, returns 200")
}

func TestHandleStripeWebhook_InvoicePaymentFailed_Returns200(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	payload := []byte(`{
		"id": "evt_wh_invoice_fail",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "invoice.payment_failed",
		"data": {
			"object": {
				"id": "in_test_001",
				"object": "invoice",
				"customer": "cus_invoice_test"
			}
		}
	}`)

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for invoice.payment_failed, got %d", w.Code)
	}
	t.Log("✅ HandleStripeWebhook: invoice.payment_failed → logs customer ID, returns 200")
}

func TestHandleStripeWebhook_UnknownEventType_Returns200(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupSubscription(db) })
	withTestWebhookSecret(t)

	payload := []byte(`{
		"id": "evt_wh_unknown_type",
		"object": "event",
		"api_version": "2024-09-30.acacia",
		"type": "customer.created",
		"data": {"object": {"id": "cus_new"}}
	}`)

	r := setupWebhookRouter(db)
	sig := signedWebhookHeader(payload, testWebhookSecret)
	w := doWebhookRequest(r, payload, sig)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 for unhandled event type, got %d", w.Code)
	}
	t.Log("✅ HandleStripeWebhook: unhandled event type → 200 (no-op)")
}
