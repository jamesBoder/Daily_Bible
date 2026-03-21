package handlers

import (
	"log"
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
	favoriteService  *services.FavoriteService
	bibleAPIService  services.BibleAPIService
	blessingsService *services.BlessingsService
}

// Constructor
func NewFavoriteHandler(favoriteService *services.FavoriteService, bibleAPIService services.BibleAPIService, blessingsService *services.BlessingsService) *FavoriteHandler {
	return &FavoriteHandler{
		favoriteService:  favoriteService,
		bibleAPIService:  bibleAPIService,
		blessingsService: blessingsService,
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

	// Phase 8: use real premium multiplier from Gin context.
	blessingsMultiplier := 1.0
	if c.GetBool("isPremium") {
		blessingsMultiplier = 1.5
	}
	// Credit blessings for favoriting — capped at 3 unique favorites per day.
	// This prevents users from mass-favoriting dozens of verses in one session to
	// farm Blessings. The cap is per-reason per-day (UTC boundary), checked in DB.
	var blessingsCredited int
	if credited, err := h.blessingsService.CreditWithDailyCap(userIDStr.(uint), 3, "verse_favorited", blessingsMultiplier, 3); err == nil && credited > 0 {
		blessingsCredited = credited
	} else if err != nil {
		log.Printf("Failed to credit blessings for favorite: %v", err)
	}

	response := gin.H{"message": "Favorite added successfully"}
	if blessingsCredited > 0 {
		response["blessings_credited"] = blessingsCredited
	}

	c.JSON(http.StatusOK, response)
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

	// Debit blessings when a favorite is removed — this prevents users from
	// gaming the system by repeatedly adding and removing verses to earn Blessings.
	// Non-blocking: if the user has insufficient balance we skip silently.
	go func() {
		if err := h.blessingsService.Debit(userIDStr.(uint), 3, "verse_unfavorited"); err != nil {
			log.Printf("Could not debit blessings for unfavorite (balance may be too low): %v", err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "Favorite removed successfully"})
}

	

