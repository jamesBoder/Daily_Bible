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
	verse, err := h.dailyVerseService.GetDailyVerse()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily verse"})
		return
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

	c.JSON(http.StatusOK, gin.H{
        "verse": gin.H{
            "id":        verse.ID,
            "reference": verse.Reference,
            "text":      verse.Text,
            "book":      verse.Book,
            "chapter":   verse.Chapter,
            "verse":     verse.VerseNumber,
            "version":   verse.Version,
        },
    })
}

// GetVerseByReference fetches a verse by its reference
func (h *VerseHandler) GetVerseByReference(c *gin.Context) {
	reference := c.Param("reference")
	verse, err := h.bibleAPIService.GetVerse(reference)
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
		},
	})
}

// SearchVerses searches for verses based on a query parameter
func (h *VerseHandler) SearchVerses(c *gin.Context) {
	query := c.Query("q")
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	verses, err := h.bibleAPIService.SearchVerses(query, limit)
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
		})
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}
