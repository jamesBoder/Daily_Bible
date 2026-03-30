package models

import "time"

// UserSubscription stores Stripe subscription state for a user.
// Indexed on StripeCustomerID and StripeSubscriptionID for fast webhook lookups.
type UserSubscription struct {
	UserID               uint       `gorm:"primaryKey"`
	Status               string     `gorm:"size:20;default:'none'"` // "none", "active", "canceled", "past_due", "trialing"
	Plan                 string     `gorm:"size:20"`                 // "monthly", "annual", "" for none
	StripeCustomerID     string     `gorm:"size:100;index"`          // indexed — webhooks look up by customer ID
	StripeSubscriptionID string     `gorm:"size:100;index"`
	CurrentPeriodEnd     *time.Time
	CanceledAt           *time.Time
	// Pending checkout session tracking — prevents duplicate Stripe sessions (§8.18.1)
	PendingCheckoutSessionID string     `gorm:"size:100"`
	PendingCheckoutExpiresAt *time.Time
	UpdatedAt                time.Time
}
