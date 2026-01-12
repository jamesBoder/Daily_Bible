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
}

// NewVerseHandler creates a new VerseHandler
func NewVerseHandler(
	dailyVerseService *services.DailyVerseService,
	bibleAPIService services.BibleAPIService,
) *VerseHandler {
	return &VerseHandler{
		dailyVerseService: dailyVerseService,
		bibleAPIService:   bibleAPIService,
	}
}

// GetDailyVerse returns the verse of the day
func (h *VerseHandler) GetDailyVerse(c *gin.Context) {
	verse, err := h.dailyVerseService.GetDailyVerse()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily verse"})
		return
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
