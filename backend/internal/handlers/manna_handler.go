package handlers

import (
	"net/http"
	"strings"

	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// MannaHandler handles all Manna puzzle endpoints.
type MannaHandler struct {
	mannaService        *services.MannaService
	subscriptionChecker services.SubscriptionChecker
}

// NewMannaHandler creates a MannaHandler.
func NewMannaHandler(mannaService *services.MannaService, subscriptionChecker services.SubscriptionChecker) *MannaHandler {
	return &MannaHandler{
		mannaService:        mannaService,
		subscriptionChecker: subscriptionChecker,
	}
}

// GetToday returns the user's game for today.
// Free users receive { "locked": true }.
// GET /api/manna/today
func (h *MannaHandler) GetToday(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		// Still show yesterday's word so free users are curious
		yesterday, _ := h.mannaService.GetYesterdayResult()
		c.JSON(http.StatusOK, gin.H{
			"locked":    true,
			"message":   "Manna is available with a Words of Praise membership.",
			"yesterday": yesterday,
		})
		return
	}

	game, err := h.mannaService.GetOrCreateGame(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load today's game"})
		return
	}

	c.JSON(http.StatusOK, game)
}

// SubmitGuess handles a guess submission.
// POST /api/manna/guess
func (h *MannaHandler) SubmitGuess(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Manna is a premium feature."})
		return
	}

	var req struct {
		Guess string `json:"guess" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing guess field"})
		return
	}

	isPremium := true // already gated above
	result, err := h.mannaService.SubmitGuess(uid, req.Guess, isPremium)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "guess_length:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guesses must be exactly 5 letters."})
		case strings.HasPrefix(msg, "guess_chars:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guesses must contain only letters A–Z."})
		case strings.HasPrefix(msg, "game_over:"):
			c.JSON(http.StatusConflict, gin.H{"error": "This game is already complete."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit guess"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetYesterday returns yesterday's word + Scripture. Public — no auth required.
// GET /api/manna/yesterday
func (h *MannaHandler) GetYesterday(c *gin.Context) {
	result, err := h.mannaService.GetYesterdayResult()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load yesterday's word"})
		return
	}
	c.JSON(http.StatusOK, result)
}

// GetHint reveals one unrevealed letter position for today's game.
// Costs 15 Blessings per hint; max 3 hints per game.
// POST /api/manna/hint
func (h *MannaHandler) GetHint(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Manna is a premium feature."})
		return
	}

	result, err := h.mannaService.GetHint(uid)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "hint_no_game:"):
			c.JSON(http.StatusNotFound, gin.H{"error": "No active game found for today."})
		case strings.HasPrefix(msg, "hint_game_over:"):
			c.JSON(http.StatusConflict, gin.H{"error": "The game is already complete."})
		case strings.HasPrefix(msg, "hint_max:"):
			c.JSON(http.StatusConflict, gin.H{"error": "No hints remaining for today."})
		case strings.HasPrefix(msg, "hint_none_left:"):
			c.JSON(http.StatusConflict, gin.H{"error": "All positions already revealed."})
		case strings.HasPrefix(msg, "hint_blessings:"):
			c.JSON(http.StatusPaymentRequired, gin.H{"error": "Not enough Blessings for a hint."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get hint"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// GetHistory returns the user's past game results (premium only).
// GET /api/manna/history
func (h *MannaHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "History is a premium feature."})
		return
	}

	history, err := h.mannaService.GetHistory(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"history": history})
}
