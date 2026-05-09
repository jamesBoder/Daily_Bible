package services

import (
	"errors"

	"dailybible/internal/models"

	"gorm.io/gorm"
)

var (
	ErrAlreadyUnlocked = errors.New("theme already unlocked")
	ErrInvalidTheme    = errors.New("invalid theme id")
	ErrThemeIsFree     = errors.New("theme does not require a purchase")
)

// ThemeCosts maps theme IDs to their Blessings cost.
// Free themes (parchment, midnight) are not in this map.
var ThemeCosts = map[string]int{
	"sanctuary":     500,
	"desert-sand":   500,
	"celestial":     750,
	"scarlet-grace": 750,
}

var freeThemes = map[string]bool{
	"parchment": true,
	"midnight":  true,
}

type UnlockService struct {
	db               *gorm.DB
	blessingsService *BlessingsService
}

func NewUnlockService(db *gorm.DB, bs *BlessingsService) *UnlockService {
	return &UnlockService{db: db, blessingsService: bs}
}

// GetUnlockedThemeIDs returns all theme IDs the user has purchased.
// Free themes are not stored — they are always available.
func (s *UnlockService) GetUnlockedThemeIDs(userID uint) ([]string, error) {
	var unlocks []models.UserUnlock
	if err := s.db.Where("user_id = ? AND unlock_type = ?", userID, "theme").Find(&unlocks).Error; err != nil {
		return nil, err
	}
	ids := make([]string, len(unlocks))
	for i, u := range unlocks {
		ids[i] = u.UnlockKey
	}
	return ids, nil
}

// PurchaseTheme debits Blessings and records the unlock in a single transaction.
func (s *UnlockService) PurchaseTheme(userID uint, themeID string) error {
	cost, ok := ThemeCosts[themeID]
	if !ok {
		if freeThemes[themeID] {
			return ErrThemeIsFree
		}
		return ErrInvalidTheme
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Check for duplicate
		var existing models.UserUnlock
		err := tx.Where("user_id = ? AND unlock_type = ? AND unlock_key = ?", userID, "theme", themeID).
			First(&existing).Error
		if err == nil {
			return ErrAlreadyUnlocked
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		// Debit Blessings within the same transaction so the unlock and balance
		// change are atomic — if the UserUnlock insert fails, the debit rolls back.
		if err := s.blessingsService.DebitTx(tx, userID, cost, "theme_unlock:"+themeID); err != nil {
			return err // propagates ErrInsufficientBlessings if needed
		}

		// Record unlock
		return tx.Create(&models.UserUnlock{
			UserID:     userID,
			UnlockType: "theme",
			UnlockKey:  themeID,
			Source:     "blessings",
		}).Error
	})
}
