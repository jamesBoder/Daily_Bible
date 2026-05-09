package services

import (
	"dailybible/internal/config"
	"dailybible/internal/models"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// RewardsService handles milestone granting and blessings credit for achievements.
type RewardsService struct {
	db               *gorm.DB
	blessingsService *BlessingsService
}

// NewRewardsService creates a new RewardsService instance.
func NewRewardsService(db *gorm.DB, blessingsService *BlessingsService) *RewardsService {
	return &RewardsService{
		db:               db,
		blessingsService: blessingsService,
	}
}

// UpgradeBadgesToPremium sets badge_variant = "premium" for all earned milestones.
// Called once on subscription activation (via SyncFromWebhook goroutine). Idempotent.
// Users keep their gold badges after canceling — the badges represent past achievement.
func (s *RewardsService) UpgradeBadgesToPremium(userID uint) {
	s.db.Model(&models.UserMilestone{}).
		Where("user_id = ? AND badge_variant != 'premium'", userID).
		Update("badge_variant", "premium")
}

// CheckMilestones is called in a goroutine from the verse handler after a new daily engagement.
// It is safe to call concurrently — ON CONFLICT DO NOTHING prevents double-granting under race conditions.
//
// If multiple milestones are crossed at once (e.g. a backfill scenario jumping from day 2 to day 14),
// ALL crossed milestones are granted, but only the most-recently-achieved undismissed one surfaces in
// the next GET /api/streak response.
//
// Returns the list of newly granted milestone keys (empty if none were granted this call).
// The goroutine that calls this must defer a recover() to prevent a panic from crashing the server.
func (s *RewardsService) CheckMilestones(userID uint, currentStreak int) []string {
	defer func() {
		if r := recover(); r != nil {
			// Log and swallow — milestone checking must never crash the request path
			_ = r
		}
	}()
	var granted []string

	// Load all milestones already achieved by this user.
	var existing []models.UserMilestone
	s.db.Where("user_id = ?", userID).Find(&existing)

	achieved := make(map[string]bool, len(existing))
	for _, m := range existing {
		achieved[m.MilestoneKey] = true
	}

	for i := range config.MilestoneDefinitions {
		def := &config.MilestoneDefinitions[i]

		// Skip if streak hasn't reached this milestone or already granted.
		if currentStreak < def.DaysRequired || achieved[def.Key] {
			continue
		}

		now := time.Now()
		// ON CONFLICT DO NOTHING handles the race where two goroutines both call
		// CheckMilestones for the same user at the same instant.
		// Only the insert that succeeds (RowsAffected == 1) earns the Blessings credit.
		badgeVariant := "standard"
		// Phase 8: premium users get gold badges immediately when earned.
		// RewardsService does not have subscriptionChecker injected (would cause
		// initialization order issues). Instead we check the DB directly here.
		// This is a lightweight read — one row by primary key.
		var sub models.UserSubscription
		if s.db.Where("user_id = ? AND status IN ('active','trialing')", userID).First(&sub).Error == nil {
			badgeVariant = "premium"
		} else if s.db.Where("user_id = ? AND status IN ('canceled','past_due') AND current_period_end > NOW()", userID).First(&sub).Error == nil {
			badgeVariant = "premium"
		}

		result := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserMilestone{
			UserID:       userID,
			MilestoneKey: def.Key,
			AchievedAt:   now,
			BadgeVariant: badgeVariant,
		})

		if result.RowsAffected > 0 {
			// Only credit Blessings if this process won the insert race.
			_ = s.blessingsService.Credit(userID, def.BlessingsAwarded, "milestone_"+def.Key, 1.0)
			granted = append(granted, def.Key)
		}
	}
	return granted
}
