package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"dailybible/internal/models"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SubscriberHandler handles public email capture from the landing page.
type SubscriberHandler struct {
	db           *gorm.DB
	emailService *services.EmailService
	frontendURL  string
}

func NewSubscriberHandler(db *gorm.DB, emailService *services.EmailService, frontendURL string) *SubscriberHandler {
	return &SubscriberHandler{
		db:           db,
		emailService: emailService,
		frontendURL:  frontendURL,
	}
}

type subscribeRequest struct {
	Email string `json:"email" binding:"required"`
}

// Subscribe handles POST /api/subscribe (public — no auth required).
// Idempotent: re-subscribing an existing email returns 200 without re-sending the welcome email.
func (h *SubscriberHandler) Subscribe(c *gin.Context) {
	var req subscribeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))
	if !isValidEmail(email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please enter a valid email address"})
		return
	}

	// Check for duplicate before inserting so we can return early without sending email.
	var existing models.EmailSubscriber
	result := h.db.Where("email = ?", email).First(&existing)
	if result.Error == nil {
		// Already subscribed — return 200 so the frontend shows a success state
		// without revealing whether the email is in our list.
		c.JSON(http.StatusOK, gin.H{"message": "You're already subscribed!"})
		return
	}
	if result.Error != gorm.ErrRecordNotFound {
		log.Printf("SubscriberHandler.Subscribe: DB lookup error: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong. Please try again."})
		return
	}

	// Generate a secure unsubscribe token
	token, err := services.GenerateToken()
	if err != nil {
		log.Printf("SubscriberHandler.Subscribe: token generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong. Please try again."})
		return
	}

	sub := models.EmailSubscriber{
		Email:            email,
		Source:           "landing_page",
		UnsubscribeToken: token,
		SubscribedAt:     time.Now().UTC(),
	}
	if err := h.db.Create(&sub).Error; err != nil {
		log.Printf("SubscriberHandler.Subscribe: DB insert error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong. Please try again."})
		return
	}

	// Send welcome email asynchronously — don't block the HTTP response on it
	unsubURL := fmt.Sprintf("%s/api/subscribe/unsubscribe?token=%s", h.frontendURL, token)
	go func() {
		if err := h.emailService.SendSubscriberWelcome(email, unsubURL); err != nil {
			log.Printf("SubscriberHandler: welcome email failed for %s: %v", email, err)
		}
	}()

	c.JSON(http.StatusOK, gin.H{"message": "You're on the list! Check your inbox for a welcome email."})
}

// Unsubscribe handles GET /api/subscribe/unsubscribe?token=<token> (public).
// Called when the user clicks the unsubscribe link in their email.
func (h *SubscriberHandler) Unsubscribe(c *gin.Context) {
	token := c.Query("token")
	if !isValidToken(token) {
		// Return 200 regardless — don't reveal whether the token exists or is malformed
		c.JSON(http.StatusOK, gin.H{"message": "You've been unsubscribed."})
		return
	}

	result := h.db.Where("unsubscribe_token = ?", token).Delete(&models.EmailSubscriber{})
	if result.Error != nil {
		log.Printf("SubscriberHandler.Unsubscribe: DB error: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Something went wrong."})
		return
	}

	// Token not found — still return 200 to avoid token enumeration
	c.JSON(http.StatusOK, gin.H{"message": "You've been unsubscribed."})
}

// isValidEmail performs a lightweight RFC 5322-compatible email check.
// Full validation happens server-side only; we don't want to over-reject.
func isValidEmail(email string) bool {
	if len(email) < 3 || len(email) > 320 {
		return false
	}
	at := strings.LastIndex(email, "@")
	if at < 1 {
		return false
	}
	domain := email[at+1:]
	dot := strings.LastIndex(domain, ".")
	// Require at least one char before the dot and two after (minimum TLD length)
	return dot > 0 && dot < len(domain)-2
}

// isValidToken checks that token is a 64-character lowercase hex string,
// as produced by GenerateToken(). Rejects malformed or oversized input
// before hitting the database.
func isValidToken(token string) bool {
	if len(token) != 64 {
		return false
	}
	for _, c := range token {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')) {
			return false
		}
	}
	return true
}
