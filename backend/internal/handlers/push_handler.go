package handlers

import (
	"net/http"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)

// PushHandler handles Web Push subscription management.
type PushHandler struct {
	pushService *services.PushService
}

func NewPushHandler(pushService *services.PushService) *PushHandler {
	return &PushHandler{pushService: pushService}
}

// GetVAPIDPublicKey returns the server's VAPID public key so the browser can
// subscribe. Public endpoint — no auth required.
func (h *PushHandler) GetVAPIDPublicKey(c *gin.Context) {
	if !h.pushService.IsEnabled() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "push notifications not configured"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"public_key": h.pushService.VAPIDPublicKey()})
}

// Subscribe saves a push subscription for the authenticated user.
func (h *PushHandler) Subscribe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var body struct {
		Endpoint string `json:"endpoint" binding:"required"`
		P256DH   string `json:"p256dh"   binding:"required"`
		Auth     string `json:"auth"     binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "endpoint, p256dh, and auth are required"})
		return
	}

	if err := h.pushService.SaveSubscription(userID.(uint), body.Endpoint, body.P256DH, body.Auth); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save subscription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// Unsubscribe removes a push subscription for the authenticated user.
func (h *PushHandler) Unsubscribe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var body struct {
		Endpoint string `json:"endpoint" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "endpoint is required"})
		return
	}

	if err := h.pushService.DeleteSubscription(userID.(uint), body.Endpoint); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to remove subscription"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
