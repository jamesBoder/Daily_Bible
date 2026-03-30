package services

import (
	"dailybible/internal/models"
	"os"
	"strconv"
	"strings"
	"time"

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

// IsPremium returns true if the user has an active or trialing subscription,
// OR if their subscription is canceled/past_due but the current period has not yet ended
// (access is preserved through the paid period even after cancellation).
// DEV_PREMIUM_USER_IDS overrides are respected for test/dev users.
func (s *StripeSubscriptionChecker) IsPremium(userID uint) bool {
	if s.overrideIDs[userID] {
		return true
	}

	var sub models.UserSubscription
	if err := s.db.Where("user_id = ?", userID).First(&sub).Error; err != nil {
		return false // no record = free user
	}

	switch sub.Status {
	case "active", "trialing":
		return true
	case "canceled":
		// Preserve access through the end of the paid period.
		if sub.CurrentPeriodEnd != nil && sub.CurrentPeriodEnd.After(time.Now()) {
			return true
		}
	case "past_due":
		// Payment failed but not yet canceled — Stripe gives a grace window.
		// Keep premium access during this window to avoid penalizing users for
		// temporary payment failures (expired card, etc.).
		if sub.CurrentPeriodEnd != nil && sub.CurrentPeriodEnd.After(time.Now()) {
			return true
		}
	}
	return false
}
