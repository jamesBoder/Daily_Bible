package models

import (
    "time"
)

// UserActivityLog is the ground truth for streak computation and calendar rendering.
// UserStreak.CurrentStreak is maintained for read performance but can always be
// recomputed from this table if it drifts.
type UserActivityLog struct {
    ID         uint   `gorm:"primaryKey;autoIncrement"`
    UserID     uint   `gorm:"type:uint;index:idx_activity_user_date"`
    ActionType string `gorm:"size:50"`  // "daily_engagement", "grace_day_used"
    DateLocal  string `gorm:"size:10;index:idx_activity_user_date"` // "YYYY-MM-DD" in user's local timezone
    CreatedAt  time.Time
}

// A partial unique index prevents duplicate daily_engagement entries even under concurrent writes.
// Create this via raw SQL in a migration hook (GORM tags alone cannot express partial indexes):
//
//   CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_engagement
//   ON user_activity_logs (user_id, date_local)
//   WHERE action_type = 'daily_engagement';