package repository

import (
    "time"
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type HistoryRepository interface {
    Track(userID, verseID uint) error
    List(userID uint, limit int) ([]models.History, error)
    Clear(userID uint) error
    CleanupOld(days int) error
}

type historyRepository struct {
    db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
    return &historyRepository{db: db}
}

// Create history entry
func (r *historyRepository) Track(userID, verseID uint) error {
    history := models.History{
        UserID:   userID,
        VerseID:  verseID,
        ViewedAt: time.Now(),
    }
    return r.db.Create(&history).Error
}

// Find user's history
func (r *historyRepository) List(userID uint, limit int) ([]models.History, error) {
    var history []models.History
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").  // Load related verse
        Order("viewed_at DESC").
        Limit(limit).
        Find(&history).Error
    return history, err
}

// Delete old history (older than 90 days)
func (r *historyRepository) CleanupOld(days int) error {
    cutoff := time.Now().AddDate(0, 0, -days)
    return r.db.Where("viewed_at < ?", cutoff).
        Delete(&models.History{}).Error
}

// Count user's history
func (r *historyRepository) Clear(userID uint) error {
    return r.db.Where("user_id = ?", userID).
        Delete(&models.History{}).Error
}
