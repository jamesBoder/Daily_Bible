package handlers

import (
	"net/http"
	"strconv"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)


// init FavoriteHandler struct 
type FavoriteHandler struct {
	favoriteService *services.FavoriteService 
}

// Constructor
func NewFavoriteHandler(favoriteService *services.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{
		favoriteService: favoriteService,
	}
}

// GetFavorites handler
func (h *FavoriteHandler) GetFavorites(c *gin.Context) {
	// get user ID from context set by auth middleware
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	

	// get favorites from service
	favorites, total, err := h.favoriteService.GetUserFavoritesPaginated(
        userID.(uint),
        page,
        pageSize,
    )
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}

	// calculate pagination info
	totalPages := (int(total) + pageSize - 1) / pageSize

	// prepare response
	c.JSON(http.StatusOK, gin.H{
        "favorites": favorites,
        "pagination": gin.H{
            "page":        page,
            "page_size":   pageSize,
            "total":       total,
            "total_pages": totalPages,
        },
	})
}

// add AddFavorite handler adds a verse to user's favorites
func (h *FavoriteHandler) AddFavorite(c *gin.Context) {
	// get user ID from context set by auth middleware
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse verse ID from request body
	var req struct {
		VerseID uint `json:"verse_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// add favorite via service
	if err := h.favoriteService.AddFavorite(userIDStr.(uint), req.VerseID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite added successfully"})
}

// RemoveFavorite handler removes a verse from user's favorites
func (h *FavoriteHandler) RemoveFavorite(c *gin.Context) {
	// get user ID from context set by auth middleware
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// get favorite ID from URL parameter
	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid favorite ID"})
		return
	}

	// remove favorite via service
	if err := h.favoriteService.RemoveFavorite(userIDStr.(uint), uint(favoriteID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Favorite removed successfully"})
}

	

