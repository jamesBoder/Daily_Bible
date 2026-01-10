package repository

import (

    "gorm.io/gorm"
    "dailybible/internal/models"
)

type FavoriteRepository interface {
    Add(userID, verseID uint) error
    Remove(userID, verseID uint) error
    List(userID uint) ([]models.Favorite, error)
    Exists(userID, verseID uint) (bool, error)
}

type favoriteRepository struct {
    db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) FavoriteRepository {
    return &favoriteRepository{db: db}
}

// Create favorite
func (r *favoriteRepository) Add(userID, verseID uint) error {
    favorite := models.Favorite{
        UserID:  userID,
        VerseID: verseID,
    }
    return r.db.Create(&favorite).Error
}

// Find user's favorites
func (r *favoriteRepository) Remove(userID, verseID uint) error {
    return r.db.Where("user_id = ? AND verse_id = ?", userID, verseID).
        Delete(&models.Favorite{}).Error
}

// List favorites by user ID
func (r *favoriteRepository) List(userID uint) ([]models.Favorite, error) {
    var favorites []models.Favorite
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").  // Load related verse
        Find(&favorites).Error
    return favorites, err
}

// Check if favorite exists
func (r *favoriteRepository) Exists(userID, verseID uint) (bool, error) {
    var count int64
    err := r.db.Model(&models.Favorite{}).
        Where("user_id = ? AND verse_id = ?", userID, verseID).
        Count(&count).Error
    return count > 0, err
}


