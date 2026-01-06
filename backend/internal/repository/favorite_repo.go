package repository

import (
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type FavoriteRepository struct {
    db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) *FavoriteRepository {
    return &FavoriteRepository{db: db}
}

// Create favorite
func (r *FavoriteRepository) Create(favorite *models.Favorite) error {
    return r.db.Create(favorite).Error
}

// Find user's favorites
func (r *FavoriteRepository) FindByUserID(userID uint) ([]models.Favorite, error) {
    var favorites []models.Favorite
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").  // Load verse data too
        Find(&favorites).Error
    return favorites, err
}

// Check if favorite exists
func (r *FavoriteRepository) Exists(userID, verseID uint) (bool, error) {
    var count int64
    err := r.db.Model(&models.Favorite{}).
        Where("user_id = ? AND verse_id = ?", userID, verseID).
        Count(&count).Error
    return count > 0, err
}

// Delete favorite
func (r *FavoriteRepository) Delete(userID, verseID uint) error {
    return r.db.Where("user_id = ? AND verse_id = ?", userID, verseID).
        Delete(&models.Favorite{}).Error
}

// Count user's favorites
func (r *FavoriteRepository) CountByUserID(userID uint) (int64, error) {
    var count int64
    err := r.db.Model(&models.Favorite{}).
        Where("user_id = ?", userID).
        Count(&count).Error
    return count, err
}
