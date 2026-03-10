package services

import (
    "dailybible/internal/models"
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
    go s.db.Create(&models.BlessingsTransaction{UserID: userID, Amount: actual, Reason: reason})

    return actual, nil
}

// CreditWithDailyCap credits blessings only if the user has earned this reason fewer than
// maxPerDay times today (UTC day boundary). Re-login does not bypass this — the check
// reads the DB, not the session.
func (s *BlessingsService) CreditWithDailyCap(userID uint, baseAmount int, reason string, multiplier float64, maxPerDay int) (int, error) {
    startOfDay := time.Now().UTC().Truncate(24 * time.Hour)

    var count int64
    s.db.Model(&models.BlessingsTransaction{}).
        Where("user_id = ? AND reason = ? AND created_at >= ? AND amount > 0", userID, reason, startOfDay).
        Count(&count)

    if int(count) >= maxPerDay {
        return 0, nil // daily cap reached
    }

    return s.Credit(userID, baseAmount, reason, multiplier)
}

// Debit is used for Rewards Shop purchases (Phase 6+). Not called in Phase 1.
func (s *BlessingsService) Debit(userID uint, amount int, reason string) error {
    return s.db.Transaction(func(tx *gorm.DB) error {
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
        go s.db.Create(&models.BlessingsTransaction{UserID: userID, Amount: -amount, Reason: reason})
        return nil
    })
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