package handlers

import (
    "log"
    "net/http"
    "strconv"
    
    "dailybible/internal/models"
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

// init VerseHandler Struct
type VerseHandler struct {
	dailyVerseService *services.DailyVerseService
	bibleAPIService   services.BibleAPIService
	historyService   *services.HistoryService
	streakService    *services.StreakService
	blessingsService *services.BlessingsService
	settingsService  *services.SettingsService
}

// NewVerseHandler creates a new VerseHandler
func NewVerseHandler(
	dailyVerseService *services.DailyVerseService,
	bibleAPIService services.BibleAPIService,
	historyService *services.HistoryService,
	streakService *services.StreakService,
	blessingsService *services.BlessingsService,
	settingsService *services.SettingsService,
) *VerseHandler {
	return &VerseHandler{
		dailyVerseService: dailyVerseService,
		bibleAPIService:   bibleAPIService,
		historyService:    historyService,
		streakService:    streakService,
		blessingsService: blessingsService,
		settingsService:  settingsService,
	}
}

// GetDailyVerse returns the verse of the day
func (h *VerseHandler) GetDailyVerse(c *gin.Context) {
	// Get language preference from query parameter or default to English
	language := c.DefaultQuery("lang", "en")
	
	// IMPORTANT: RecordDailyEngagement fires regardless of whether the Bible API succeeds.
	// The user's intent to engage is known the moment they hit this endpoint.
	// If API.Bible is down and we serve a fallback/cached verse, the streak still counts.
	// Never gate streak recording on the result of an external API call.
	var blessingsCredited int
	if userID, authenticated := c.Get("userID"); authenticated {
		// Get user settings for timezone
		settings, err := h.settingsService.GetUserSettings(userID.(uint))
		if err != nil {
			settings = &models.UserSettings{PreferredTimezone: "UTC"}
		}
		
		wasNew, err := h.streakService.RecordDailyEngagement(userID.(uint), settings.PreferredTimezone)
		if err != nil {
			log.Printf("RecordDailyEngagement failed for user %d: %v", userID, err)
			// Non-fatal: log and continue. The verse is served regardless.
		}
		if wasNew {
			// Blessings credit is gated on wasNew to prevent double-credit on page refresh.
			if credited, err := h.blessingsService.Credit(userID.(uint), 5, "daily_view", 1.0); err != nil {
				log.Printf("Blessings credit failed: %v", err)
				// Do NOT add blessing_credited: true to the response if the write failed.
			} else {
				// Tell the frontend exactly how much was credited so the toast shows the right number.
				blessingsCredited = credited
			}

			// Milestone check runs asynchronously to keep verse response fast.
			// The result surfaces on the next GET /api/streak call.
			// Wrap in recover() — an unrecovered panic in a goroutine crashes the Go process.
			go func() {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("CheckMilestones panic for user %d: %v", userID, r)
					}
				}()
				// Phase 2+ only: rewardsService.CheckMilestones(...)
			}()
		}
	}
	
	// For now, we'll get the daily verse in English and then fetch it in the requested language
	// In a future update, we could store daily verses for each language
	verse, err := h.dailyVerseService.GetDailyVerse()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily verse"})
		return
	}
	
	// If a different language is requested, fetch the verse in that language
	if language != "en" {
		translatedVerse, err := h.bibleAPIService.GetVerseWithLanguage(verse.Reference, language)
		if err == nil {
			// Update the text with the translated version
			verse.Text = translatedVerse.Text
		}
		// If translation fails, we'll return the English version
	}

	// Record verse view in history if user is authenticated
	if userID, exists := c.Get("userID"); exists {
		err := h.historyService.AddToHistory(userID.(uint), verse.ID)
		if err != nil {
			// Log error but don't fail the request
			// History tracking is a non-critical feature
			c.Error(err)
		}
	}

	// Cache for 1 hour on the client; CDN/proxy may cache publicly for the same period.
	// The verse changes at most once per day so this is safe.
	c.Header("Cache-Control", "public, max-age=3600, stale-while-revalidate=60")

	response := gin.H{
        "verse": gin.H{
            "id":        verse.ID,
            "reference": verse.Reference,
            "text":      verse.Text,
            "book":      verse.Book,
            "chapter":   verse.Chapter,
            "verse":     verse.VerseNumber,
            "version":   verse.Version,
            "language":  language,
        },
    }
	
	// Add blessings_credited to response if any were credited
	if blessingsCredited > 0 {
		response["blessings_credited"] = blessingsCredited
	}
	
	c.JSON(http.StatusOK, response)
}

// GetVerseByReference fetches a verse by its reference
func (h *VerseHandler) GetVerseByReference(c *gin.Context) {
	reference := c.Param("reference")
	// Get language preference from query parameter or default to English
	language := c.DefaultQuery("lang", "en")
	
	verse, err := h.bibleAPIService.GetVerseWithLanguage(reference, language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch verse"})
		return
	}

	// Note: History tracking is not implemented for this endpoint
	// because verses from the Bible API don't have database IDs yet.
	// History tracking only works for the daily verse endpoint which
	// stores verses in the database with proper uint IDs.
	// TODO: Consider storing all viewed verses in DB to enable history tracking

	c.JSON(http.StatusOK, gin.H{
		"verse": gin.H{
			"id":        verse.ID,
			"reference": verse.Reference,
			"text":      verse.Text,
			"bookId":    verse.BookID,
			"chapterId": verse.ChapterID,
			"language":  language,
		},
	})
}

// SearchVerses searches for verses based on a query parameter
func (h *VerseHandler) SearchVerses(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")
	// Get language preference from query parameter or default to English
	language := c.DefaultQuery("lang", "en")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	verses, err := h.bibleAPIService.SearchVersesWithLanguage(query, limit, language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search verses"})
		return
	}

	var results []gin.H
	for _, verse := range verses {
		results = append(results, gin.H{
			"id":        verse.ID,
			"reference": verse.Reference,
			"text":      verse.Text,
			"bookId":    verse.BookID,
			"chapterId": verse.ChapterID,
			"language":  language,
		})
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}
