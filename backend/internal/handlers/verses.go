package handlers

import (
    "net/http"
    "strconv"
    
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

// init VerseHandler Struct
type VerseHandler struct {
	dailyVerseService *services.DailyVerseService
	bibleAPIService   services.BibleAPIService
	historyService   *services.HistoryService
}

// NewVerseHandler creates a new VerseHandler
func NewVerseHandler(
	dailyVerseService *services.DailyVerseService,
	bibleAPIService services.BibleAPIService,
	historyService *services.HistoryService,
) *VerseHandler {
	return &VerseHandler{
		dailyVerseService: dailyVerseService,
		bibleAPIService:   bibleAPIService,
		historyService:    historyService,
	}
}

// GetDailyVerse returns the verse of the day
func (h *VerseHandler) GetDailyVerse(c *gin.Context) {
	// Get language preference from query parameter or default to English
	language := c.DefaultQuery("lang", "en")
	
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

	c.JSON(http.StatusOK, gin.H{
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
    })
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
