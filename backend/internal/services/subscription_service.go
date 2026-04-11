package services

import (
	"dailybible/internal/models"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/stripe/stripe-go/v80"
	"github.com/stripe/stripe-go/v80/customer"
	"github.com/stripe/stripe-go/v80/subscription"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SubscriptionService handles Stripe API operations and one-time purchase fulfillment.
// It is separate from StripeSubscriptionChecker, which only reads from the local DB.
type SubscriptionService struct {
	db             *gorm.DB
	rewardsService *RewardsService
	streakService  *StreakService
}

// NewSubscriptionService creates a SubscriptionService.
func NewSubscriptionService(db *gorm.DB, rewardsService *RewardsService, streakService *StreakService) *SubscriptionService {
	return &SubscriptionService{
		db:             db,
		rewardsService: rewardsService,
		streakService:  streakService,
	}
}

// GetOrCreateStripeCustomer returns the Stripe Customer ID for the user, creating one
// in Stripe if needed. Uses an idempotency key so a timeout+retry never creates a duplicate.
// If the UserSubscription record doesn't exist yet, it is created with Status="none".
func (s *SubscriptionService) GetOrCreateStripeCustomer(userID uint, email, username string) (string, error) {
	var sub models.UserSubscription
	s.db.Where("user_id = ?", userID).First(&sub)
	if sub.StripeCustomerID != "" {
		return sub.StripeCustomerID, nil
	}

	params := &stripe.CustomerParams{
		Email: stripe.String(email),
		Name:  stripe.String(username),
		Metadata: map[string]string{
			"user_id": strconv.Itoa(int(userID)),
		},
	}
	// Idempotency key: if our server times out after calling customer.New but before
	// writing to DB, a retry with the same key returns the same Stripe customer.
	params.SetIdempotencyKey(fmt.Sprintf("customer-create-%d", userID))

	c, err := customer.New(params)
	if err != nil {
		return "", err
	}

	// Upsert — sets StripeCustomerID, leaves Status as "none".
	if err := s.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"stripe_customer_id"}),
	}).Create(&models.UserSubscription{
		UserID:           userID,
		Status:           "none",
		StripeCustomerID: c.ID,
	}).Error; err != nil {
		// Customer was created in Stripe but we can't store the ID locally.
		// Return an error so the caller (checkout endpoint) returns 500 and the
		// user retries — the idempotency key ensures Stripe returns the same customer.
		return "", fmt.Errorf("GetOrCreateStripeCustomer: failed to store customer ID locally: %w", err)
	}

	return c.ID, nil
}

// GetSubscription returns the user's subscription record.
// Returns a zero-value struct with Status="none" if no record exists.
func (s *SubscriptionService) GetSubscription(userID uint) models.UserSubscription {
	var sub models.UserSubscription
	s.db.Where("user_id = ?", userID).First(&sub)
	if sub.UserID == 0 {
		sub.Status = "none"
	}
	return sub
}

// SyncFromWebhook upserts the local UserSubscription from Stripe webhook event data.
// Idempotent: safe to call multiple times for the same event (Save/upsert on primary key).
// Returns the internal userID that was updated so the caller can invalidate any caches.
func (s *SubscriptionService) SyncFromWebhook(stripeSubID, stripeStatus, stripePriceID, customerID string, periodEnd *time.Time, canceledAt *time.Time) (uint, error) {
	plan := planFromPriceID(stripePriceID)
	status := mapStripeStatus(stripeStatus)

	// Look up userID by StripeCustomerID (requires index on stripe_customer_id).
	var existing models.UserSubscription
	if err := s.db.Where("stripe_customer_id = ?", customerID).First(&existing).Error; err != nil {
		return 0, fmt.Errorf("no local user found for Stripe customer %s", customerID)
	}

	existing.Status               = status
	existing.Plan                 = plan
	existing.StripeSubscriptionID = stripeSubID
	existing.CurrentPeriodEnd     = periodEnd
	existing.CanceledAt           = canceledAt
	existing.UpdatedAt            = time.Now()
	// Clear pending checkout tracking on completion.
	existing.PendingCheckoutSessionID = ""
	existing.PendingCheckoutExpiresAt = nil

	if err := s.db.Save(&existing).Error; err != nil {
		return 0, err
	}

	// On activation: upgrade badges and flush any queued grace days from pre-upgrade purchases.
	if status == "active" || status == "trialing" {
		uid := existing.UserID
		go func() {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("SyncFromWebhook goroutine panic for user %d: %v", uid, r)
				}
			}()
			s.rewardsService.UpgradeBadgesToPremium(uid)
			if err := s.streakService.FlushGraceDaysQueue(uid); err != nil {
				log.Printf("FlushGraceDaysQueue failed for user %d: %v", uid, err)
			}
		}()
	}

	return existing.UserID, nil
}

// StorePendingCheckout stores the pending Stripe checkout session ID to prevent duplicates.
func (s *SubscriptionService) StorePendingCheckout(userID uint, sessionID string, expiresAt time.Time) {
	s.db.Model(&models.UserSubscription{}).
		Where("user_id = ?", userID).
		Updates(map[string]interface{}{
			"pending_checkout_session_id": sessionID,
			"pending_checkout_expires_at": expiresAt,
		})
}

// HandleOneTimePurchase fulfills a one-time Stripe purchase by creating a UserUnlock record.
// stripeSessionID is the idempotency key — required for consumable products (grace_day_pack)
// that can be purchased multiple times.
func (s *SubscriptionService) HandleOneTimePurchase(userID uint, productKey string, stripeSessionID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		return s.handleOneTimePurchaseWithTx(tx, userID, productKey, stripeSessionID)
	})
}

// HandleOneTimePurchaseWithTx is the transaction-aware variant called from the webhook handler
// so the webhook can control the transaction boundary and return 500 on commit failure.
func (s *SubscriptionService) HandleOneTimePurchaseWithTx(tx *gorm.DB, userID uint, productKey string, stripeSessionID string) error {
	return s.handleOneTimePurchaseWithTx(tx, userID, productKey, stripeSessionID)
}

func (s *SubscriptionService) handleOneTimePurchaseWithTx(tx *gorm.DB, userID uint, productKey string, stripeSessionID string) error {
	switch productKey {
	case "grace_day_pack":
		return s.fulfillGraceDayPackWithTx(tx, userID, stripeSessionID)
	case "full_theme_library":
		return s.fulfillFullThemeLibraryWithTx(tx, userID)
	case "premium_lifetime":
		created, err := s.createUnlockRecordWithTx(tx, userID, "premium_lifetime")
		if err != nil {
			return err
		}
		if created {
			uid := userID
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("premium_lifetime goroutine panic for user %d: %v", uid, r)
					}
				}()
				s.rewardsService.UpgradeBadgesToPremium(uid)
				if err := s.streakService.FlushGraceDaysQueue(uid); err != nil {
					log.Printf("FlushGraceDaysQueue failed for user %d: %v", uid, err)
				}
			}()
		}
		return nil
	case "premium_badges":
		created, err := s.createUnlockRecordWithTx(tx, userID, "premium_badges")
		if err != nil {
			return err
		}
		if created {
			uid := userID
			go func() {
				defer func() { recover() }()
				s.rewardsService.UpgradeBadgesToPremium(uid)
			}()
		}
		return nil
	// Individual theme purchases — must write unlock_type:"theme" so the theme system sees them.
	case "theme_sanctuary", "theme_desert_sand", "theme_celestial", "theme_scarlet_grace":
		return s.fulfillIndividualThemeWithTx(tx, userID, productKey)
	default:
		_, err := s.createUnlockRecordWithTx(tx, userID, productKey)
		return err
	}
}

// HasOneTimePurchase checks if the user has a permanent one-time purchase unlock.
// NOTE: Does NOT check grace_day_pack (consumable — keys use session-scoped format).
func (s *SubscriptionService) HasOneTimePurchase(userID uint, productKey string) bool {
	var count int64
	s.db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = ?", userID, productKey).
		Count(&count)
	return count > 0
}

// GetOwnedPurchaseKeys returns all non-consumable purchase unlock keys for the user.
// Grace day packs are excluded because they are consumable and use session-scoped keys.
func (s *SubscriptionService) GetOwnedPurchaseKeys(userID uint) []string {
	var keys []string
	s.db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key NOT LIKE 'grace_day_pack_%'", userID).
		Pluck("unlock_key", &keys)
	if keys == nil {
		keys = []string{}
	}
	return keys
}

// CancelImmediately cancels the user's Stripe subscription immediately (for account deletion only).
func (s *SubscriptionService) CancelImmediately(userID uint) error {
	sub := s.GetSubscription(userID)
	if sub.StripeSubscriptionID == "" {
		return nil
	}
	_, err := subscription.Cancel(sub.StripeSubscriptionID, nil)
	return err
}

// fulfillGraceDayPackWithTx uses the Stripe session ID as idempotency key.
// Each paid session gets its own UserUnlock record so multiple purchases are each fulfilled once.
// Both the UserUnlock write and the grace day credit share the caller's tx so they are atomic:
// if either fails, the whole transaction rolls back and the webhook returns 500 for Stripe to retry.
func (s *SubscriptionService) fulfillGraceDayPackWithTx(tx *gorm.DB, userID uint, stripeSessionID string) error {
	idempotencyKey := "grace_day_pack_" + stripeSessionID
	created, err := s.createUnlockRecordWithTx(tx, userID, idempotencyKey)
	if err != nil {
		return err
	}
	if !created {
		return nil // duplicate webhook replay — already fulfilled
	}
	return s.streakService.AddGraceDaysTx(tx, userID, 3)
}

// fulfillFullThemeLibraryWithTx creates unlock records for every current premium theme
// plus a master record for the bundle itself.
// WARNING: Do NOT add new themes to this list in future phases.
// The product description states "all current themes — not future themes."
func (s *SubscriptionService) fulfillFullThemeLibraryWithTx(tx *gorm.DB, userID uint) error {
	themeIDs := []string{"sanctuary", "desert-sand", "celestial", "scarlet-grace"}
	// Master record for the bundle
	if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserUnlock{
		UserID: userID, UnlockType: "purchase", UnlockKey: "full_theme_library", Source: "stripe",
	}).Error; err != nil {
		return fmt.Errorf("fulfillFullThemeLibrary: master record: %w", err)
	}
	// Individual theme records so UnlockService.GetUnlockedThemeIDs sees them
	for _, id := range themeIDs {
		if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserUnlock{
			UserID: userID, UnlockType: "theme", UnlockKey: id, Source: "stripe",
		}).Error; err != nil {
			return fmt.Errorf("fulfillFullThemeLibrary: theme %q: %w", id, err)
		}
	}
	return nil
}

// fulfillIndividualThemeWithTx writes a unlock_type:"theme" record for a single purchased theme.
// The theme product key (e.g. "theme_sanctuary") is stripped of its "theme_" prefix to get the
// theme ID used by the frontend theme system (e.g. "sanctuary").
func (s *SubscriptionService) fulfillIndividualThemeWithTx(tx *gorm.DB, userID uint, productKey string) error {
	// Strip "theme_" prefix and convert underscore to the canonical theme ID format.
	// "theme_sanctuary" → "sanctuary", "theme_desert_sand" → "desert-sand"
	themeIDMap := map[string]string{
		"theme_sanctuary":   "sanctuary",
		"theme_desert_sand": "desert-sand",
		"theme_celestial":   "celestial",
		"theme_scarlet_grace": "scarlet-grace",
	}
	themeID, ok := themeIDMap[productKey]
	if !ok {
		return fmt.Errorf("unknown individual theme product key: %s", productKey)
	}
	if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserUnlock{
		UserID: userID, UnlockType: "theme", UnlockKey: themeID, Source: "stripe",
	}).Error; err != nil {
		return fmt.Errorf("fulfillIndividualTheme: %w", err)
	}
	return nil
}

// createUnlockRecordWithTx inserts a UserUnlock record using ON CONFLICT DO NOTHING.
// Returns (true, nil) on new insert, (false, nil) if already exists, (false, err) on DB error.
func (s *SubscriptionService) createUnlockRecordWithTx(tx *gorm.DB, userID uint, key string) (bool, error) {
	result := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserUnlock{
		UserID:     userID,
		UnlockType: "purchase",
		UnlockKey:  key,
		Source:     "stripe",
	})
	if result.Error != nil {
		return false, result.Error
	}
	return result.RowsAffected > 0, nil
}

// planFromPriceID maps a Stripe price ID to our plan name.
func planFromPriceID(priceID string) string {
	if priceID == os.Getenv("STRIPE_PRICE_MONTHLY") {
		return "monthly"
	}
	if priceID == os.Getenv("STRIPE_PRICE_ANNUAL") {
		return "annual"
	}
	return ""
}

// mapStripeStatus converts Stripe's subscription status strings to our internal vocabulary.
func mapStripeStatus(stripeStatus string) string {
	switch stripeStatus {
	case "active":   return "active"
	case "trialing": return "trialing"
	case "past_due": return "past_due"
	case "canceled": return "canceled"
	case "unpaid":   return "past_due" // treat unpaid as past_due for UX
	default:         return "none"
	}
}

// ProductKeyToPriceID maps a product key to the Stripe price ID from env vars.
// Keys must match exactly what the frontend sends in { "product_key": "..." }.
func ProductKeyToPriceID(key string) string {
	m := map[string]string{
		"premium_lifetime":    os.Getenv("STRIPE_PRICE_PREMIUM_LIFETIME"),
		"grace_day_pack":      os.Getenv("STRIPE_PRICE_GRACE_DAY_PACK"),
		"reflection_archive":  os.Getenv("STRIPE_PRICE_REFLECTION_ARCHIVE"),
		"journal_unlock":      os.Getenv("STRIPE_PRICE_JOURNAL_UNLOCK"),
		"full_theme_library":  os.Getenv("STRIPE_PRICE_FULL_THEME_LIBRARY"),
		"modern_translations": os.Getenv("STRIPE_PRICE_MODERN_TRANSLATIONS"),
		"theme_sanctuary":     os.Getenv("STRIPE_PRICE_THEME_SANCTUARY"),
		"theme_desert_sand":   os.Getenv("STRIPE_PRICE_THEME_DESERT_SAND"),
		"theme_celestial":     os.Getenv("STRIPE_PRICE_THEME_CELESTIAL"),
		"theme_scarlet_grace": os.Getenv("STRIPE_PRICE_THEME_SCARLET_GRACE"),
		"premium_badges":      os.Getenv("STRIPE_PRICE_PREMIUM_BADGES"),
		"support_developer":   os.Getenv("STRIPE_PRICE_SUPPORT"),
	}
	return m[key]
}
