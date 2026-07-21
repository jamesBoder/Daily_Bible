package handlers

import (
	"dailybible/internal/models"
	"dailybible/internal/services"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const rosaryBlessings = 50

// PrayerHandler handles all /api/prayer endpoints.
type PrayerHandler struct {
	db                  *gorm.DB
	blessingsService    *services.BlessingsService
	subscriptionChecker services.SubscriptionChecker
	disciplineService   *services.DisciplineService
}

// NewPrayerHandler creates a new PrayerHandler.
func NewPrayerHandler(db *gorm.DB, blessingsService *services.BlessingsService, subscriptionChecker services.SubscriptionChecker) *PrayerHandler {
	return &PrayerHandler{
		db:                  db,
		blessingsService:    blessingsService,
		subscriptionChecker: subscriptionChecker,
	}
}

// SetDisciplineService wires the discipline service for the complete_rosary hook.
func (h *PrayerHandler) SetDisciplineService(s *services.DisciplineService) {
	h.disciplineService = s
}

// CompleteRosary handles POST /api/prayer/rosary/complete
// Auth required; premium-gated.
// Credits 50 Blessings once per calendar day (UTC). Idempotent — returns
// blessings_earned: 0 if already credited today.
func (h *PrayerHandler) CompleteRosary(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "prayer_premium_required"})
		return
	}

	var body struct {
		MysterySet string `json:"mystery_set" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	today := time.Now().UTC().Add(-10 * time.Hour).Truncate(24 * time.Hour)

	// Idempotency check: only credit once per calendar day
	var existing models.RosaryCompletion
	err := h.db.Where("user_id = ? AND completed_date = ?", userID, today).First(&existing).Error
	if err == nil {
		// Already credited today
		balance, _ := h.blessingsService.GetBalance(userID)
		c.JSON(http.StatusOK, gin.H{
			"blessings_earned": 0,
			"total_blessings":  balance,
		})
		return
	}

	// Record the completion
	completion := models.RosaryCompletion{
		UserID:        userID,
		CompletedDate: today,
		MysterySet:    body.MysterySet,
	}
	if err := h.db.Create(&completion).Error; err != nil {
		// Handle race condition: unique constraint violation means already credited
		balance, _ := h.blessingsService.GetBalance(userID)
		c.JSON(http.StatusOK, gin.H{
			"blessings_earned": 0,
			"total_blessings":  balance,
		})
		return
	}

	credited, err := h.blessingsService.Credit(userID, rosaryBlessings, "complete_rosary", 1.0)
	if err != nil {
		// Roll back the completion row so the idempotency guard doesn't block a retry.
		h.db.Delete(&completion)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to credit blessings"})
		return
	}

	balance, _ := h.blessingsService.GetBalance(userID)
	resp := gin.H{
		"blessings_earned": credited,
		"total_blessings":  balance,
	}
	// Separate from the direct Credit() above — this is the complete_rosary
	// discipline layer, same double-credit pattern used by advance_plan_day etc.
	if h.disciplineService != nil {
		if dcCredits, dcErr := h.disciplineService.TryComplete(userID, "complete_rosary", isPremium); dcErr != nil {
			log.Printf("discipline TryComplete complete_rosary failed user %d: %v", userID, dcErr)
		} else if dcCredits > 0 {
			resp["discipline_completed"] = gin.H{"key": "complete_rosary", "blessings_credited": dcCredits}
		}
	}
	c.JSON(http.StatusOK, resp)
}
