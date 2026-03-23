package handlers

import (
	"log"
	"net/http"
	"strings"

	"dailybible/internal/models"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// MannaHandler handles all Manna puzzle endpoints.
type MannaHandler struct {
	mannaService        *services.MannaService
	subscriptionChecker services.SubscriptionChecker
	streakService       *services.StreakService
	settingsService     *services.SettingsService
	adminIDs            map[uint]bool
}

// NewMannaHandler creates a MannaHandler.
func NewMannaHandler(
	mannaService *services.MannaService,
	subscriptionChecker services.SubscriptionChecker,
	streakService *services.StreakService,
	settingsService *services.SettingsService,
	adminIDs map[uint]bool,
) *MannaHandler {
	return &MannaHandler{
		mannaService:        mannaService,
		subscriptionChecker: subscriptionChecker,
		streakService:       streakService,
		settingsService:     settingsService,
		adminIDs:            adminIDs,
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

	// Record daily engagement so Manna play counts toward the reading streak.
	// Fires in a goroutine — streak update must not block the puzzle response.
	go func() {
		settings, err := h.settingsService.GetUserSettings(uid)
		if err != nil {
			settings = &models.UserSettings{PreferredTimezone: "UTC"}
		}
		if _, err := h.streakService.RecordDailyEngagement(uid, settings.PreferredTimezone); err != nil {
			log.Printf("manna RecordDailyEngagement user %d: %v", uid, err)
		}
	}()

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
		case strings.HasPrefix(msg, "not_a_word:"):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "not_a_word"})
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

// GetStats returns aggregated Manna statistics for the user (premium only).
// GET /api/manna/stats
func (h *MannaHandler) GetStats(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Manna stats are a premium feature."})
		return
	}

	stats, err := h.mannaService.GetStats(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
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

// AddWord inserts a new word into the Manna word bank (admin only).
// POST /api/admin/manna/words
// Body: { "word": "GRACE", "scripture_reference": "Eph 2:8", "scripture_text": "..." }
func (h *MannaHandler) AddWord(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.adminIDs[uid] {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required."})
		return
	}

	var req struct {
		Word               string `json:"word" binding:"required"`
		ScriptureReference string `json:"scripture_reference" binding:"required"`
		ScriptureText      string `json:"scripture_text"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "word and scripture_reference are required"})
		return
	}

	m, err := h.mannaService.AddWord(req.Word, req.ScriptureReference, req.ScriptureText)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "add_word_length:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Word must be exactly 5 letters."})
		case strings.HasPrefix(msg, "add_word_chars:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Word must contain only letters A–Z."})
		case strings.HasPrefix(msg, "add_word_ref:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "scripture_reference is required."})
		case strings.HasPrefix(msg, "add_word_duplicate:"):
			c.JSON(http.StatusConflict, gin.H{"error": "This word already exists in the word bank."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add word."})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":                  m.ID,
		"word":                m.Word,
		"scripture_reference": m.ScriptureReference,
		"scripture_text":      m.ScriptureText,
	})
}
