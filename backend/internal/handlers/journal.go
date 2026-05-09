package handlers

import (
	"dailybible/internal/services"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

const maxContentLength = 50_000

// JournalHandler handles all /api/journal endpoints.
type JournalHandler struct {
	journalService      *services.JournalService
	subscriptionChecker services.SubscriptionChecker
	subscriptionService *services.SubscriptionService // for HasOneTimePurchase("journal_unlock")
}

// NewJournalHandler creates a new JournalHandler.
func NewJournalHandler(
	journalService *services.JournalService,
	subscriptionChecker services.SubscriptionChecker,
) *JournalHandler {
	return &JournalHandler{
		journalService:      journalService,
		subscriptionChecker: subscriptionChecker,
	}
}

// SetSubscriptionService wires in the SubscriptionService for HasOneTimePurchase checks.
// Called from main.go after both services are initialized (breaks the initialization cycle).
func (h *JournalHandler) SetSubscriptionService(s *services.SubscriptionService) {
	h.subscriptionService = s
}

// journalEntryResponse is the JSON shape returned for a single entry.
type journalEntryResponse struct {
	ID           uint   `json:"id"`
	ContentPlain string `json:"content_plain"`
	ContentRich  string `json:"content_rich"`
	LinkedVerse  string `json:"linked_verse"`
	PromptID     *uint  `json:"prompt_id"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

// GetEntries handles GET /api/journal
// Returns up to 30 entries for free users and all entries for premium users.
// Always includes total_stored so the frontend can render the locked-entry upgrade prompt.
// hasJournalAccess returns true if the user has full journal access — either via
// an active subscription OR a standalone journal_unlock one-time purchase.
func (h *JournalHandler) hasJournalAccess(userID uint, isPremium bool) bool {
	if isPremium {
		return true
	}
	if h.subscriptionService != nil {
		return h.subscriptionService.HasOneTimePurchase(userID, "journal_unlock")
	}
	return false
}

func (h *JournalHandler) GetEntries(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	hasAccess := h.hasJournalAccess(userID, isPremium)
	entries, total, err := h.journalService.GetEntries(userID, hasAccess)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch journal entries"})
		return
	}

	var viewLimit *int
	if !hasAccess {
		cap := 30
		viewLimit = &cap
	}

	dtos := make([]journalEntryResponse, len(entries))
	for i, e := range entries {
		dtos[i] = journalEntryResponse{
			ID:           e.ID,
			ContentPlain: e.ContentPlain,
			ContentRich:  e.ContentRich,
			LinkedVerse:  e.LinkedVerse,
			PromptID:     e.PromptID,
			CreatedAt:    e.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:    e.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"entries":      dtos,
		"total_stored": total,
		"view_limit":   viewLimit,
		"is_premium":   hasAccess,
	})
}

// GetEntry handles GET /api/journal/:id
// Returns a single entry. Used by the editor when loading an existing entry.
func (h *JournalHandler) GetEntry(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	entry, err := h.journalService.GetEntry(userID, uint(id))
	if err != nil {
		if errors.Is(err, services.ErrJournalEntryNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch entry"})
		return
	}

	c.JSON(http.StatusOK, journalEntryResponse{
		ID:           entry.ID,
		ContentPlain: entry.ContentPlain,
		ContentRich:  entry.ContentRich,
		LinkedVerse:  entry.LinkedVerse,
		PromptID:     entry.PromptID,
		CreatedAt:    entry.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:    entry.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	})
}

// createEntryRequest is the expected JSON body for POST /api/journal.
type createEntryRequest struct {
	ContentPlain string `json:"content_plain"`
	ContentRich  string `json:"content_rich"`
	LinkedVerse  string `json:"linked_verse"`
	PromptID     *uint  `json:"prompt_id"`
}

// CreateEntry handles POST /api/journal
// Creates a new journal entry and credits 8 Blessings (capped 1/day).
// Returns blessings_credited so the frontend can show the blessings toast.
func (h *JournalHandler) CreateEntry(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	// Use cached isPremium from auth middleware (avoids extra DB query per request).
	isPremium := c.GetBool("isPremium")

	var req createEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	req.ContentPlain = strings.TrimSpace(req.ContentPlain)
	if req.ContentPlain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content_plain is required"})
		return
	}
	if len(req.ContentPlain) > maxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content_plain exceeds maximum length"})
		return
	}

	// Phase 8: real premium multiplier from Gin context.
	blessingsMultiplier := 1.0
	hasAccess := h.hasJournalAccess(userID, isPremium)
	if isPremium {
		blessingsMultiplier = 1.5
	}

	entry, blessingsCredited, err := h.journalService.CreateEntry(
		userID,
		hasAccess,
		req.ContentPlain,
		req.ContentRich,
		req.LinkedVerse,
		req.PromptID,
		blessingsMultiplier,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create journal entry"})
		return
	}

	resp := gin.H{
		"id":            entry.ID,
		"content_plain": entry.ContentPlain,
		"content_rich":  entry.ContentRich,
		"linked_verse":  entry.LinkedVerse,
		"prompt_id":     entry.PromptID,
		"created_at":    entry.CreatedAt.Format("2006-01-02T15:04:05Z"),
		"updated_at":    entry.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	}
	if blessingsCredited > 0 {
		resp["blessings_credited"] = blessingsCredited
	}
	c.JSON(http.StatusCreated, resp)
}

// updateEntryRequest is the expected JSON body for PUT /api/journal/:id.
type updateEntryRequest struct {
	ContentPlain string `json:"content_plain"`
	ContentRich  string `json:"content_rich"`
	LinkedVerse  string `json:"linked_verse"`
}

// UpdateEntry handles PUT /api/journal/:id
// Saves changes to an existing entry. Enforces ownership — returns 404 if the
// entry does not exist or belongs to another user.
func (h *JournalHandler) UpdateEntry(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")
	hasAccess := h.hasJournalAccess(userID, isPremium)

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	var req updateEntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	req.ContentPlain = strings.TrimSpace(req.ContentPlain)
	if req.ContentPlain == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content_plain is required"})
		return
	}
	if len(req.ContentPlain) > maxContentLength {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content_plain exceeds maximum length"})
		return
	}

	entry, err := h.journalService.UpdateEntry(
		uint(id),
		userID,
		hasAccess,
		req.ContentPlain,
		req.ContentRich,
		req.LinkedVerse,
	)
	if err != nil {
		if errors.Is(err, services.ErrJournalEntryNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update journal entry"})
		return
	}

	c.JSON(http.StatusOK, journalEntryResponse{
		ID:           entry.ID,
		ContentPlain: entry.ContentPlain,
		ContentRich:  entry.ContentRich,
		LinkedVerse:  entry.LinkedVerse,
		PromptID:     entry.PromptID,
		CreatedAt:    entry.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:    entry.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	})
}

// DeleteEntry handles DELETE /api/journal/:id
// Soft-deletes an entry. Enforces ownership — returns 404 if the entry does not
// exist or belongs to another user. Blessings earned at creation are NOT revoked.
func (h *JournalHandler) DeleteEntry(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid entry ID"})
		return
	}

	if err := h.journalService.DeleteEntry(uint(id), userID); err != nil {
		if errors.Is(err, services.ErrJournalEntryNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Entry not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete journal entry"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Entry deleted"})
}

// GetWeeklyPrompt handles GET /api/journal/prompt
// Returns the active weekly prompt for premium users, or { "prompt": null } for
// free users. Always returns 200 — a null prompt is not an error condition.
func (h *JournalHandler) GetWeeklyPrompt(c *gin.Context) {
	_ = c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	prompt, err := h.journalService.GetActivePrompt(isPremium)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prompt"})
		return
	}

	if prompt == nil {
		c.JSON(http.StatusOK, gin.H{"prompt": nil})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"prompt": gin.H{
			"id":           prompt.ID,
			"text":         prompt.PromptText,
			"active_from":  prompt.ActiveFrom.Format("2006-01-02"),
			"active_until": prompt.ActiveUntil.Format("2006-01-02"),
		},
	})
}
