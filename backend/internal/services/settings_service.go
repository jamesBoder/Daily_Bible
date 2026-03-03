package services

import (
    "errors"
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type SettingsService struct {
    db *gorm.DB
}

func NewSettingsService(db *gorm.DB) *SettingsService {
    return &SettingsService{
        db: db,
    }
}

// GetUserSettings retrieves settings for a user, creating default settings if none exist
func (s *SettingsService) GetUserSettings(userID uint) (*models.UserSettings, error) {
    var settings models.UserSettings
    
    err := s.db.Where("user_id = ?", userID).First(&settings).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            // Create default settings for the user
            return s.CreateDefaultSettings(userID)
        }
        return nil, err
    }
    
    return &settings, nil
}

// CreateDefaultSettings creates default settings for a user
func (s *SettingsService) CreateDefaultSettings(userID uint) (*models.UserSettings, error) {
    settings := models.UserSettings{
        UserID:               userID,
        EmailNotifications:   true,
        DailyVerseReminder:   true,
        DarkMode:            false,
    }
    
    if err := s.db.Create(&settings).Error; err != nil {
        // If settings already exist (race condition), try to get them
        var existingSettings models.UserSettings
        if err := s.db.Where("user_id = ?", userID).First(&existingSettings).Error; err == nil {
            return &existingSettings, nil
        }
        return nil, err
    }
    
    return &settings, nil
}

// UpdateUserSettings updates settings for a user
func (s *SettingsService) UpdateUserSettings(userID uint, updates map[string]interface{}) (*models.UserSettings, error) {
    // First ensure settings exist (create if they don't)
    settings, err := s.GetUserSettings(userID)
    if err != nil {
        // If there's an error getting settings, try to create them
        settings = &models.UserSettings{
            UserID:               userID,
            EmailNotifications:   true,
            DailyVerseReminder:   true,
            DarkMode:            false,
        }
        if err := s.db.Create(settings).Error; err != nil {
            return nil, err
        }
    }
    
    // Update only the fields that are provided
    if err := s.db.Model(&settings).Updates(updates).Error; err != nil {
        return nil, err
    }
    
    return settings, nil
}