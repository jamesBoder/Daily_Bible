package handlers

import (
    "dailybible/internal/models"
    "dailybible/internal/services"
    "net/http"

    "github.com/gin-gonic/gin"
)

// StreakHandler handles streak-related endpoints
type StreakHandler struct {
    streakService    *services.StreakService
    blessingsService *services.BlessingsService
    settingsService  *services.SettingsService
}

// NewStreakHandler creates a new StreakHandler
func NewStreakHandler(
    streakService *services.StreakService,
    blessingsService *services.BlessingsService,
    settingsService *services.SettingsService,
) *StreakHandler {
    return &StreakHandler{
        streakService:    streakService,
        blessingsService: blessingsService,
        settingsService:  settingsService,
    }
}

// GetStreakSummary returns the current streak data for the authenticated user
func (h *StreakHandler) GetStreakSummary(c *gin.Context) {
    userID := c.MustGet("userID").(uint)
    
    // Get user's timezone preference
    settings, err := h.settingsService.GetUserSettings(userID)
    if err != nil {
        settings = &models.UserSettings{PreferredTimezone: "UTC"}
    }
    
    streak, streakRecoverable, err := h.streakService.GetStreakSummary(userID, settings.PreferredTimezone)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get streak data"})
        return
    }
    
    // Get blessings balance
    balance, err := h.blessingsService.GetBalance(userID)
    if err != nil {
        balance = 0
    }
    
    // TODO: Phase 2 - Add next_milestone and newly_achieved_milestone
    
    c.JSON(http.StatusOK, gin.H{
        "current_streak":        streak.CurrentStreak,
        "longest_streak":        streak.LongestStreak,
        "last_active_date":      streak.LastActiveDate,
        "grace_days_remaining":  streak.GraceDaysRemaining,
        "grace_days_reset_at":   streak.GraceDaysResetAt,
        "streak_recoverable":    streakRecoverable,
        "blessings_balance":     balance,
        "next_milestone":        nil, // Phase 2
        "newly_achieved_milestone": nil, // Phase 2
    })
}

// UseGraceDay uses a grace day to recover the streak
func (h *StreakHandler) UseGraceDay(c *gin.Context) {
    userID := c.MustGet("userID").(uint)
    
    // Get user's timezone preference
    settings, err := h.settingsService.GetUserSettings(userID)
    if err != nil {
        settings = &models.UserSettings{PreferredTimezone: "UTC"}
    }
    
    err = h.streakService.UseGraceDay(userID, settings.PreferredTimezone)
    if err != nil {
        // Map typed errors to JSON response
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

// GetCalendar returns the streak calendar data
func (h *StreakHandler) GetCalendar(c *gin.Context) {
    // TODO: Phase 2 implementation
    c.JSON(http.StatusOK, gin.H{
        "months": []interface{}{},
    })
}