package services

import (
	"dailybible/internal/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

const journalFreeViewCap = 30

// ErrJournalEntryNotFound is returned when an entry does not exist or does not
// belong to the requesting user.
var ErrJournalEntryNotFound = errors.New("journal entry not found")

// JournalService handles all journal CRUD operations and the Blessings hook.
type JournalService struct {
	db               *gorm.DB
	blessingsService *BlessingsService
}

// NewJournalService creates a new JournalService.
func NewJournalService(db *gorm.DB, blessingsService *BlessingsService) *JournalService {
	return &JournalService{
		db:               db,
		blessingsService: blessingsService,
	}
}

// GetEntries returns the user's journal entries ordered by newest first.
//
// For free users, at most journalFreeViewCap entries are returned. The second
// return value is the total number of entries stored (used by the frontend to
// show the "N older entries are safely stored" upgrade prompt).
func (s *JournalService) GetEntries(userID uint, isPremium bool) ([]models.JournalEntry, int64, error) {
	var total int64
	if err := s.db.Model(&models.JournalEntry{}).
		Where("user_id = ?", userID).
		Count(&total).Error; err != nil {
		return nil, 0, err
	}

	query := s.db.Where("user_id = ?", userID).Order("created_at DESC")
	if !isPremium {
		query = query.Limit(journalFreeViewCap)
	}

	var entries []models.JournalEntry
	if err := query.Find(&entries).Error; err != nil {
		return nil, 0, err
	}

	return entries, total, nil
}

// GetEntry returns a single journal entry by ID, enforcing ownership.
func (s *JournalService) GetEntry(userID uint, entryID uint) (*models.JournalEntry, error) {
	var entry models.JournalEntry
	if err := s.db.Where("id = ? AND user_id = ?", entryID, userID).
		First(&entry).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrJournalEntryNotFound
		}
		return nil, err
	}
	return &entry, nil
}

// CreateEntry creates a new journal entry.
//
// linkedVerse is stored for all users. contentRich (Tiptap JSON) is only stored
// for premium users and silently discarded otherwise.
//
// On success, 8 Blessings are credited asynchronously. A failed Blessings write
// does not roll back the entry creation.
func (s *JournalService) CreateEntry(
	userID uint,
	isPremium bool,
	contentPlain string,
	contentRich string,
	linkedVerse string,
	promptID *uint,
) (*models.JournalEntry, error) {
	entry := models.JournalEntry{
		UserID:       userID,
		ContentPlain: contentPlain,
		LinkedVerse:  linkedVerse,
		PromptID:     promptID,
	}
	if isPremium {
		entry.ContentRich = contentRich
	}

	if err := s.db.Create(&entry).Error; err != nil {
		return nil, err
	}

	// Credit 8 Blessings asynchronously, capped at 3 journal entries per day
	// (24 Blessings/day max) to prevent farming. A panic here must not kill the request.
	bs := s.blessingsService
	go func() {
		defer func() { recover() }() //nolint:errcheck
		bs.CreditWithDailyCap(userID, 8, "journal_entry_written", 1.0, 3)
	}()

	return &entry, nil
}

// UpdateEntry saves changes to an existing entry, enforcing ownership.
//
// linkedVerse is updated for all users. contentRich updates are silently
// discarded for free users.
func (s *JournalService) UpdateEntry(
	entryID uint,
	userID uint,
	isPremium bool,
	contentPlain string,
	contentRich string,
	linkedVerse string,
) (*models.JournalEntry, error) {
	var entry models.JournalEntry
	if err := s.db.Where("id = ? AND user_id = ?", entryID, userID).
		First(&entry).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrJournalEntryNotFound
		}
		return nil, err
	}

	entry.ContentPlain = contentPlain
	entry.LinkedVerse = linkedVerse
	if isPremium {
		entry.ContentRich = contentRich
	}
	entry.UpdatedAt = time.Now()

	if err := s.db.Save(&entry).Error; err != nil {
		return nil, err
	}

	return &entry, nil
}

// DeleteEntry soft-deletes an entry, enforcing ownership. Returns
// ErrJournalEntryNotFound if the entry does not exist or belongs to another user.
func (s *JournalService) DeleteEntry(entryID uint, userID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", entryID, userID).
		Delete(&models.JournalEntry{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrJournalEntryNotFound
	}
	return nil
}

// GetActivePrompt returns the currently active weekly prompt, or nil if there is
// no active prompt or the user is not premium.
func (s *JournalService) GetActivePrompt(isPremium bool) (*models.JournalPrompt, error) {
	if !isPremium {
		return nil, nil
	}

	now := time.Now()
	var prompt models.JournalPrompt
	err := s.db.
		Where("active_from <= ? AND active_until >= ?", now, now).
		First(&prompt).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return &prompt, nil
}
