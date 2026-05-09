package handlers

import (
	"net/http"
	"strconv"
	"sync"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)

type HistoryHandler struct {
	historyService  *services.HistoryService
	bibleAPIService services.BibleAPIService
}

func NewHistoryHandler(historyService *services.HistoryService, bibleAPIService services.BibleAPIService) *HistoryHandler {
	return &HistoryHandler{
		historyService:  historyService,
		bibleAPIService: bibleAPIService,
	}
}

// GetHistory retrieves user's verse history
func (h *HistoryHandler) GetHistory(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	lang := c.DefaultQuery("lang", "en")

	// Get history
	history, total, err := h.historyService.GetUserHistoryPaginated(
		userID.(uint),
		page,
		pageSize,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
		return
	}

	// If a non-English language is requested, translate verse text concurrently
	if lang != "en" && h.bibleAPIService != nil {
		var wg sync.WaitGroup
		for i := range history {
			if history[i].Verse.Reference != "" {
				wg.Add(1)
				go func(idx int) {
					defer wg.Done()
					translated, err := h.bibleAPIService.GetVerseWithLanguage(history[idx].Verse.Reference, lang)
					if err == nil && translated.Text != "" {
						history[idx].Verse.Text = translated.Text
					}
				}(i)
			}
		}
		wg.Wait()
	}

	// Calculate pagination metadata
	totalPages := (int(total) + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, gin.H{
		"history": history,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// ClearHistory removes all history for user
func (h *HistoryHandler) ClearHistory(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Clear history
	err := h.historyService.ClearHistory(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "History cleared successfully"})
}
