package main

import (
    "dailybible/internal/database"
    "dailybible/internal/models"
    "dailybible/internal/utils"
    "log"
    "time"

    "gorm.io/gorm"
    "gorm.io/gorm/clause"
)

func main() {
    // Connect to database
    db, err := database.Connect()
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }

    log.Println("Starting backfill for existing users...")
    
    // Get all users
    var users []models.User
    if err := db.Find(&users).Error; err != nil {
        log.Fatalf("Failed to fetch users: %v", err)
    }
    
    log.Printf("Found %d users to backfill", len(users))
    
    for _, user := range users {
        if err := backfillUserStreak(db, user); err != nil {
            log.Printf("Failed to backfill user %d: %v", user.ID, err)
            continue
        }
        log.Printf("Successfully backfilled user %d (%s)", user.ID, user.Username)
    }
    
    log.Println("Backfill complete!")
}

func backfillUserStreak(db *gorm.DB, user models.User) error {
    // Get user settings for timezone
    var settings models.UserSettings
    if err := db.Where("user_id = ?", user.ID).First(&settings).Error; err != nil {
        // Create default settings if not found
        settings = models.UserSettings{
            UserID:            user.ID,
            PreferredTimezone: "UTC",
        }
        db.Create(&settings)
    }
    
    // Get all history entries for the user, ordered by date
    var history []models.History
    if err := db.Where("user_id = ?", user.ID).Order("viewed_at ASC").Find(&history).Error; err != nil {
        return err
    }
    
    if len(history) == 0 {
        // No history, initialize with defaults
        return initializeUserStreak(db, user.ID)
    }
    
    // Calculate streaks from history
    currentStreak := 0
    longestStreak := 0
    var lastActiveDate *string
    var previousDate string
    
    for _, h := range history {
        // Convert viewed_at to local date string
        // Assuming history.ViewedAt is UTC, convert to user's local timezone
        loc := loadLocation(settings.PreferredTimezone)
        dateLocal := h.ViewedAt.In(loc).Format("2006-01-02")
        
        // Skip if same day as previous (multiple views in same day)
        if dateLocal == previousDate {
            continue
        }
        
        // Write to activity log
        db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserActivityLog{
            UserID:     user.ID,
            ActionType: "daily_engagement",
            DateLocal:  dateLocal,
        })
        
        if previousDate == "" {
            // First entry
            currentStreak = 1
            longestStreak = 1
        } else {
            // Check if consecutive day
            prevTime, _ := time.Parse("2006-01-02", previousDate)
            currTime, _ := time.Parse("2006-01-02", dateLocal)
            daysDiff := int(currTime.Sub(prevTime).Hours() / 24)
            
            if daysDiff == 1 {
                // Consecutive day
                currentStreak++
                if currentStreak > longestStreak {
                    longestStreak = currentStreak
                }
            } else if daysDiff > 1 {
                // Gap in streak
                currentStreak = 1
            }
        }
        
        lastActiveDate = &dateLocal
        previousDate = dateLocal
    }
    
    // Create UserStreak record
    graceDaysResetAt := time.Now().Add(30 * 24 * time.Hour)
    streak := models.UserStreak{
        UserID:             user.ID,
        CurrentStreak:      currentStreak,
        LongestStreak:      longestStreak,
        LastActiveDate:     lastActiveDate,
        GraceDaysRemaining: 1,
        GraceDaysResetAt:   &graceDaysResetAt,
    }
    
    if err := db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "user_id"}},
        DoUpdates: clause.AssignmentColumns([]string{"current_streak", "longest_streak", "last_active_date", "grace_days_remaining", "grace_days_reset_at", "updated_at"}),
    }).Create(&streak).Error; err != nil {
        return err
    }
    
    // Initialize UserBlessings with zero balance (no retroactive blessings)
    blessings := models.UserBlessings{
        UserID:         user.ID,
        Balance:        0,
        LifetimeEarned: 0,
    }
    
    if err := db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "user_id"}},
        DoNothing: true,
    }).Create(&blessings).Error; err != nil {
        return err
    }
    
    // TODO: Phase 2 - Add milestone backfill logic here
    // For now, we skip milestone creation
    
    return nil
}

func initializeUserStreak(db *gorm.DB, userID uint) error {
    // Initialize with default values for users with no history
    graceDaysResetAt := time.Now().Add(30 * 24 * time.Hour)
    streak := models.UserStreak{
        UserID:             userID,
        CurrentStreak:      0,
        LongestStreak:      0,
        LastActiveDate:     nil,
        GraceDaysRemaining: 1,
        GraceDaysResetAt:   &graceDaysResetAt,
    }
    
    if err := db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "user_id"}},
        DoNothing: true,
    }).Create(&streak).Error; err != nil {
        return err
    }
    
    // Initialize UserBlessings
    blessings := models.UserBlessings{
        UserID:         userID,
        Balance:        0,
        LifetimeEarned: 0,
    }
    
    return db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "user_id"}},
        DoNothing: true,
    }).Create(&blessings).Error
}

func loadLocation(ianaName string) *time.Location {
    if ianaName == "" {
        return time.UTC
    }
    loc, err := time.LoadLocation(ianaName)
    if err != nil {
        return time.UTC
    }
    return loc
}