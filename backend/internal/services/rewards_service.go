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

// CheckMilestones is called in a goroutine from the verse handler after a new daily engagement.
// It is safe to call concurrently — ON CONFLICT DO NOTHING prevents double-granting under race conditions.
//
// If multiple milestones are crossed at once (e.g. a backfill scenario jumping from day 2 to day 14),
// ALL crossed milestones are granted, but only the most-recently-achieved undismissed one surfaces in
// the next GET /api/streak response.
//
// The goroutine that calls this must defer a recover() to prevent a panic from crashing the server.
func (s *RewardsService) CheckMilestones(userID uint, currentStreak int) {
	defer func() {
		if r := recover(); r != nil {
			// Log and swallow — milestone checking must never crash the request path
			_ = r
		}
	}()

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
		result := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&models.UserMilestone{
			UserID:       userID,
			MilestoneKey: def.Key,
			AchievedAt:   now,
			BadgeVariant: "standard", // Phase 8: "premium" for premium users
		})

		if result.RowsAffected > 0 {
			// Only credit Blessings if this process won the insert race.
			s.blessingsService.Credit(userID, def.BlessingsAwarded, "milestone_"+def.Key, 1.0)
		}
	}
}
