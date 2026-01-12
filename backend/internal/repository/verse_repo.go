package repository

import (
    
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type VerseRepository interface {
    Create(verse *models.Verse) error
    GetByID(id uint) (*models.Verse, error)
    GetByReference(reference string) (*models.Verse, error)
    Search(query string) ([]models.Verse, error)
    GetDailyVerse() (*models.Verse, error)
    List(limit, offset int) ([]models.Verse, error)
}

// init the struct that implements VerseRepository
type verseRepository struct {
    db *gorm.DB
}

// Constructor
func NewVerseRepository(db *gorm.DB) VerseRepository {
    return &verseRepository{db: db}
}

// Create verse
func (r *verseRepository) Create(verse *models.Verse) error {
    return r.db.Create(verse).Error
}

// Find by ID
func (r *verseRepository) GetByID(id uint) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.First(&verse, id).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}

// Find by reference
func (r *verseRepository) GetByReference(reference string) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Where("reference = ?", reference).First(&verse).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}

// Get random verse
func (r *verseRepository) GetDailyVerse() (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Order("RANDOM()").First(&verse).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}
// Search verses
func (r *verseRepository) Search(query string) ([]models.Verse, error) {
    var verses []models.Verse
    err := r.db.Where("text ILIKE ?", "%"+query+"%").Find(&verses).Error
    return verses, err
}

// list verses with pagination
func (r *verseRepository) List(limit, offset int) ([]models.Verse, error) {
    var verses []models.Verse
    err := r.db.Limit(limit).Offset(offset).Find(&verses).Error
    if err != nil {
        return nil, err
    }
    return verses, nil
}

// GetByDate fetches a verse by its daily date
func (r *verseRepository) GetByDate(date string) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Where("daily_date = ?", date).First(&verse).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}
