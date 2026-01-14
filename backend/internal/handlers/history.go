package handlers

import (
    "net/http"
    "strconv"
    
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

type HistoryHandler struct {
    historyService *services.HistoryService
}

func NewHistoryHandler(historyService *services.HistoryService) *HistoryHandler {
    return &HistoryHandler{
        historyService: historyService,
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