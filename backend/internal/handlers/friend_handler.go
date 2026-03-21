package handlers

import (
	"net/http"
	"strconv"

	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// FriendHandler handles friend-related API endpoints.
type FriendHandler struct {
	friendService *services.FriendService
}

// NewFriendHandler creates a new FriendHandler.
func NewFriendHandler(friendService *services.FriendService) *FriendHandler {
	return &FriendHandler{friendService: friendService}
}

// GetFriends returns the authenticated user's accepted friends with streak info.
// GET /api/friends
func (h *FriendHandler) GetFriends(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	friends, err := h.friendService.GetFriends(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get friends"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"friends": friends})
}

// GetPendingRequests returns incoming friend requests for the authenticated user.
// GET /api/friends/requests
func (h *FriendHandler) GetPendingRequests(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	requests, err := h.friendService.GetPendingRequests(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get pending requests"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": requests})
}

// SendRequest creates a pending friend request to the specified username.
// POST /api/friends/request   body: { "username": "..." }
func (h *FriendHandler) SendRequest(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var body struct {
		Username string `json:"username"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username is required"})
		return
	}

	if err := h.friendService.SendRequest(userID, body.Username); err != nil {
		switch err.Error() {
		case "cannot add yourself as a friend":
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case "friendship or request already exists":
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		case "user not found":
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friend request sent"})
}

// AcceptRequest accepts a pending friend request by its UserFriend row ID.
// PUT /api/friends/request/:id
func (h *FriendHandler) AcceptRequest(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request id"})
		return
	}

	if err := h.friendService.AcceptRequest(uint(requestID), userID); err != nil {
		if err.Error() == "request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friend request accepted"})
}

// RejectRequest deletes a pending friend request by its UserFriend row ID.
// DELETE /api/friends/request/:id
func (h *FriendHandler) RejectRequest(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	requestID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request id"})
		return
	}

	if err := h.friendService.RejectRequest(uint(requestID), userID); err != nil {
		if err.Error() == "request not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject request"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friend request rejected"})
}

// RemoveFriend removes an accepted friendship.
// DELETE /api/friends/:id   (:id is the friend's user ID)
func (h *FriendHandler) RemoveFriend(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	friendID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid friend id"})
		return
	}

	if err := h.friendService.RemoveFriend(userID, uint(friendID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove friend"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Friend removed"})
}
