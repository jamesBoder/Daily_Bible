package handlers

import (
	"dailybible/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// BlessingsHandler handles blessings-related endpoints
type BlessingsHandler struct {
	blessingsService *services.BlessingsService
}

// NewBlessingsHandler creates a new BlessingsHandler
func NewBlessingsHandler(blessingsService *services.BlessingsService) *BlessingsHandler {
	return &BlessingsHandler{
		blessingsService: blessingsService,
	}
}

// GetBalance returns the current blessings balance for the authenticated user
func (h *BlessingsHandler) GetBalance(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	balance, err := h.blessingsService.GetBalance(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get blessings balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"balance": balance,
	})
}

// GetTransactions returns the transaction history for the authenticated user
func (h *BlessingsHandler) GetTransactions(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Get limit from query parameter, default to 50
	limitStr := c.DefaultQuery("limit", "50")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100 // Cap at 100
	}

	// Get offset for pagination
	offsetStr := c.DefaultQuery("offset", "0")
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	transactions, err := h.blessingsService.GetTransactions(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"transactions": transactions,
	})
}
