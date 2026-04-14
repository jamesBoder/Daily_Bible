package models

import "time"

// StreakReminderLog tracks streak-break warning emails sent to users.
// Separate from EmailReminderLog (daily verse) so the two flows don't
// interfere with each other's dedup logic.
type StreakReminderLog struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint `gorm:"not null;uniqueIndex:idx_streak_reminder_user_date"`
	// "YYYY-MM-DD" in the user's own timezone — same convention as EmailReminderLog.
	SentDate string    `gorm:"type:varchar(10);not null;uniqueIndex:idx_streak_reminder_user_date"`
	SentAt   time.Time `gorm:"not null"`
	Status   string    `gorm:"type:varchar(10);not null"` // "sent" | "failed"
	Error    string    `gorm:"type:text"`
}
