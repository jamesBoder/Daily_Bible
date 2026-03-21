package handlers

import (
	"net/http"

	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// LeaderboardHandler handles leaderboard and visibility endpoints.
type LeaderboardHandler struct {
	leaderboardService  *services.LeaderboardService
	subscriptionChecker services.SubscriptionChecker
	settingsService     *services.SettingsService
}

// NewLeaderboardHandler creates a new LeaderboardHandler.
func NewLeaderboardHandler(
	leaderboardService *services.LeaderboardService,
	subscriptionChecker services.SubscriptionChecker,
	settingsService *services.SettingsService,
) *LeaderboardHandler {
	return &LeaderboardHandler{
		leaderboardService:  leaderboardService,
		subscriptionChecker: subscriptionChecker,
		settingsService:     settingsService,
	}
}

// GetFriendsBoard returns the authenticated user's friends ranked by streak.
// GET /api/leaderboard/friends
func (h *LeaderboardHandler) GetFriendsBoard(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	entries, err := h.leaderboardService.GetFriendsBoard(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get friends leaderboard"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"entries": entries})
}

// GetCommunityBoard returns the top opt-in users by streak.
// Uses optional auth — guests see anonymized usernames.
// GET /api/leaderboard/community
func (h *LeaderboardHandler) GetCommunityBoard(c *gin.Context) {
	// OptionalAuthMiddleware sets userID=0 for unauthenticated requests.
	var requestingUserID uint
	if id, exists := c.Get("userID"); exists {
		if uid, ok := id.(uint); ok {
			requestingUserID = uid
		}
	}

	entries, err := h.leaderboardService.GetCommunityBoard(requestingUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get community leaderboard"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"entries": entries})
}

// SetVisibility toggles the authenticated user's community leaderboard visibility.
// Premium-only: free users receive 403.
// PUT /api/leaderboard/visibility   body: { "visible": true/false }
func (h *LeaderboardHandler) SetVisibility(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	if !h.subscriptionChecker.IsPremium(userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Premium subscription required to appear on the leaderboard"})
		return
	}

	var body struct {
		Visible bool `json:"visible"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "visible field is required"})
		return
	}

	if err := h.settingsService.SetLeaderboardVisible(userID, body.Visible); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visibility"})
		return
	}

	// Invalidate the community board cache so the toggle takes effect immediately.
	h.leaderboardService.InvalidateCache()

	c.JSON(http.StatusOK, gin.H{"visible": body.Visible})
}
