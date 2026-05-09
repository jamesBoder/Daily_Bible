package handlers

import (
	"fmt"
	"net/http"

	"dailybible/internal/config"
	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)

type SettingsHandler struct {
	settingsService *services.SettingsService
	tokenService    *services.TokenService
}

func NewSettingsHandler(settingsService *services.SettingsService, tokenService *services.TokenService) *SettingsHandler {
	return &SettingsHandler{
		settingsService: settingsService,
		tokenService:    tokenService,
	}
}

// GetSettings retrieves user settings
func (h *SettingsHandler) GetSettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	settings, err := h.settingsService.GetUserSettings(userID.(uint))
	if err != nil {
		// If settings don't exist, create default settings
		settings, err = h.settingsService.CreateDefaultSettings(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve or create settings"})
			return
		}
	}

	// Phase 4 backfill: if preferred_bible_version is empty, infer from language and persist.
	// Best-effort — a write failure does not fail the GET response.
	if settings.PreferredBibleVersion == "" {
		defaultVersion := config.GetDefaultFreeVersion(settings.PreferredLanguage)
		settings.PreferredBibleVersion = defaultVersion
		if updated, err := h.settingsService.UpdateUserSettings(userID.(uint), map[string]interface{}{
			"preferred_bible_version": defaultVersion,
		}); err == nil {
			settings = updated
		}
	}

	c.JSON(http.StatusOK, settings)
}

// UpdateSettings updates user settings
func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var updateRequest struct {
		PreferredLanguage     *string `json:"preferred_language"`
		PreferredBibleVersion *string `json:"preferred_bible_version"`
		EmailNotifications    *bool   `json:"email_notifications"`
		DailyVerseReminder    *bool   `json:"daily_verse_reminder"`
		ActiveTheme           *string `json:"active_theme"`
		MilestonePostsOptIn   *bool   `json:"milestone_posts_opt_in"`
		PushReminderTime      *string `json:"push_reminder_time"`
	}

	if err := c.ShouldBindJSON(&updateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Build updates map with only non-nil values
	updates := make(map[string]interface{})
	if updateRequest.PreferredLanguage != nil {
		// Validate language code
		validLanguages := map[string]bool{
			"en": true,
			"es": true,
			"fr": true,
			"ht": true,
		}

		if !validLanguages[*updateRequest.PreferredLanguage] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid language code"})
			return
		}

		updates["preferred_language"] = *updateRequest.PreferredLanguage
		// When the UI language changes and no explicit bible version is being
		// set in this same request, reset preferred_bible_version to the new
		// language's default.  This prevents a user who was on Spanish (with
		// "rvr1960" saved) from silently getting a mismatched version after
		// switching to English.
		if updateRequest.PreferredBibleVersion == nil {
			updates["preferred_bible_version"] = config.GetDefaultFreeVersion(*updateRequest.PreferredLanguage)
		}
	}

	if updateRequest.PreferredBibleVersion != nil {
		key := *updateRequest.PreferredBibleVersion
		if _, known := config.BibleVersions[key]; !known {
			c.JSON(http.StatusBadRequest, gin.H{"error": "unknown_translation"})
			return
		}
		updates["preferred_bible_version"] = key
	}

	if updateRequest.EmailNotifications != nil {
		updates["email_notifications"] = *updateRequest.EmailNotifications
	}

	if updateRequest.DailyVerseReminder != nil {
		updates["daily_verse_reminder"] = *updateRequest.DailyVerseReminder
	}

	if updateRequest.ActiveTheme != nil {
		validThemes := map[string]bool{
			"parchment": true, "midnight": true, "sanctuary": true,
			"desert-sand": true, "celestial": true, "scarlet-grace": true,
		}
		if !validThemes[*updateRequest.ActiveTheme] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_theme"})
			return
		}
		darkThemes := map[string]bool{
			"midnight": true, "sanctuary": true, "celestial": true, "scarlet-grace": true,
		}
		updates["active_theme"] = *updateRequest.ActiveTheme
		updates["dark_mode"] = darkThemes[*updateRequest.ActiveTheme]
	}

	if updateRequest.MilestonePostsOptIn != nil {
		updates["milestone_posts_opt_in"] = *updateRequest.MilestonePostsOptIn
	}

	if updateRequest.PushReminderTime != nil {
		// Validate format: must be "HH:00" where HH is 00-23
		var h, m int
		if _, err := fmt.Sscanf(*updateRequest.PushReminderTime, "%d:%d", &h, &m); err != nil || h < 0 || h > 23 || m != 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "push_reminder_time must be HH:00 (e.g. 08:00, 20:00)"})
			return
		}
		updates["push_reminder_time"] = fmt.Sprintf("%02d:00", h)
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	settings, err := h.settingsService.UpdateUserSettings(userID.(uint), updates)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Settings updated successfully",
		"settings": settings,
	})
}

// GetLanguage gets just the language preference
func (h *SettingsHandler) GetLanguage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	language, err := h.settingsService.GetUserLanguage(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve language preference"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"language": language})
}

// Unsubscribe handles one-click unsubscribe from daily verse reminder emails.
// It is a public endpoint — the user arrives from a link in their email with no auth cookie.
func (h *SettingsHandler) Unsubscribe(c *gin.Context) {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		c.Redirect(http.StatusFound, "/settings?unsubscribe=invalid")
		return
	}
	userID, err := h.tokenService.VerifyUnsubscribeToken(tokenStr)
	if err != nil {
		c.Redirect(http.StatusFound, "/settings?unsubscribe=invalid")
		return
	}
	if _, err := h.settingsService.UpdateUserSettings(userID, map[string]interface{}{
		"daily_verse_reminder": false,
	}); err != nil {
		c.Redirect(http.StatusFound, "/settings?unsubscribe=error")
		return
	}
	c.Redirect(http.StatusFound, "/settings?unsubscribed=true")
}

// UpdateLanguage updates just the language preference
func (h *SettingsHandler) UpdateLanguage(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var request struct {
		Language string `json:"language" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Language is required"})
		return
	}

	if err := h.settingsService.UpdateUserLanguage(userID.(uint), request.Language); err != nil {
		if err.Error() == "invalid language code" {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update language preference"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Language preference updated successfully",
		"language": request.Language,
	})
}
