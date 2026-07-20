package services

import (
	"dailybible/internal/models"
	"log"
	"math"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// BlessingsService handles blessings currency operations
type BlessingsService struct {
	db *gorm.DB
}

// NewBlessingsService creates a new BlessingsService instance
func NewBlessingsService(db *gorm.DB) *BlessingsService {
	return &BlessingsService{
		db: db,
	}
}

// Credit awards Blessings. The multiplier is 1.0 for all users in Phase 1.
// Phase 8 passes 1.5 for premium users. The architecture is in place now.
//
// Returns the actual amount credited (after multiplier) so the caller can show
// the correct number in the BlessingsToast. If the DB write fails, returns (0, err)
// and the caller must suppress the toast — do not show "+5" if the credit didn't land.
func (s *BlessingsService) Credit(userID uint, baseAmount int, reason string, multiplier float64) (int, error) {
	actual := int(math.Round(float64(baseAmount) * multiplier))
	if actual <= 0 {
		return 0, nil
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Upsert handles first-time users without a separate initialization step.
		return tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "user_id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"balance":         gorm.Expr("user_blessings.balance + ?", actual),
				"lifetime_earned": gorm.Expr("user_blessings.lifetime_earned + ?", actual),
				"updated_at":      time.Now(),
			}),
		}).Create(&models.UserBlessings{
			UserID:         userID,
			Balance:        actual,
			LifetimeEarned: actual,
		}).Error
	})
	if err != nil {
		return 0, err
	}

	// Write transaction log outside the balance upsert — non-critical, best-effort.
	// A failed transaction log write does not roll back the balance credit.
	go func() {
		if err := s.db.Create(&models.BlessingsTransaction{UserID: userID, Amount: actual, Reason: reason}).Error; err != nil {
			log.Printf("BlessingsService.Credit: transaction log write failed for user %d reason %q: %v", userID, reason, err)
		}
	}()

	return actual, nil
}

// CreditWithDailyCap credits blessings only if the user has earned this reason fewer than
// maxPerDay times today (UTC day boundary). Re-login does not bypass this — the check
// reads the DB, not the session.
//
// The count check, balance upsert, and transaction log write are all performed inside a
// single database transaction. This closes the race window where two concurrent requests
// (e.g. two tabs opening simultaneously) could both read a count of 0, both pass the cap
// check, and both credit blessings before either log entry was committed.
func (s *BlessingsService) CreditWithDailyCap(userID uint, baseAmount int, reason string, multiplier float64, maxPerDay int) (int, error) {
	actual := int(math.Round(float64(baseAmount) * multiplier))
	if actual <= 0 {
		return 0, nil
	}

	startOfDay := time.Now().UTC().Truncate(24 * time.Hour)

	var credited int
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var count int64
		if err := tx.Model(&models.BlessingsTransaction{}).
			Where("user_id = ? AND reason = ? AND created_at >= ? AND amount > 0", userID, reason, startOfDay).
			Count(&count).Error; err != nil {
			return err
		}
		if int(count) >= maxPerDay {
			return nil // daily cap reached
		}

		// Upsert balance — same logic as Credit.
		if err := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "user_id"}},
			DoUpdates: clause.Assignments(map[string]interface{}{
				"balance":         gorm.Expr("user_blessings.balance + ?", actual),
				"lifetime_earned": gorm.Expr("user_blessings.lifetime_earned + ?", actual),
				"updated_at":      time.Now(),
			}),
		}).Create(&models.UserBlessings{
			UserID:         userID,
			Balance:        actual,
			LifetimeEarned: actual,
		}).Error; err != nil {
			return err
		}

		// Write the transaction log inside the same transaction so the count check
		// and log entry are atomic. If this write fails the balance upsert rolls back.
		if err := tx.Create(&models.BlessingsTransaction{
			UserID: userID,
			Amount: actual,
			Reason: reason,
		}).Error; err != nil {
			return err
		}

		credited = actual
		return nil
	})
	return credited, err
}

// Debit is used for Rewards Shop purchases (Phase 6+). Not called in Phase 1.
func (s *BlessingsService) Debit(userID uint, amount int, reason string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		return s.debitCore(tx, userID, amount, reason)
	})
}

// DebitTx performs a Blessings debit within a caller-supplied transaction.
// Use this when the debit must be atomic with other DB operations in the same tx
// (e.g. recording a theme unlock alongside the balance change).
func (s *BlessingsService) DebitTx(tx *gorm.DB, userID uint, amount int, reason string) error {
	return s.debitCore(tx, userID, amount, reason)
}

func (s *BlessingsService) debitCore(tx *gorm.DB, userID uint, amount int, reason string) error {
	var blessings models.UserBlessings
	if err := tx.Set("gorm:query_option", "FOR UPDATE").
		First(&blessings, "user_id = ?", userID).Error; err != nil {
		return err
	}
	if blessings.Balance < amount {
		return ErrInsufficientBlessings
	}
	blessings.Balance -= amount
	if err := tx.Save(&blessings).Error; err != nil {
		return err
	}
	// Transaction log written inside the tx so it rolls back cleanly on failure.
	return tx.Create(&models.BlessingsTransaction{UserID: userID, Amount: -amount, Reason: reason}).Error
}

// GetBalance returns the current blessings balance for a user
func (s *BlessingsService) GetBalance(userID uint) (int, error) {
	var blessings models.UserBlessings
	if err := s.db.FirstOrCreate(&blessings, models.UserBlessings{UserID: userID}).Error; err != nil {
		return 0, err
	}
	return blessings.Balance, nil
}

// GetTransactions returns the transaction history for a user with optional offset for pagination
func (s *BlessingsService) GetTransactions(userID uint, limit, offset int) ([]models.BlessingsTransaction, error) {
	var transactions []models.BlessingsTransaction
	err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	return transactions, err
}
