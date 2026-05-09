package services

import (
	"dailybible/internal/models"
	"dailybible/internal/utils"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// StreakService handles streak tracking and grace day logic
type StreakService struct {
	db                  *gorm.DB
	subscriptionChecker SubscriptionChecker
}

// NewStreakService creates a new StreakService instance
func NewStreakService(db *gorm.DB, subscriptionChecker SubscriptionChecker) *StreakService {
	return &StreakService{
		db:                  db,
		subscriptionChecker: subscriptionChecker,
	}
}

// RecordDailyEngagement is idempotent. Calling it multiple times in the same day
// is safe and cheap — the second call is a no-op after the idempotency check.
//
// Returns wasNewEngagement — the verse handler uses this to decide whether to credit
// Blessings. A page refresh must not earn a second +5.
func (s *StreakService) RecordDailyEngagement(userID uint, ianaTimezone string) (wasNewEngagement bool, err error) {
	todayStr := utils.TodayLocal(ianaTimezone)

	err = s.db.Transaction(func(tx *gorm.DB) error {
		var streak models.UserStreak

		// SELECT FOR UPDATE serializes concurrent calls for the same user.
		// Scenario: user opens app on phone and tablet at the same second.
		// The second goroutine blocks on the lock, then sees LastActiveDate == today
		// and exits as a no-op. No double-increment.
		// This is a row-level lock — no global table contention.
		if err := tx.Set("gorm:query_option", "FOR UPDATE").
			FirstOrCreate(&streak, models.UserStreak{UserID: userID}).Error; err != nil {
			return err
		}

		// Initialize GraceDaysResetAt for brand-new users.
		if streak.GraceDaysResetAt == nil {
			t := time.Now().Add(30 * 24 * time.Hour)
			streak.GraceDaysResetAt = &t
		}

		// Idempotency check — the most common code path for existing daily users.
		if streak.LastActiveDate != nil && *streak.LastActiveDate == todayStr {
			wasNewEngagement = false
			return nil
		}

		wasNewEngagement = true
		yesterdayStr := utils.YesterdayLocal(ianaTimezone)

		if streak.LastActiveDate == nil {
			streak.CurrentStreak = 1 // first ever engagement
		} else if *streak.LastActiveDate == yesterdayStr {
			streak.CurrentStreak++ // consecutive day
		} else {
			streak.CurrentStreak = 1 // gap — streak resets
		}

		if streak.CurrentStreak > streak.LongestStreak {
			streak.LongestStreak = streak.CurrentStreak
		}

		streak.LastActiveDate = &todayStr
		s.accrueGraceDays(&streak, userID) // inside the transaction

		return tx.Save(&streak).Error
	})
	if err != nil {
		return false, err
	}

	if wasNewEngagement {
		// Write to activity log. The partial unique index on (user_id, date_local)
		// WHERE action_type = 'daily_engagement' makes this a no-op if a race
		// condition caused two goroutines to both see wasNewEngagement = true.
		// ON CONFLICT DO NOTHING is safe here.
		s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserActivityLog{
			UserID:     userID,
			ActionType: "daily_engagement",
			DateLocal:  todayStr,
		})
	}

	return wasNewEngagement, nil
}

// UseGraceDay fills in exactly one missed day — yesterday.
// Returns typed errors so the caller can surface the right message to the user.
func (s *StreakService) UseGraceDay(userID uint, ianaTimezone string) error {
	todayStr := utils.TodayLocal(ianaTimezone)
	yesterdayStr := utils.YesterdayLocal(ianaTimezone)
	twoDaysAgo := utils.DaysAgoLocal(ianaTimezone, 2)

	return s.db.Transaction(func(tx *gorm.DB) error {
		var streak models.UserStreak
		if err := tx.Set("gorm:query_option", "FOR UPDATE").
			First(&streak, "user_id = ?", userID).Error; err != nil {
			return err
		}

		if streak.GraceDaysRemaining <= 0 {
			return ErrNoGraceDaysRemaining
		}
		if streak.LastActiveDate == nil {
			return ErrNoStreakToRecover
		}
		if *streak.LastActiveDate == todayStr {
			return ErrStreakAlreadyActiveToday
		}
		// LastActiveDate must be exactly 2 days ago.
		// If it's further back, the streak broke before yesterday — unrecoverable.
		// If it's yesterday, they already engaged yesterday — nothing to fill.
		if *streak.LastActiveDate != twoDaysAgo {
			return ErrStreakNotRecoverable
		}

		streak.CurrentStreak++
		streak.GraceDaysRemaining--
		streak.LastActiveDate = &yesterdayStr

		if streak.CurrentStreak > streak.LongestStreak {
			streak.LongestStreak = streak.CurrentStreak
		}

		t := time.Now().Add(30 * 24 * time.Hour)
		streak.GraceDaysResetAt = &t

		// Drain queued grace days (from grace_day_pack purchases by free users).
		// Each time a grace day is used, one queued day refills the balance up to the free cap (5).
		if streak.GraceDaysQueued > 0 {
			streak.GraceDaysQueued--
			if streak.GraceDaysRemaining < 5 {
				streak.GraceDaysRemaining++
			}
		}

		if err := tx.Save(&streak).Error; err != nil {
			return err
		}

		s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserActivityLog{
			UserID:     userID,
			ActionType: "grace_day_used",
			DateLocal:  yesterdayStr,
		})

		return nil
	})
}

// freeGraceDayCap is the maximum grace days a free user can hold at once.
// Purchased days that exceed this cap are queued and drain in one-for-one as days are used.
const freeGraceDayCap = 5

// AddGraceDays adds `count` grace days to the user's balance.
// For free users: caps immediately at freeGraceDayCap, stores overflow in GraceDaysQueued.
// For premium users: no cap — all days are added directly to GraceDaysRemaining.
// Called by SubscriptionService.HandleOneTimePurchase for the grace_day_pack product.
func (s *StreakService) AddGraceDays(userID uint, count int) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var streak models.UserStreak
		if err := tx.Set("gorm:query_option", "FOR UPDATE").
			FirstOrCreate(&streak, models.UserStreak{UserID: userID}).Error; err != nil {
			return err
		}

		if s.subscriptionChecker.IsPremium(userID) {
			// Premium: no cap — add all days directly.
			streak.GraceDaysRemaining += count
		} else {
			// Free: cap at freeGraceDayCap, queue the overflow.
			available := freeGraceDayCap - streak.GraceDaysRemaining
			if available < 0 {
				available = 0
			}
			toAdd := count
			if toAdd > available {
				streak.GraceDaysQueued += toAdd - available
				toAdd = available
			}
			streak.GraceDaysRemaining += toAdd
		}

		return tx.Save(&streak).Error
	})
}

// AddGraceDaysTx is the transaction-aware variant of AddGraceDays.
// Accepts the caller's *gorm.DB transaction so the grace day write is atomic with
// the surrounding webhook transaction (e.g., the UserUnlock record created for
// grace_day_pack). IsPremium is still resolved independently — it is a read-only
// check that does not need to participate in the transaction.
func (s *StreakService) AddGraceDaysTx(tx *gorm.DB, userID uint, count int) error {
	var streak models.UserStreak
	if err := tx.Set("gorm:query_option", "FOR UPDATE").
		FirstOrCreate(&streak, models.UserStreak{UserID: userID}).Error; err != nil {
		return err
	}

	if s.subscriptionChecker.IsPremium(userID) {
		streak.GraceDaysRemaining += count
	} else {
		available := freeGraceDayCap - streak.GraceDaysRemaining
		if available < 0 {
			available = 0
		}
		toAdd := count
		if toAdd > available {
			streak.GraceDaysQueued += toAdd - available
			toAdd = available
		}
		streak.GraceDaysRemaining += toAdd
	}

	return tx.Save(&streak).Error
}

// FlushGraceDaysQueue moves all queued grace days directly into GraceDaysRemaining.
// Called when a free user upgrades to premium — the cap restriction is lifted so
// all previously queued days become immediately available.
// Idempotent: no-op if the queue is already empty.
func (s *StreakService) FlushGraceDaysQueue(userID uint) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		var streak models.UserStreak
		if err := tx.Set("gorm:query_option", "FOR UPDATE").
			First(&streak, "user_id = ?", userID).Error; err != nil {
			return nil // no streak record — nothing to flush
		}
		if streak.GraceDaysQueued == 0 {
			return nil // already empty
		}
		streak.GraceDaysRemaining += streak.GraceDaysQueued
		streak.GraceDaysQueued = 0
		return tx.Save(&streak).Error
	})
}

// accrueGraceDays is called inside RecordDailyEngagement's transaction.
func (s *StreakService) accrueGraceDays(streak *models.UserStreak, userID uint) {
	if streak.GraceDaysResetAt == nil || time.Now().Before(*streak.GraceDaysResetAt) {
		return
	}

	// SubscriptionChecker is a thin interface. Phase 1-7: always returns false.
	// Phase 8: real implementation backed by UserSubscription table.
	if s.subscriptionChecker.IsPremium(userID) {
		streak.GraceDaysRemaining += 3 // no cap for premium
	} else {
		if streak.GraceDaysRemaining < 3 {
			streak.GraceDaysRemaining++ // free: accrue up to 3 naturally
		}
		// If already at 3+, the accrual is skipped — purchased days above 3 still held.
	}

	t := time.Now().Add(30 * 24 * time.Hour)
	streak.GraceDaysResetAt = &t
}

// GetStreakSummary returns the current streak data for a user
func (s *StreakService) GetStreakSummary(userID uint, ianaTimezone string) (*models.UserStreak, bool, error) {
	var streak models.UserStreak
	if err := s.db.FirstOrCreate(&streak, models.UserStreak{UserID: userID}).Error; err != nil {
		return nil, false, err
	}

	// Calculate if streak is recoverable
	streakRecoverable := false
	if streak.LastActiveDate != nil && streak.GraceDaysRemaining > 0 {
		twoDaysAgo := utils.DaysAgoLocal(ianaTimezone, 2)
		if *streak.LastActiveDate == twoDaysAgo {
			streakRecoverable = true
		}
	}

	return &streak, streakRecoverable, nil
}
