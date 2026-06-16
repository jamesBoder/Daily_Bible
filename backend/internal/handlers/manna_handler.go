package handlers

import (
	"log"
	"net/http"
	"strings"
	"time"

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
	disciplineService   *services.DisciplineService
}

// SetDisciplineService wires the discipline service for solve_manna_any and solve_manna_4 hooks.
func (h *MannaHandler) SetDisciplineService(s *services.DisciplineService) {
	h.disciplineService = s
}

// mannaSubmitResponse extends GuessResult with an optional discipline_completed field.
type mannaSubmitResponse struct {
	*services.GuessResult
	DisciplineCompleted *disciplineCompletedField `json:"discipline_completed,omitempty"`
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
// All signed-in users (free and premium) get the full game: 6 guesses + scripture clue.
// Premium-only features (hints, stats, history, archive) are gated individually.
// GET /api/manna/today
func (h *MannaHandler) GetToday(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	game, err := h.mannaService.GetOrCreateGame(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load today's game"})
		return
	}

	// Record daily engagement so Manna play counts toward the reading streak.
	// Only premium users get streak credit for Manna.
	// Fires in a goroutine — streak update must not block the puzzle response.
	if h.subscriptionChecker.IsPremium(uid) {
		go func() {
			settings, err := h.settingsService.GetUserSettings(uid)
			if err != nil {
				settings = &models.UserSettings{PreferredTimezone: "UTC"}
			}
			if _, err := h.streakService.RecordDailyEngagement(uid, settings.PreferredTimezone); err != nil {
				log.Printf("manna RecordDailyEngagement user %d: %v", uid, err)
			}
		}()
	}

	c.JSON(http.StatusOK, game)
}

// GetGuestGame returns the guest game configuration (word length + max guesses).
// Public — no auth required. Guest state is managed client-side (localStorage).
// GET /api/manna/guest/today
func (h *MannaHandler) GetGuestGame(c *gin.Context) {
	c.JSON(http.StatusOK, h.mannaService.GetGuestGameInfo())
}

// SubmitGuestGuess evaluates a guess for a guest (unauthenticated) player.
// Stateless — no game state is stored server-side.
// POST /api/manna/guest/guess
func (h *MannaHandler) SubmitGuestGuess(c *gin.Context) {
	var req struct {
		Guess       string `json:"guess" binding:"required"`
		IsLastGuess bool   `json:"is_last_guess"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing guess field"})
		return
	}

	result, err := h.mannaService.EvaluateGuestGuess(req.Guess, req.IsLastGuess)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "guess_length:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guesses must be exactly 5 letters."})
		case strings.HasPrefix(msg, "guess_chars:"):
			c.JSON(http.StatusBadRequest, gin.H{"error": "Guesses must contain only letters A–Z."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit guess"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// SubmitGuess handles a guess submission.
// POST /api/manna/guess
func (h *MannaHandler) SubmitGuess(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	var req struct {
		Guess string `json:"guess" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing guess field"})
		return
	}

	isPremium := h.subscriptionChecker.IsPremium(uid)
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

	resp := &mannaSubmitResponse{GuessResult: result}
	if h.disciplineService != nil && result.Status == "solved" {
		// Try solve_manna_any first; also try solve_manna_4 if solved in ≤4 guesses.
		// TryComplete is idempotent — only the key in today's rotation credits blessings.
		if credits, dcErr := h.disciplineService.TryComplete(uid, "solve_manna_any", isPremium); dcErr != nil {
			log.Printf("discipline TryComplete solve_manna_any failed user %d: %v", uid, dcErr)
		} else if credits > 0 {
			resp.DisciplineCompleted = &disciplineCompletedField{Key: "solve_manna_any", BlessingsCredited: credits}
		}
		if result.GuessCount <= 4 {
			if credits, dcErr := h.disciplineService.TryComplete(uid, "solve_manna_4", isPremium); dcErr != nil {
				log.Printf("discipline TryComplete solve_manna_4 failed user %d: %v", uid, dcErr)
			} else if credits > 0 {
				resp.DisciplineCompleted = &disciplineCompletedField{Key: "solve_manna_4", BlessingsCredited: credits}
			}
		}
	}
	c.JSON(http.StatusOK, resp)
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
		c.JSON(http.StatusForbidden, gin.H{"error": "Hints are a premium feature."})
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

// GetArchive returns a premium user's game for a past date.
// GET /api/manna/archive/:date
func (h *MannaHandler) GetArchive(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)
	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Archive is a premium feature."})
		return
	}
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}
	if !date.Before(time.Now().UTC().Add(-10 * time.Hour).Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archive date must be in the past."})
		return
	}
	game, err := h.mannaService.GetOrCreateArchiveGame(uid, date)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load archive game"})
		return
	}
	c.JSON(http.StatusOK, game)
}

// SubmitArchiveGuess handles a guess submission for an archive (past) game.
// POST /api/manna/archive/:date/guess
func (h *MannaHandler) SubmitArchiveGuess(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)
	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Archive is a premium feature."})
		return
	}
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format."})
		return
	}
	if !date.Before(time.Now().UTC().Add(-10 * time.Hour).Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archive date must be in the past."})
		return
	}
	var req struct {
		Guess string `json:"guess" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing guess field"})
		return
	}
	result, err := h.mannaService.SubmitArchiveGuess(uid, req.Guess, date)
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

// GetArchiveHint reveals one unrevealed letter for an archive game.
// POST /api/manna/archive/:date/hint
func (h *MannaHandler) GetArchiveHint(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)
	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Archive is a premium feature."})
		return
	}
	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format."})
		return
	}
	if !date.Before(time.Now().UTC().Add(-10 * time.Hour).Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archive date must be in the past."})
		return
	}
	result, err := h.mannaService.GetArchiveHint(uid, date)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "hint_no_game:"):
			c.JSON(http.StatusNotFound, gin.H{"error": "No active game found for that date."})
		case strings.HasPrefix(msg, "hint_game_over:"):
			c.JSON(http.StatusConflict, gin.H{"error": "The game is already complete."})
		case strings.HasPrefix(msg, "hint_max:"):
			c.JSON(http.StatusConflict, gin.H{"error": "No hints remaining for this game."})
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

// Forfeit forfeits today's in-progress game, revealing the answer without awarding solve blessings.
// Hint blessings are not refunded. Participation blessings (10 base) are still awarded.
// POST /api/manna/forfeit
func (h *MannaHandler) Forfeit(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	isPremium := h.subscriptionChecker.IsPremium(uid)
	result, err := h.mannaService.ForfeitToday(uid, isPremium)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "forfeit_no_game:"):
			c.JSON(http.StatusNotFound, gin.H{"error": "No active game found for today."})
		case strings.HasPrefix(msg, "forfeit_over:"):
			c.JSON(http.StatusConflict, gin.H{"error": "This game is already complete."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to forfeit game"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
}

// ForfeitArchive forfeits an in-progress archive game for the given date.
// POST /api/manna/archive/:date/forfeit
func (h *MannaHandler) ForfeitArchive(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uint)

	if !h.subscriptionChecker.IsPremium(uid) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Archive is a premium feature."})
		return
	}

	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD."})
		return
	}
	if !date.Before(time.Now().UTC().Add(-10 * time.Hour).Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archive date must be in the past."})
		return
	}

	result, err := h.mannaService.ForfeitArchiveGame(uid, date)
	if err != nil {
		msg := err.Error()
		switch {
		case strings.HasPrefix(msg, "forfeit_no_game:"):
			c.JSON(http.StatusNotFound, gin.H{"error": "No active game found for that date."})
		case strings.HasPrefix(msg, "forfeit_over:"):
			c.JSON(http.StatusConflict, gin.H{"error": "This game is already complete."})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to forfeit game"})
		}
		return
	}

	c.JSON(http.StatusOK, result)
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
