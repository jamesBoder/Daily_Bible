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
        // Phase 3
        &models.JournalEntry{},
        &models.JournalPrompt{},
        // Phase 8
        &models.UserSubscription{},
        // Phase 9
        &models.UserFriend{},
    ); err != nil {
        return err
    }

    // Partial unique index — must be created explicitly
    if err := db.Exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_daily_engagement
        ON user_activity_logs (user_id, date_local)
        WHERE action_type = 'daily_engagement'
    `).Error; err != nil {
        return err
    }

    // Phase 6: unique constraint on (user_id, unlock_key) to prevent duplicate purchases
    if err := db.Exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_unlock_key
        ON user_unlocks (user_id, unlock_key)
    `).Error; err != nil {
        return err
    }

    // Phase 7 backfill: users who had dark_mode = true should get 'midnight' as
    // their active_theme so they don't revert to Parchment on next login.
    // Idempotent — rows already set to a non-parchment theme are untouched.
    if err := db.Exec(`
        UPDATE user_settings
        SET active_theme = 'midnight'
        WHERE dark_mode = true AND (active_theme = '' OR active_theme = 'parchment')
    `).Error; err != nil {
        return err
    }

    // Phase 4 backfill: for any user_settings row where preferred_bible_version
    // is empty, infer a sensible free-tier default from preferred_language.
    // Idempotent — rows that already have a value are untouched.
    return db.Exec(`
        UPDATE user_settings
        SET preferred_bible_version = CASE preferred_language
            WHEN 'es' THEN 'rvr1960'
            WHEN 'fr' THEN 'jnd'
            WHEN 'ht' THEN 'hatbsa'
            ELSE 'kjv'
        END
        WHERE preferred_bible_version = '' OR preferred_bible_version IS NULL
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
