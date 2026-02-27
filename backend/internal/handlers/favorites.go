package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"sync"
	"dailybible/internal/services"
	"dailybible/internal/utils"
	"github.com/gin-gonic/gin"
)


// init FavoriteHandler struct 
type FavoriteHandler struct {
	favoriteService *services.FavoriteService
	bibleAPIService services.BibleAPIService
}

// Constructor
func NewFavoriteHandler(favoriteService *services.FavoriteService, bibleAPIService services.BibleAPIService) *FavoriteHandler {
	return &FavoriteHandler{
		favoriteService: favoriteService,
		bibleAPIService: bibleAPIService,
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
	search := c.Query("search")
	lang := c.DefaultQuery("lang", "en")

	// get favorites from service
	favorites, total, err := h.favoriteService.GetUserFavoritesPaginated(
        userID.(uint),
		search,
        page,
        pageSize,
    )
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
		return
	}

	// If a non-English language is requested, translate verse text concurrently
	if lang != "en" && h.bibleAPIService != nil {
		var wg sync.WaitGroup
		for i := range favorites {
			if favorites[i].Verse.Reference != "" {
				wg.Add(1)
				go func(idx int) {
					defer wg.Done()
					translated, err := h.bibleAPIService.GetVerseWithLanguage(favorites[idx].Verse.Reference, lang)
					if err == nil && translated.Text != "" {
						favorites[idx].Verse.Text = translated.Text
					}
				}(i)
			}
		}
		wg.Wait()
	}

	// prepare response
	paginationParams := utils.NewPaginationParams(page, pageSize)
	c.JSON(http.StatusOK, gin.H{
		"favorites": favorites,
		"pagination": utils.CalculatePaginationMeta(total, paginationParams),
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
	err := h.favoriteService.AddFavorite(userIDStr.(uint), req.VerseID)
	if err != nil {
		if strings.Contains(err.Error(), "already in favorites") {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
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

	

