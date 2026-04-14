package models

import "time"

// SubscriberReminderLog tracks daily verse emails sent to landing-page subscribers
// (EmailSubscriber rows). Kept separate from EmailReminderLog which is tied to
// registered users (UserID NOT NULL).
type SubscriberReminderLog struct {
	ID           uint   `gorm:"primaryKey"`
	SubscriberID uint   `gorm:"not null;uniqueIndex:idx_subscriber_date"`
	// "YYYY-MM-DD" in UTC — landing-page subscribers have no timezone preference.
	SentDate     string    `gorm:"type:varchar(10);not null;uniqueIndex:idx_subscriber_date"`
	SentAt       time.Time `gorm:"not null"`
	Status       string    `gorm:"type:varchar(10);not null"` // "sent" | "failed"
	Error        string    `gorm:"type:text"`                 // non-empty on failure only
}
