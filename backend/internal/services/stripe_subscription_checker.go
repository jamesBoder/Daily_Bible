package services

import (
	"dailybible/internal/models"
	"os"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

// StripeSubscriptionChecker is the Phase 8 real implementation of SubscriptionChecker.
// It reads subscription status from the local UserSubscription table, which is kept
// current by the Stripe webhook handler. No live Stripe API call is made on each check.
//
// DEV_PREMIUM_USER_IDS is still honored so developers can test premium features locally
// without going through the checkout flow.
type StripeSubscriptionChecker struct {
	db          *gorm.DB
	overrideIDs map[uint]bool
}

// NewStripeSubscriptionChecker creates a StripeSubscriptionChecker, loading any
// developer override IDs from the DEV_PREMIUM_USER_IDS environment variable.
func NewStripeSubscriptionChecker(db *gorm.DB) SubscriptionChecker {
	overrides := map[uint]bool{}
	if raw := os.Getenv("DEV_PREMIUM_USER_IDS"); raw != "" {
		for _, part := range strings.Split(raw, ",") {
			part = strings.TrimSpace(part)
			if id, err := strconv.ParseUint(part, 10, 64); err == nil {
				overrides[uint(id)] = true
			}
		}
	}
	return &StripeSubscriptionChecker{db: db, overrideIDs: overrides}
}

// IsPremium returns true if the user has a lifetime purchase unlock,
// OR an active/trialing subscription (legacy path, kept for backward compatibility).
// DEV_PREMIUM_USER_IDS overrides are respected for test/dev users.
func (s *StripeSubscriptionChecker) IsPremium(userID uint) bool {
	if s.overrideIDs[userID] {
		return true
	}

	// Lifetime one-time purchase — primary path going forward.
	var count int64
	s.db.Model(&models.UserUnlock{}).
		Where("user_id = ? AND unlock_type = 'purchase' AND unlock_key = 'premium_lifetime'", userID).
		Count(&count)
	if count > 0 {
		return true
	}

	return false
}
