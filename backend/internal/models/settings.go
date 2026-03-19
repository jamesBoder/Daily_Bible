package models

import (
    "time"
    "gorm.io/gorm"
)

// UserSettings represents user-specific settings and preferences
type UserSettings struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Foreign key to User
    UserID uint `gorm:"uniqueIndex;not null" json:"user_id"`
    User   User `gorm:"foreignKey:UserID" json:"-"`
    
    // Language and localization
    PreferredLanguage     string `gorm:"size:10;default:'en'"  json:"preferred_language"`
    PreferredBibleVersion string `gorm:"size:50;default:'kjv'" json:"preferred_bible_version"`
    
    // Notification preferences
    EmailNotifications   bool `gorm:"default:true" json:"email_notifications"`
    DailyVerseReminder   bool `gorm:"default:true" json:"daily_verse_reminder"`
    
    // Display preferences
    DarkMode    bool   `gorm:"default:false" json:"dark_mode"`
    ActiveTheme string `gorm:"default:'parchment';size:50" json:"active_theme"`
    
    // Timezone preference (IANA timezone name, e.g., "America/New_York")
    PreferredTimezone string `gorm:"size:50;default:'UTC'" json:"preferred_timezone"`
}