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
	db        *gorm.DB
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

	// Store the credited amount for record-keeping (best-effort — GetStats does
	// not depend on this column being correct, it derives lifetime blessings
	// from lifetime_completions * def.Blessings instead).
	if err := s.db.Model(&models.UserDisciplineCompletion{}).
		Where("user_id = ? AND date_utc10 = ? AND discipline_key = ?", userID, today, key).
		Update("blessings_credited", credited).Error; err != nil {
		log.Printf("DisciplineService.TryComplete: blessings_credited backfill failed for user %d key %s: %v", userID, key, err)
	}

	return credited, nil
}

// statsLookbackDays bounds the history walk in GetStats — ~28 rotation cycles,
// ample for any realistic streak, keeps the query cheap as rows accumulate
// over years. The walk also never goes earlier than config.DisciplineEpoch(),
// whichever boundary is later.
const statsLookbackDays = 400

// DisciplineStat is the per-discipline streak/completion summary in GetStatsResponse.
// "Lifetime" fields are named for the user-facing meaning ("all your history with
// this discipline") but are computed over the same bounded lookback window as
// TimesOffered, not truly unbounded — the two must stay window-matched, or an
// evergreen discipline offered every day (read_verse, complete_reading_plan) would
// eventually show LifetimeCompletions > TimesOffered (a >100% completion rate) once
// the app is older than statsLookbackDays.
type DisciplineStat struct {
	Key                 string  `json:"key"`
	Blessings           int     `json:"blessings"`
	RequiresPremium     bool    `json:"requires_premium"`
	CurrentStreak       int     `json:"current_streak"`
	TimesOffered        int     `json:"times_offered"` // within the lookback window
	LifetimeCompletions int     `json:"lifetime_completions"`
	LifetimeBlessings   int     `json:"lifetime_blessings_earned"`
	LastCompletedDate   *string `json:"last_completed_date,omitempty"`
}

// HistoryDay is one day's offered/completed disciplines, used for both the
// rolling Recent window and the Upcoming preview (Completed always empty for
// future dates, since nothing can be completed yet).
type HistoryDay struct {
	DateUTC10 string   `json:"date"`
	Offered   []string `json:"offered"`
	Completed []string `json:"completed"`
}

// CurrentCycleProgress is completion progress for the in-progress, epoch-aligned
// 14-day cycle containing today — NOT the same date range as the rolling Recent
// window (see GetStatsResponse doc).
type CurrentCycleProgress struct {
	CompletedCount int `json:"completed_count"`
	OfferedCount   int `json:"offered_count"`
}

// GetStatsResponse is returned by GET /api/disciplines/stats.
//
// CurrentCycle is deliberately its own field, not derived from Recent on the
// frontend: Recent is a rolling trailing-14-days window, while PerfectCycles
// (and therefore "is this cycle on track to be perfect") is scored against
// fixed epoch-aligned 14-day blocks. The two ranges only coincide when today
// happens to be the last day of a cycle.
type GetStatsResponse struct {
	Stats         []DisciplineStat     `json:"stats"`
	Recent        []HistoryDay         `json:"recent"`   // rolling last 14 calendar days, chronological order
	Upcoming      []HistoryDay         `json:"upcoming"` // next 3 days, Completed always []
	CurrentCycle  CurrentCycleProgress `json:"current_cycle"`
	PerfectCycles int                  `json:"perfect_cycles"`
	Date          string               `json:"date"`
}

// cycleAccumulator tracks offered/completed counts for one fully-elapsed
// epoch-aligned cycle encountered during the backward walk in GetStats.
type cycleAccumulator struct {
	offered, completed int
	// fullyInWindow is false if the walk's lookback boundary cut into the
	// middle of this cycle (i.e. we never saw its first day) — such a cycle
	// must not be counted toward PerfectCycles, since we can't know whether
	// its earlier, unwalked days were completed.
	fullyInWindow bool
}

// GetStats returns lifetime completion stats, per-discipline streaks (consecutive
// rotation appearances completed — today being offered-but-not-yet-completed does
// not break a streak, only a past offered-but-missed day does), rolling recent
// history, an upcoming preview, and epoch-aligned cycle progress for the user.
func (s *DisciplineService) GetStats(userID uint) (*GetStatsResponse, error) {
	today := dateUTC10()
	todayDate, err := time.Parse("2006-01-02", today)
	if err != nil {
		return nil, err
	}
	epoch := config.DisciplineEpoch()

	lookbackStart := epoch
	if cutoff := todayDate.AddDate(0, 0, -statsLookbackDays); cutoff.After(epoch) {
		lookbackStart = cutoff
	}

	// One bounded query: completions within the lookback window.
	var completions []models.UserDisciplineCompletion
	if err := s.db.Where("user_id = ? AND date_utc10 >= ?", userID, lookbackStart.Format("2006-01-02")).
		Find(&completions).Error; err != nil {
		return nil, err
	}
	completedByDate := make(map[string]map[string]bool, len(completions))
	for _, c := range completions {
		if completedByDate[c.DateUTC10] == nil {
			completedByDate[c.DateUTC10] = make(map[string]bool)
		}
		completedByDate[c.DateUTC10][c.DisciplineKey] = true
	}

	// One aggregate query: completions + last-completed date, bounded to the same
	// lookbackStart window as TimesOffered above. Must stay window-matched — an
	// unbounded lifetime count here would eventually exceed TimesOffered once the
	// app is older than statsLookbackDays, showing a >100% completion rate for
	// anchor disciplines (offered every day) on long-lived active accounts.
	type aggRow struct {
		DisciplineKey string
		Count         int
		LastDate      string
	}
	var aggRows []aggRow
	if err := s.db.Model(&models.UserDisciplineCompletion{}).
		Select("discipline_key, COUNT(*) as count, MAX(date_utc10) as last_date").
		Where("user_id = ? AND date_utc10 >= ?", userID, lookbackStart.Format("2006-01-02")).
		Group("discipline_key").
		Scan(&aggRows).Error; err != nil {
		return nil, err
	}
	lifetimeCompletions := make(map[string]int, len(aggRows))
	lastCompletedDate := make(map[string]string, len(aggRows))
	for _, r := range aggRows {
		lifetimeCompletions[r.DisciplineKey] = r.Count
		lastCompletedDate[r.DisciplineKey] = r.LastDate
	}

	cycleLen := len(config.DisciplineRotation)
	todayCycleNum := int(todayDate.Sub(epoch).Hours()/24) / cycleLen

	streak := make(map[string]int)
	streakActive := make(map[string]bool)
	timesOffered := make(map[string]int)
	for _, def := range config.DisciplineDefinitions {
		if def.Active {
			streakActive[def.Key] = true
		}
	}

	cycles := make(map[int]*cycleAccumulator)
	var currentCycle CurrentCycleProgress

	recentDays := cycleLen // one full rotation cycle
	recentStart := todayDate.AddDate(0, 0, -(recentDays - 1))
	recent := make([]HistoryDay, 0, recentDays)

	for d := todayDate; !d.Before(lookbackStart); d = d.AddDate(0, 0, -1) {
		dateStr := d.Format("2006-01-02")
		defs := config.GetDayDisciplines(dateStr)
		completedToday := completedByDate[dateStr]
		isToday := d.Equal(todayDate)

		dayIndex := int(d.Sub(epoch).Hours() / 24)
		cycleNum := dayIndex / cycleLen
		isCurrentCycle := cycleNum == todayCycleNum

		var acc *cycleAccumulator
		if !isCurrentCycle {
			acc = cycles[cycleNum]
			if acc == nil {
				cycleStart := epoch.AddDate(0, 0, cycleNum*cycleLen)
				acc = &cycleAccumulator{fullyInWindow: !cycleStart.Before(lookbackStart)}
				cycles[cycleNum] = acc
			}
		}

		offeredKeys := make([]string, 0, len(defs))
		completedKeys := make([]string, 0, len(defs))
		for _, def := range defs {
			key := def.Key
			isCompleted := completedToday[key]
			offeredKeys = append(offeredKeys, key)
			if isCompleted {
				completedKeys = append(completedKeys, key)
			}

			timesOffered[key]++

			if isToday {
				if isCompleted {
					streak[key]++
				}
				// today offered-but-incomplete: pending, does not break the streak
			} else if isCompleted {
				if streakActive[key] {
					streak[key]++
				}
			} else {
				streakActive[key] = false
			}

			if isCurrentCycle {
				currentCycle.OfferedCount++
				if isCompleted {
					currentCycle.CompletedCount++
				}
			} else {
				acc.offered++
				if isCompleted {
					acc.completed++
				}
			}
		}

		if !d.Before(recentStart) {
			recent = append(recent, HistoryDay{DateUTC10: dateStr, Offered: offeredKeys, Completed: completedKeys})
		}
	}
	// Walked newest-first; reverse to chronological order for the UI timeline.
	for i, j := 0, len(recent)-1; i < j; i, j = i+1, j-1 {
		recent[i], recent[j] = recent[j], recent[i]
	}

	perfectCycles := 0
	for cycleNum, acc := range cycles {
		if cycleNum >= todayCycleNum {
			continue // not fully elapsed
		}
		if acc.fullyInWindow && acc.offered > 0 && acc.completed == acc.offered {
			perfectCycles++
		}
	}

	upcoming := make([]HistoryDay, 0, 3)
	for i := 1; i <= 3; i++ {
		d := todayDate.AddDate(0, 0, i)
		dateStr := d.Format("2006-01-02")
		defs := config.GetDayDisciplines(dateStr)
		keys := make([]string, 0, len(defs))
		for _, def := range defs {
			keys = append(keys, def.Key)
		}
		upcoming = append(upcoming, HistoryDay{DateUTC10: dateStr, Offered: keys, Completed: []string{}})
	}

	stats := make([]DisciplineStat, 0, len(config.DisciplineDefinitions))
	for _, def := range config.DisciplineDefinitions {
		if !def.Active {
			continue
		}
		var lastDate *string
		if ld, ok := lastCompletedDate[def.Key]; ok && ld != "" {
			v := ld
			lastDate = &v
		}
		stats = append(stats, DisciplineStat{
			Key:                 def.Key,
			Blessings:           def.Blessings,
			RequiresPremium:     def.RequiresPremium,
			CurrentStreak:       streak[def.Key],
			TimesOffered:        timesOffered[def.Key],
			LifetimeCompletions: lifetimeCompletions[def.Key],
			LifetimeBlessings:   lifetimeCompletions[def.Key] * def.Blessings,
			LastCompletedDate:   lastDate,
		})
	}

	return &GetStatsResponse{
		Stats:         stats,
		Recent:        recent,
		Upcoming:      upcoming,
		CurrentCycle:  currentCycle,
		PerfectCycles: perfectCycles,
		Date:          today,
	}, nil
}
