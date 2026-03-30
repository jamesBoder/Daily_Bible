package handlers

import (
	"dailybible/internal/config"
	"dailybible/internal/models"
	"dailybible/internal/services"
	"dailybible/internal/utils"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// StreakHandler handles streak-related endpoints
type StreakHandler struct {
	streakService    *services.StreakService
	blessingsService *services.BlessingsService
	settingsService  *services.SettingsService
	db               *gorm.DB
}

// NewStreakHandler creates a new StreakHandler
func NewStreakHandler(
	streakService *services.StreakService,
	blessingsService *services.BlessingsService,
	settingsService *services.SettingsService,
	db *gorm.DB,
) *StreakHandler {
	return &StreakHandler{
		streakService:    streakService,
		blessingsService: blessingsService,
		settingsService:  settingsService,
		db:               db,
	}
}

// MilestoneAchievementDTO is the shape returned for newly_achieved_milestone
// and next_milestone in GET /api/streak.
type MilestoneAchievementDTO struct {
	Key              string  `json:"key"`
	Name             string  `json:"name"`
	DaysRequired     int     `json:"days_required"`
	BlessingsAwarded int     `json:"blessings_awarded"`
	AchievedAt       *string `json:"achieved_at,omitempty"`
}

// GetStreakSummary returns the current streak data for the authenticated user.
// Phase 2: includes next_milestone and newly_achieved_milestone.
func (h *StreakHandler) GetStreakSummary(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Fetch settings first — streak query needs the timezone.
	settings, err := h.settingsService.GetUserSettings(userID)
	if err != nil {
		settings = &models.UserSettings{PreferredTimezone: "UTC"}
	}

	// Fan out: streak, balance, milestones, and undismissed milestone are all
	// independent after settings resolve. Run them concurrently.
	var (
		streak            *models.UserStreak
		streakRecoverable bool
		streakErr         error
		balance           int
		achievedMilestones []models.UserMilestone
		undismissed        models.UserMilestone
		hasUndismissed     bool
	)

	var wg sync.WaitGroup
	wg.Add(4)

	go func() {
		defer wg.Done()
		streak, streakRecoverable, streakErr = h.streakService.GetStreakSummary(userID, settings.PreferredTimezone)
	}()
	go func() {
		defer wg.Done()
		balance, _ = h.blessingsService.GetBalance(userID)
	}()
	go func() {
		defer wg.Done()
		h.db.Where("user_id = ?", userID).Find(&achievedMilestones)
	}()
	go func() {
		defer wg.Done()
		hasUndismissed = h.db.
			Where("user_id = ? AND celebration_dismissed_at IS NULL", userID).
			Order("achieved_at DESC").
			First(&undismissed).Error == nil
	}()

	wg.Wait()

	if streakErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streak data"})
		return
	}

	// ── Milestones ────────────────────────────────────────────────────────────
	achievedMap := make(map[string]bool, len(achievedMilestones))
	for _, m := range achievedMilestones {
		achievedMap[m.MilestoneKey] = true
	}

	// Compute next_milestone.
	var nextMilestoneDTO *MilestoneAchievementDTO
	if def := config.NextMilestone(streak.CurrentStreak, achievedMap); def != nil {
		nextMilestoneDTO = &MilestoneAchievementDTO{
			Key:              def.Key,
			Name:             def.Name,
			DaysRequired:     def.DaysRequired,
			BlessingsAwarded: def.BlessingsAwarded,
		}
	}

	// Find the most recently achieved undismissed milestone (for the celebration modal).
	var newlyAchievedDTO *MilestoneAchievementDTO
	if hasUndismissed {
		for _, def := range config.MilestoneDefinitions {
			if def.Key == undismissed.MilestoneKey {
				ts := undismissed.AchievedAt.Format(time.RFC3339)
				newlyAchievedDTO = &MilestoneAchievementDTO{
					Key:              def.Key,
					Name:             def.Name,
					DaysRequired:     def.DaysRequired,
					BlessingsAwarded: def.BlessingsAwarded,
					AchievedAt:       &ts,
				}
				break
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"current_streak":           streak.CurrentStreak,
		"longest_streak":           streak.LongestStreak,
		"last_active_date":         streak.LastActiveDate,
		"grace_days_remaining":     streak.GraceDaysRemaining,
		"grace_days_reset_at":      streak.GraceDaysResetAt,
		"streak_recoverable":       streakRecoverable,
		"blessings_balance":        balance,
		"next_milestone":           nextMilestoneDTO,
		"newly_achieved_milestone": newlyAchievedDTO,
	})
}

// UseGraceDay uses a grace day to recover the streak
func (h *StreakHandler) UseGraceDay(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	settings, err := h.settingsService.GetUserSettings(userID)
	if err != nil {
		settings = &models.UserSettings{PreferredTimezone: "UTC"}
	}

	err = h.streakService.UseGraceDay(userID, settings.PreferredTimezone)
	if err != nil {
		var errorKey string
		var message string

		switch err {
		case services.ErrNoGraceDaysRemaining:
			errorKey = "no_grace_days"
			message = "You have no Grace Days remaining."
		case services.ErrStreakAlreadyActiveToday:
			errorKey = "streak_already_active"
			message = "Your streak is already preserved for today."
		case services.ErrStreakNotRecoverable:
			errorKey = "streak_not_recoverable"
			message = "Your streak has already reset. Grace Days can only fill in yesterday's miss."
		case services.ErrNoStreakToRecover:
			errorKey = "no_streak_to_recover"
			message = "You don't have an active streak to protect."
		default:
			errorKey = "unknown_error"
			message = "An error occurred while using the Grace Day."
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error":   errorKey,
			"message": message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// CalendarDay represents a single day in the calendar response.
type CalendarDay struct {
	Date  string `json:"date"`
	State string `json:"state"` // "engaged", "grace_day", "today_pending", "missed"
}

// CalendarMonth groups days by month.
type CalendarMonth struct {
	Year  int           `json:"year"`
	Month int           `json:"month"`
	Label string        `json:"label"`
	Days  []CalendarDay `json:"days"`
}

// GetCalendar returns the streak calendar for the authenticated user.
// Free tier: 1 month. Premium (Phase 8): up to 12 months.
// Query: ?months=1 (default, max 1 for free tier)
func (h *StreakHandler) GetCalendar(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	settings, err := h.settingsService.GetUserSettings(userID)
	if err != nil {
		settings = &models.UserSettings{PreferredTimezone: "UTC"}
	}
	tz := settings.PreferredTimezone

	// Parse months param — free tier enforces cap of 1 month regardless of input.
	months := 1
	if m, parseErr := strconv.Atoi(c.DefaultQuery("months", "1")); parseErr == nil && m > 0 {
		months = m
	}
	// Phase 8: replace with real subscription check and allow up to 12.
	_ = months // suppress "declared and not used" — always 1 for now
	months = 1

	loc, err := time.LoadLocation(tz)
	if err != nil {
		loc = time.UTC
	}
	todayStr := utils.TodayLocal(tz)
	today, _ := time.ParseInLocation("2006-01-02", todayStr, loc)
	fromDate := today.AddDate(0, -months, 0)

	// Query activity log for the date range.
	var logs []models.UserActivityLog
	h.db.
		Where("user_id = ? AND date_local >= ? AND date_local <= ?",
			userID, fromDate.Format("2006-01-02"), todayStr).
		Order("date_local ASC").
		Find(&logs)

	// Build lookup: date → action_type.
	// "grace_day_used" takes precedence if both action types somehow appear on the same date.
	logMap := make(map[string]string, len(logs))
	for _, l := range logs {
		if _, exists := logMap[l.DateLocal]; !exists || l.ActionType == "grace_day_used" {
			logMap[l.DateLocal] = l.ActionType
		}
	}

	// Iterate day-by-day, group by month.
	monthMap := make(map[string]*CalendarMonth)
	monthOrder := []string{}

	for cursor := fromDate; !cursor.After(today); cursor = cursor.AddDate(0, 0, 1) {
		dateStr := cursor.Format("2006-01-02")
		monthKey := cursor.Format("2006-01")

		if _, exists := monthMap[monthKey]; !exists {
			monthMap[monthKey] = &CalendarMonth{
				Year:  cursor.Year(),
				Month: int(cursor.Month()),
				Label: cursor.Format("January 2006"),
				Days:  []CalendarDay{},
			}
			monthOrder = append(monthOrder, monthKey)
		}

		var state string
		if actionType, hit := logMap[dateStr]; hit {
			state = actionTypeToState(actionType)
		} else if dateStr == todayStr {
			state = "today_pending"
		} else {
			state = "missed"
		}

		monthMap[monthKey].Days = append(monthMap[monthKey].Days, CalendarDay{
			Date:  dateStr,
			State: state,
		})
	}

	result := make([]CalendarMonth, 0, len(monthOrder))
	for _, key := range monthOrder {
		result = append(result, *monthMap[key])
	}

	c.JSON(http.StatusOK, gin.H{"months": result})
}

// actionTypeToState maps a UserActivityLog ActionType to a CalendarDay state string.
func actionTypeToState(actionType string) string {
	if actionType == "grace_day_used" {
		return "grace_day"
	}
	return "engaged"
}
