package handlers

import (
	"errors"
	"net/http"

	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// UnlocksHandler handles theme unlock and Blessings spend endpoints.
type UnlocksHandler struct {
	unlockService    *services.UnlockService
	blessingsService *services.BlessingsService
}

// NewUnlocksHandler creates a new UnlocksHandler.
func NewUnlocksHandler(unlockService *services.UnlockService, blessingsService *services.BlessingsService) *UnlocksHandler {
	return &UnlocksHandler{
		unlockService:    unlockService,
		blessingsService: blessingsService,
	}
}

type UnlockSummary struct {
	ThemeID string `json:"theme_id"`
	Name    string `json:"name"`
	Cost    int    `json:"cost"`
	IsOwned bool   `json:"is_owned"`
	IsFree  bool   `json:"is_free"`
}

type UnlocksResponse struct {
	Themes  []UnlockSummary `json:"themes"`
	Balance int             `json:"blessings_balance"`
}

var themeData = []struct {
	id   string
	name string
	cost int
}{
	{"parchment", "Parchment", 0},
	{"midnight", "Midnight", 0},
	{"sanctuary", "Sanctuary", 500},
	{"desert-sand", "Desert Sand", 500},
	{"celestial", "Celestial", 750},
	{"scarlet-grace", "Scarlet Grace", 750},
}

// GetUnlocks returns all available themes plus which ones the user owns,
// along with their current Blessings balance.
func (h *UnlocksHandler) GetUnlocks(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	ownedIDs, err := h.unlockService.GetUnlockedThemeIDs(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not load unlocks"})
		return
	}
	ownedSet := make(map[string]bool, len(ownedIDs))
	for _, id := range ownedIDs {
		ownedSet[id] = true
	}

	balance, _ := h.blessingsService.GetBalance(userID)

	summaries := make([]UnlockSummary, len(themeData))
	for i, t := range themeData {
		summaries[i] = UnlockSummary{
			ThemeID: t.id,
			Name:    t.name,
			Cost:    t.cost,
			IsFree:  t.cost == 0,
			IsOwned: t.cost == 0 || ownedSet[t.id],
		}
	}

	c.JSON(http.StatusOK, UnlocksResponse{
		Themes:  summaries,
		Balance: balance,
	})
}

type SpendRequest struct {
	ThemeID string `json:"theme_id" binding:"required"`
}

// SpendBlessings purchases a theme unlock for the authenticated user.
func (h *UnlocksHandler) SpendBlessings(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var req SpendRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "theme_id is required"})
		return
	}

	if err := h.unlockService.PurchaseTheme(userID, req.ThemeID); err != nil {
		switch {
		case errors.Is(err, services.ErrAlreadyUnlocked):
			c.JSON(http.StatusConflict, gin.H{"error": "already_unlocked"})
		case errors.Is(err, services.ErrInsufficientBlessings):
			c.JSON(http.StatusPaymentRequired, gin.H{"error": "insufficient_blessings"})
		case errors.Is(err, services.ErrInvalidTheme), errors.Is(err, services.ErrThemeIsFree):
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_theme"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not complete purchase"})
		}
		return
	}

	balance, _ := h.blessingsService.GetBalance(userID)
	c.JSON(http.StatusOK, gin.H{
		"message":           "Theme unlocked",
		"theme_id":          req.ThemeID,
		"blessings_balance": balance,
	})
}
