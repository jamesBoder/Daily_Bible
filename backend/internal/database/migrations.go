package database

import (
    "gorm.io/gorm"
    "dailybible/internal/models"
)

func RunMigrations(db *gorm.DB) error {
    if err := db.AutoMigrate(
        &models.User{},
        &models.Verse{},
        &models.Favorite{},
        &models.History{},
        &models.Comment{},
        &models.PasswordHistory{},
        &models.UserSettings{},
        // Phase 1
        &models.UserStreak{},
        &models.UserBlessings{},
        &models.BlessingsTransaction{},
        &models.UserMilestone{},
        &models.UserUnlock{},
        &models.UserActivityLog{},
    ); err != nil {
        return err
    }

    // Partial unique index — must be created explicitly
    return db.Exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_engagement
        ON user_activity_logs (user_id, date_local)
        WHERE action_type = 'daily_engagement'
    `).Error
}

// BackfillDailyDates fills in daily_date for pre-migration verse rows that have
// daily_date = NULL. It derives the date from the earliest history view for each
// verse, applying the same UTC-10 (Hawaii) offset the backend uses to assign
// verse dates. A conflict guard prevents unique-constraint violations when two
// verses would resolve to the same derived date.
//
// Idempotent — safe to call on every startup; rows with a non-NULL daily_date
// are left untouched. Verses with no history entries remain NULL and continue to
// display today's date as a fallback.
func BackfillDailyDates(db *gorm.DB) (int64, error) {
    result := db.Exec(`
        UPDATE verses v
        SET daily_date = (
            SELECT (MIN(h.viewed_at) - INTERVAL '10 hours')::date
            FROM histories h
            WHERE h.verse_id = v.id
              AND h.deleted_at IS NULL
        )
        WHERE v.daily_date IS NULL
          AND v.deleted_at IS NULL
          AND EXISTS (
              SELECT 1 FROM histories h
              WHERE h.verse_id = v.id AND h.deleted_at IS NULL
          )
          AND NOT EXISTS (
              SELECT 1 FROM verses v2
              WHERE v2.daily_date = (
                  SELECT (MIN(h2.viewed_at) - INTERVAL '10 hours')::date
                  FROM histories h2
                  WHERE h2.verse_id = v.id AND h2.deleted_at IS NULL
              )
              AND v2.deleted_at IS NULL
          )
    `)
    return result.RowsAffected, result.Error
}
