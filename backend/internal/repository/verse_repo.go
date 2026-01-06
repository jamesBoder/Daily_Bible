package repository

import (
    "gorm.io/gorm"
    "dailybible/internal/models"
)

type VerseRepository struct {
    db *gorm.DB
}

func NewVerseRepository(db *gorm.DB) *VerseRepository {
    return &VerseRepository{db: db}
}

// Create verse
func (r *VerseRepository) Create(verse *models.Verse) error {
    return r.db.Create(verse).Error
}

// Find by ID
func (r *VerseRepository) FindByID(id uint) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.First(&verse, id).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}

// Find by reference
func (r *VerseRepository) FindByReference(reference string) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Where("reference = ?", reference).First(&verse).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}

// Get random verse
func (r *VerseRepository) GetRandom() (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Order("RANDOM()").First(&verse).Error
    if err != nil {
        return nil, err
    }
    return &verse, nil
}

// Search verses
func (r *VerseRepository) Search(query string) ([]models.Verse, error) {
    var verses []models.Verse
    err := r.db.Where("text ILIKE ?", "%"+query+"%").Find(&verses).Error
    return verses, err
}
