package models

import (
	"time"
)

// RosaryCompletion records that a user completed a full Rosary on a given calendar day.
// The unique index on (user_id, completed_date) enforces the once-per-day idempotency
// for the 50-Blessings credit.
type RosaryCompletion struct {
	ID            uint      `gorm:"primaryKey;autoIncrement"`
	UserID        uint      `gorm:"index;uniqueIndex:idx_rosary_user_date"`
	CompletedDate time.Time `gorm:"type:date;uniqueIndex:idx_rosary_user_date"`
	MysterySet    string    `gorm:"size:20"` // "joyful", "sorrowful", "glorious", "luminous"
	CreatedAt     time.Time
}
