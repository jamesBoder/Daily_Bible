package models

import (
    "time"
)

// UserStreak represents a user's streak tracking data
type UserStreak struct {
    UserID             uint    `gorm:"primaryKey;type:uint"`
    CurrentStreak      int     `gorm:"default:0"`
    LongestStreak      int     `gorm:"default:0"`
    // Stored as "YYYY-MM-DD" in the user's LOCAL timezone — never a UTC timestamp.
    // Using a string removes all timezone-conversion ambiguity at the storage layer.
    LastActiveDate     *string `gorm:"size:10"`
    GraceDaysRemaining int     `gorm:"default:1"`
    GraceDaysResetAt   *time.Time // 30 days from account creation, then 30d from each accrual
    // Phase 8: overflow pool for free users who bought the grace day pack.
    // Days above the free cap (2) wait here; each use drains one queued day back into the balance.
    // Premium users have no cap so queuing never applies; FlushGraceDaysQueue empties this on upgrade.
    GraceDaysQueued    int        `gorm:"default:0"`
    UpdatedAt          time.Time
}