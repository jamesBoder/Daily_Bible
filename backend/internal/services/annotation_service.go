package services

import (
	"dailybible/internal/models"
	"errors"

	"gorm.io/gorm"
)

var (
	ErrAnnotationNotFound  = errors.New("annotation not found")
	ErrAnnotationForbidden = errors.New("annotation belongs to another user")
)

// AnnotationService handles verse annotation CRUD for premium users.
type AnnotationService struct {
	db *gorm.DB
}

// NewAnnotationService creates a new AnnotationService.
func NewAnnotationService(db *gorm.DB) *AnnotationService {
	return &AnnotationService{db: db}
}

// GetForVerse returns all annotations by the user for a given verse reference.
func (s *AnnotationService) GetForVerse(userID uint, reference string) ([]models.VerseAnnotation, error) {
	var annotations []models.VerseAnnotation
	if err := s.db.Where("user_id = ? AND verse_reference = ?", userID, reference).
		Order("created_at ASC").
		Find(&annotations).Error; err != nil {
		return nil, err
	}
	return annotations, nil
}

// GetAll returns all annotations for the user, ordered newest first.
func (s *AnnotationService) GetAll(userID uint) ([]models.VerseAnnotation, error) {
	var annotations []models.VerseAnnotation
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&annotations).Error; err != nil {
		return nil, err
	}
	return annotations, nil
}

// Create creates a new annotation for the user.
func (s *AnnotationService) Create(userID uint, reference, phrase, note string) (*models.VerseAnnotation, error) {
	annotation := models.VerseAnnotation{
		UserID:         userID,
		VerseReference: reference,
		PhraseText:     phrase,
		AnnotationText: note,
	}
	if err := s.db.Create(&annotation).Error; err != nil {
		return nil, err
	}
	return &annotation, nil
}

// Update updates the annotation text. Enforces ownership.
func (s *AnnotationService) Update(userID uint, annotationID uint, phrase, note string) (*models.VerseAnnotation, error) {
	var annotation models.VerseAnnotation
	if err := s.db.Where("id = ?", annotationID).First(&annotation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrAnnotationNotFound
		}
		return nil, err
	}
	if annotation.UserID != userID {
		return nil, ErrAnnotationForbidden
	}
	if phrase != "" {
		annotation.PhraseText = phrase
	}
	annotation.AnnotationText = note
	if err := s.db.Save(&annotation).Error; err != nil {
		return nil, err
	}
	return &annotation, nil
}

// Delete deletes the annotation. Enforces ownership.
func (s *AnnotationService) Delete(userID uint, annotationID uint) error {
	var annotation models.VerseAnnotation
	if err := s.db.Where("id = ?", annotationID).First(&annotation).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrAnnotationNotFound
		}
		return err
	}
	if annotation.UserID != userID {
		return ErrAnnotationForbidden
	}
	return s.db.Delete(&annotation).Error
}
