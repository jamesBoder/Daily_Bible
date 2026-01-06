package repository

import (
    "time"
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type HistoryRepository struct {
    db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) *HistoryRepository {
    return &HistoryRepository{db: db}
}

// Create history entry
func (r *HistoryRepository) Create(history *models.History) error {
    return r.db.Create(history).Error
}

// Find user's history
func (r *HistoryRepository) FindByUserID(userID uint, limit int) ([]models.History, error) {
    var history []models.History
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Limit(limit).
        Find(&history).Error
    return history, err
}

// Delete old history (older than 90 days)
func (r *HistoryRepository) DeleteOld(days int) error {
    cutoff := time.Now().AddDate(0, 0, -days)
    return r.db.Where("viewed_at < ?", cutoff).
        Delete(&models.History{}).Error
}

// Count user's history
func (r *HistoryRepository) CountByUserID(userID uint) (int64, error) {
    var count int64
    err := r.db.Model(&models.History{}).
        Where("user_id = ?", userID).
        Count(&count).Error
    return count, err
}
