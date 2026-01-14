package repository

import (

    "gorm.io/gorm"
    "dailybible/internal/models"
)

// FavoriteRepository defines the interface for favorite-related database operations.
type FavoriteRepository interface {
    Create(favorite *models.Favorite) error
    GetByID(id uint) (*models.Favorite, error)
    GetByUserID(userID uint) ([]models.Favorite, error)
    GetByUserIDPaginated(userID uint, limit int, offset int) ([]models.Favorite, int64, error)
    Delete(id uint) error
    DeleteByUserAndVerse(userID uint, verseID uint) error
    Exists(userID uint, verseID uint) (bool, error)
    ListAll() ([]models.Favorite, error)
    SearchFavorites(userID uint, query string, limit, offset int) ([]models.Favorite, int64, error)
}

// favoriteRepository is the concrete implementation of FavoriteRepository using GORM.
type favoriteRepository struct {
    db *gorm.DB
}

// NewFavoriteRepository creates a new instance of FavoriteRepository.
func NewFavoriteRepository(db *gorm.DB) FavoriteRepository {
    return &favoriteRepository{db: db}
}

// Create adds a new favorite record to the database.
func (r *favoriteRepository) Create(favorite *models.Favorite) error {
    return r.db.Create(favorite).Error
}

// // GetByID retrieves a favorite by ID

func (r *favoriteRepository) GetByID(id uint) (*models.Favorite, error) {
    var favorite models.Favorite
    // error handling
    if err := r.db.First(&favorite, id).Error; err != nil {
        return nil, err
    }
    return &favorite, nil
}

// GetBy    UserID retrieves all favorites for a specific user.
func (r *favoriteRepository) GetByUserID(userID uint) ([]models.Favorite, error) {
    var favorites []models.Favorite
    if err := r.db.Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
        return nil, err
    }
    return favorites, nil
}

// GetByUserIDPaginated retrieves a paginated list of favorites for a specific user.
func (r *favoriteRepository) GetByUserIDPaginated(userID uint, limit int, offset int) ([]models.Favorite, int64, error) {
    var favorites []models.Favorite
    var total int64

    if err := r.db.Model(&models.Favorite{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
        return nil, 0, err
    }

    if err := r.db.Where("user_id = ?", userID).Limit(limit).Offset(offset).Find(&favorites).Error; err != nil {
        return nil, 0, err
    }

    return favorites, total, nil
    
}

// Delete removes a favorite record by ID.
func (r *favoriteRepository) Delete(id uint) error {
    return r.db.Delete(&models.Favorite{}, id).Error
}

// DeleteByUserAndVerse removes a favorite record by user ID and verse ID.
func (r *favoriteRepository) DeleteByUserAndVerse(userID uint, verseID uint) error {
    return r.db.Where("user_id = ? AND verse_id = ?", userID, verseID).Delete(&models.Favorite{}).Error
}

// Exists checks if a favorite exists for a given user ID and verse ID.
func (r *favoriteRepository) Exists(userID uint, verseID uint) (bool, error) {
    var count int64
    if err := r.db.Model(&models.Favorite{}).Where("user_id = ? AND verse_id = ?", userID, verseID).Count(&count).Error; err != nil {
        return false, err
    }
    return count > 0, nil
}

// ListAll retrieves all favorite records from the database.
func (r *favoriteRepository) ListAll() ([]models.Favorite, error) {
    var favorites []models.Favorite
    if err := r.db.Find(&favorites).Error; err != nil {
        return nil, err
    }
    return favorites, nil
}


// SearchFavorites searches for favorites based on a query string with pagination.
func (r *favoriteRepository) SearchFavorites(userID uint, query string, limit, offset int) ([]models.Favorite, int64, error) {
    var favorites []models.Favorite
    var total int64

    // build the query
    dbQuery := r.db.Joins("JOIN verses ON favorites.verse_id = verses.id").Where("favorites.user_id = ? AND verses.text LIKE ?", userID, "%"+query+"%")
    if query != "" {
        searchPattern := "%" + query + "%"
        db = db.Where("verses.text ILIKE ? OR verses.reference ILIKE ?", searchPattern, searchPattern)
    }

    // get total count
    if err := dbQuery.Model(&models.Favorite{}).Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // get resuts
    err := db.Preload("Verse").Order("favorites.created_at DESC").Limit(limit).Offset(offset).Find(&favorites).Error
    if err != nil {
        return nil, 0, err
    }

    return favorites, total, nil
}




