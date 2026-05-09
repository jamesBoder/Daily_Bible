package models

import (
	"time"
)

// UserBlessings represents a user's blessings balance and lifetime earnings
type UserBlessings struct {
	UserID         uint `gorm:"primaryKey;type:uint"`
	Balance        int  `gorm:"default:0"`
	LifetimeEarned int  `gorm:"default:0"`
	UpdatedAt      time.Time
}

// BlessingsTransaction represents a transaction log for blessings
type BlessingsTransaction struct {
	ID        uint   `gorm:"primaryKey;autoIncrement"`
	UserID    uint   `gorm:"type:uint;index"`
	Amount    int    // positive = credit, negative = debit
	Reason    string `gorm:"size:100"` // e.g. "daily_view", "reflection_written", "milestone_rooted"
	CreatedAt time.Time
}
