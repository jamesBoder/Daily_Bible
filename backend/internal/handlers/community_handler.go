package handlers

import (
	"net/http"
	"strconv"
	"time"

	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CommunityHandler handles all community board endpoints.
type CommunityHandler struct {
	communityService    *services.CommunityService
	subscriptionChecker services.SubscriptionChecker
	adminIDs            map[uint]bool
}

// NewCommunityHandler creates a new CommunityHandler.
func NewCommunityHandler(
	communityService *services.CommunityService,
	subscriptionChecker services.SubscriptionChecker,
	adminIDs map[uint]bool,
) *CommunityHandler {
	return &CommunityHandler{
		communityService:    communityService,
		subscriptionChecker: subscriptionChecker,
		adminIDs:            adminIDs,
	}
}

// GetFeed returns a paginated community feed.
// GET /api/community?before_id=0&limit=20
// Optional auth — guests receive announcements, milestones, and challenges only.
func (h *CommunityHandler) GetFeed(c *gin.Context) {
	var requestingUserID uint
	if id, exists := c.Get("userID"); exists {
		if uid, ok := id.(uint); ok {
			requestingUserID = uid
		}
	}

	beforeID, _ := strconv.ParseUint(c.DefaultQuery("before_id", "0"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	posts, err := h.communityService.GetFeed(requestingUserID, uint(beforeID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load community feed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts, "limit": limit, "is_admin": h.adminIDs[requestingUserID]})
}

// CreatePost creates a user post or prayer request.
// POST /api/community
// Body: { "post_type": "user"|"prayer", "body": "...", "anonymous": false }
// Auth required. "user" post_type requires premium.
func (h *CommunityHandler) CreatePost(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var body struct {
		PostType  string `json:"post_type"`
		Body      string `json:"body"`
		Anonymous bool   `json:"anonymous"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	post, err := h.communityService.CreatePost(userID, body.PostType, body.Body, body.Anonymous)
	if err != nil {
		switch err.Error() {
		case "premium subscription required to post reflections":
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		case "rate_limit":
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many posts — please wait a few minutes"})
		case "profanity_detected":
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "profanity_detected"})
		default:
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		}
		return
	}

	// Return a full PostResponse (with username, reactions, is_self) rather than the raw GORM model.
	pr, err := h.communityService.GetPostByID(post.ID, userID)
	if err != nil {
		c.JSON(http.StatusCreated, gin.H{"post": post})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"post": pr})
}

// DeletePost soft-deletes a post owned by the requesting user.
// DELETE /api/community/:id
// Auth required. Returns 404 if post doesn't belong to this user (never 403).
func (h *CommunityHandler) DeletePost(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	if err := h.communityService.DeletePost(uint(postID), userID); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete post"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// AddReaction adds a reaction to a post.
// POST /api/community/:id/react
// Body: { "reaction_type": "amen"|"pray"|"heart"|"join" }
// Auth required.
func (h *CommunityHandler) AddReaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var body struct {
		ReactionType string `json:"reaction_type"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "reaction_type is required"})
		return
	}

	if err := h.communityService.AddReaction(uint(postID), userID, body.ReactionType); err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reacted": true})
}

// RemoveReaction removes a user's reaction from a post.
// DELETE /api/community/:id/react
// Body: { "reaction_type": "..." }
// Auth required.
func (h *CommunityHandler) RemoveReaction(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	postID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	var body struct {
		ReactionType string `json:"reaction_type"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "reaction_type is required"})
		return
	}

	if err := h.communityService.RemoveReaction(uint(postID), userID, body.ReactionType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"removed": true})
}

// CreateAdminPost creates an admin announcement or challenge post.
// POST /api/community/admin
// Body: { "post_type": "announcement"|"challenge", "body": "...", "is_pinned": false, "expires_at": null }
// Auth required. Returns 403 if user is not in adminIDs.
func (h *CommunityHandler) CreateAdminPost(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	if !h.adminIDs[userID] {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	var body struct {
		PostType  string  `json:"post_type"`
		Body      string  `json:"body"`
		IsPinned  bool    `json:"is_pinned"`
		ExpiresAt *string `json:"expires_at"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var expiresAt *time.Time
	if body.ExpiresAt != nil {
		t, err := time.Parse(time.RFC3339, *body.ExpiresAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "expires_at must be RFC3339 format"})
			return
		}
		expiresAt = &t
	}

	if err := h.communityService.CreateAdminPost(body.PostType, body.Body, body.IsPinned, expiresAt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"created": true})
}

// GetWalkingToday returns the count of users who read the daily verse today.
// GET /api/community/walking-today
// Optional auth.
func (h *CommunityHandler) GetWalkingToday(c *gin.Context) {
	count, err := h.communityService.GetWalkingToday()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get walking count"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"count": count})
}
