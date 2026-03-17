package handlers

import (
	"net/http"
	"strings"

	"dailybible/internal/config"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// TranslationsHandler serves available Bible translations for a given language.
type TranslationsHandler struct {
	settingsService     *services.SettingsService
	subscriptionChecker services.SubscriptionChecker
}

func NewTranslationsHandler(
	settingsService *services.SettingsService,
	subscriptionChecker services.SubscriptionChecker,
) *TranslationsHandler {
	return &TranslationsHandler{
		settingsService:     settingsService,
		subscriptionChecker: subscriptionChecker,
	}
}

// translationDTO is the response shape for a single translation entry.
type translationDTO struct {
	Key             string `json:"key"`
	Name            string `json:"name"`
	Abbreviation    string `json:"abbreviation"`
	RequiresPremium bool   `json:"requires_premium"`
}

// GetTranslations handles GET /api/translations?lang=en
//
// Public endpoint (OptionalAuthMiddleware). Returns all translations for the
// requested language, the caller's premium status, and their current version.
func (h *TranslationsHandler) GetTranslations(c *gin.Context) {
	lang := c.DefaultQuery("lang", "en")

	versions := config.GetVersionsForLanguage(lang)

	userID, authenticated := c.Get("userID")
	isPremium := false
	if authenticated {
		isPremium = h.subscriptionChecker.IsPremium(userID.(uint))
	}

	currentVersion := config.GetDefaultFreeVersion(lang)
	if authenticated {
		settings, err := h.settingsService.GetUserSettings(userID.(uint))
		if err == nil && settings.PreferredBibleVersion != "" {
			currentVersion = settings.PreferredBibleVersion
		}
	}

	dtos := make([]translationDTO, 0, len(versions))
	for _, v := range versions {
		dtos = append(dtos, translationDTO{
			Key:             strings.ToLower(v.Abbreviation),
			Name:            v.Name,
			Abbreviation:    v.Abbreviation,
			RequiresPremium: v.RequiresPremium,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"translations":    dtos,
		"user_is_premium": isPremium,
		"current_version": currentVersion,
	})
}
