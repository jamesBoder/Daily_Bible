package models

import "time"

// EmailSubscriber stores email addresses captured from the public landing page.
// These are visitors who opted in before creating an account.
// The unsubscribe_token allows one-click unsubscribe without auth.
type EmailSubscriber struct {
	ID               uint      `gorm:"primaryKey"`
	Email            string    `gorm:"type:varchar(320);not null;uniqueIndex"`
	Source           string    `gorm:"type:varchar(50);not null;default:'landing_page'"`
	UnsubscribeToken string    `gorm:"type:varchar(64);not null;uniqueIndex"`
	SubscribedAt     time.Time `gorm:"not null"`
}
