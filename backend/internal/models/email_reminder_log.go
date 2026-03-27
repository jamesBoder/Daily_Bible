package models

import "time"

type EmailReminderLog struct {
	ID     uint   `gorm:"primaryKey"`
	UserID uint   `gorm:"not null;uniqueIndex:idx_user_date"`
	// "YYYY-MM-DD" in the user's own timezone — stored as a string to avoid
	// UTC/local ambiguity. A user in UTC-10 whose email fires at 08:00 local
	// is still date "2026-03-24" locally even if UTC has rolled to "2026-03-25".
	SentDate string    `gorm:"type:varchar(10);not null;uniqueIndex:idx_user_date"`
	SentAt   time.Time `gorm:"not null"`
	Status   string    `gorm:"type:varchar(10);not null"` // "sent" | "failed"
	Error    string    `gorm:"type:text"`                 // non-empty on failure only
}
