package repository

import (
	"dailybible/internal/models"
	"gorm.io/gorm"
)

type VerseRepository interface {
	Create(verse *models.Verse) error
	Update(verse *models.Verse) error
	// UpdateDailyDate sets only the daily_date column for the given verse ID.
	// Use this instead of Update when you only want to claim a date — it avoids
	// overwriting other fields and respects the unique index on daily_date.
	UpdateDailyDate(id uint, date string) error
	GetByID(id uint) (*models.Verse, error)
	GetByReference(reference string) (*models.Verse, error)
	Search(query string) ([]models.Verse, error)
	GetDailyVerse() (*models.Verse, error)
	List(limit, offset int) ([]models.Verse, error)
	GetByDate(date string) (*models.Verse, error)
	GetRecentlyUsedReferences(daysBack int) ([]string, error)
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

// Update verse (full save — use UpdateDailyDate for targeted date assignment)
func (r *verseRepository) Update(verse *models.Verse) error {
	return r.db.Save(verse).Error
}

// UpdateDailyDate sets only the daily_date column for a verse.
// A targeted column update avoids race-condition overwrites of other fields
// and is safe against the uniqueIndex constraint on daily_date.
func (r *verseRepository) UpdateDailyDate(id uint, date string) error {
	return r.db.Model(&models.Verse{}).Where("id = ?", id).Update("daily_date", date).Error
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

// GetRecentlyUsedReferences returns verse references used in the last N days
func (r *verseRepository) GetRecentlyUsedReferences(daysBack int) ([]string, error) {
	var verses []models.Verse

	// Calculate the cutoff date using PostgreSQL syntax
	// CURRENT_DATE - INTERVAL 'N days' works in PostgreSQL
	err := r.db.
		Select("reference").
		Where("daily_date IS NOT NULL").
		Where("daily_date >= CURRENT_DATE - INTERVAL '1 day' * ?", daysBack).
		Find(&verses).Error

	if err != nil {
		return nil, err
	}

	// Extract references into a slice
	references := make([]string, len(verses))
	for i, verse := range verses {
		references[i] = verse.Reference
	}

	return references, nil
}
