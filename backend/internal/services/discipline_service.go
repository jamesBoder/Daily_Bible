package services

import (
	"dailybible/internal/config"
	"dailybible/internal/models"
	"log"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// DisciplineService handles discipline completions and daily status queries.
type DisciplineService struct {
	db       *gorm.DB
	blessings *BlessingsService
}

// NewDisciplineService creates a new DisciplineService.
func NewDisciplineService(db *gorm.DB, blessings *BlessingsService) *DisciplineService {
	return &DisciplineService{db: db, blessings: blessings}
}

// DisciplineStatus is the per-discipline status returned to the frontend.
type DisciplineStatus struct {
	Key             string `json:"key"`
	Blessings       int    `json:"blessings"`
	Completed       bool   `json:"completed"`
	RequiresPremium bool   `json:"requires_premium"`
}

// GetTodayResponse is returned by GET /api/disciplines/today.
type GetTodayResponse struct {
	Disciplines    []DisciplineStatus `json:"disciplines"`
	DateUTC10      string             `json:"date"`
	EnrolledInPlan bool               `json:"enrolled_in_plan"`
}

// dateUTC10 returns today's date string in UTC-10.
func dateUTC10() string {
	return time.Now().UTC().Add(-10 * time.Hour).Format("2006-01-02")
}

// GetToday returns today's disciplines with completion state for the given user.
func (s *DisciplineService) GetToday(userID uint) (*GetTodayResponse, error) {
	today := dateUTC10()
	defs := config.GetDayDisciplines(today)

	// Fetch completions for today.
	var completions []models.UserDisciplineCompletion
	if err := s.db.Where("user_id = ? AND date_utc10 = ?", userID, today).Find(&completions).Error; err != nil {
		return nil, err
	}
	completedKeys := make(map[string]bool, len(completions))
	for _, c := range completions {
		completedKeys[c.DisciplineKey] = true
	}

	statuses := make([]DisciplineStatus, len(defs))
	for i, d := range defs {
		statuses[i] = DisciplineStatus{
			Key:             d.Key,
			Blessings:       d.Blessings,
			Completed:       completedKeys[d.Key],
			RequiresPremium: d.RequiresPremium,
		}
	}

	// Check plan enrollment.
	var planCount int64
	s.db.Model(&models.UserPlanProgress{}).
		Where("user_id = ? AND is_active = ?", userID, true).
		Count(&planCount)

	return &GetTodayResponse{
		Disciplines:    statuses,
		DateUTC10:      today,
		EnrolledInPlan: planCount > 0,
	}, nil
}

// TryComplete attempts to mark a discipline complete for the user today.
// Returns the blessings credited (0 if already complete, not in today's rotation, or premium-gated).
// Errors from the blessings service are logged but not returned — the caller always gets a clean response.
func (s *DisciplineService) TryComplete(userID uint, key string, isPremium bool) (int, error) {
	def, ok := config.GetDisciplineDef(key)
	if !ok || !def.Active {
		return 0, nil
	}
	if def.RequiresPremium && !isPremium {
		return 0, nil
	}

	today := dateUTC10()

	// Only credit if this key is in today's rotation.
	defs := config.GetDayDisciplines(today)
	inRotation := false
	for _, d := range defs {
		if d.Key == key {
			inRotation = true
			break
		}
	}
	if !inRotation {
		return 0, nil
	}

	completion := models.UserDisciplineCompletion{
		UserID:        userID,
		DateUTC10:     today,
		DisciplineKey: key,
		CompletedAt:   time.Now(),
	}

	result := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&completion)
	if result.Error != nil {
		return 0, result.Error
	}
	if result.RowsAffected == 0 {
		// Already completed today.
		return 0, nil
	}

	// Credit flat blessings (multiplier 1.0 — no premium bonus, so the card's
	// displayed amount stays exact). Double-credit is already prevented by the
	// OnConflict insert above: if the completion row existed, we returned early.
	reason := "discipline_" + key
	credited, err := s.blessings.Credit(userID, def.Blessings, reason, 1.0)
	if err != nil {
		log.Printf("DisciplineService.TryComplete: blessings credit failed for user %d key %s: %v", userID, key, err)
		return 0, nil
	}

	// Store the credited amount for record-keeping (best-effort).
	s.db.Model(&models.UserDisciplineCompletion{}).
		Where("user_id = ? AND date_utc10 = ? AND discipline_key = ?", userID, today, key).
		Update("blessings_credited", credited)

	return credited, nil
}
