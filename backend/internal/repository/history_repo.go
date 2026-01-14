package repository

import (
    "time"
    "dailybible/internal/models"
    "gorm.io/gorm"
)

type HistoryRepository interface {
    Create(history *models.History) error
    GetByUserID(userID uint) ([]models.History, error)
    GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error)
    DeleteByUserID(userID uint) error
    DeleteOlderThan(userID uint, date time.Time) error
}

type historyRepository struct {
    db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
    return &historyRepository{db: db}
}

// Create adds a new history entry
func (r *historyRepository) Create(history *models.History) error {
    return r.db.Create(history).Error
}

// GetByUserID retrieves all history for a user
func (r *historyRepository) GetByUserID(userID uint) ([]models.History, error) {
    var history []models.History
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Find(&history).Error
    return history, err
}

// GetByUserIDPaginated retrieves history with pagination
func (r *historyRepository) GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error) {
    var history []models.History
    var total int64
    
    // Get total count
    r.db.Model(&models.History{}).Where("user_id = ?", userID).Count(&total)
    
    // Get paginated results
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&history).Error
    
    return history, total, err
}

// DeleteByUserID clears all history for a user
func (r *historyRepository) DeleteByUserID(userID uint) error {
    return r.db.Where("user_id = ?", userID).Delete(&models.History{}).Error
}

// DeleteOlderThan removes history entries older than specified date
func (r *historyRepository) DeleteOlderThan(userID uint, date time.Time) error {
    return r.db.Where("user_id = ? AND viewed_at < ?", userID, date).
        Delete(&models.History{}).Error
}