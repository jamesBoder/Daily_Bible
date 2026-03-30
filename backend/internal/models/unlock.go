package models

import (
    "time"
)

// UserUnlock represents unlocked features/themes for a user
type UserUnlock struct {
    ID         uint      `gorm:"primaryKey;autoIncrement"`
    UserID     uint      `gorm:"type:uint;index"`
    UnlockType string    `gorm:"size:50"`
    UnlockKey  string    `gorm:"size:100"` // e.g. "theme_midnight_prayer"
    Source     string    `gorm:"size:50"`  // "blessings", "purchase", "subscription"
    UnlockedAt time.Time
}