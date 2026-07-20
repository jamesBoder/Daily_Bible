package handlers

import (
	"dailybible/internal/config"
	"dailybible/internal/models"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// MilestonesHandler handles milestone-related endpoints.
type MilestonesHandler struct {
	db *gorm.DB
}

// NewMilestonesHandler creates a new MilestonesHandler.
func NewMilestonesHandler(db *gorm.DB) *MilestonesHandler {
	return &MilestonesHandler{db: db}
}

// milestoneResponse is the shape returned per milestone in GET /api/milestones.
type milestoneResponse struct {
	Key              string  `json:"key"`
	DaysRequired     int     `json:"days_required"`
	Name             string  `json:"name"`
	BlessingsAwarded int     `json:"blessings_awarded"`
	Earned           bool    `json:"earned"`
	AchievedAt       *string `json:"achieved_at,omitempty"`
	BadgeVariant     string  `json:"badge_variant"`
}

// GetMilestones returns all milestone definitions merged with the user's achieved set.
// Response shape:
//
//	{
//	  "milestones": [ { key, days_required, name, blessings_awarded, earned, achieved_at?, badge_variant } ]
//	}
func (h *MilestonesHandler) GetMilestones(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	var achieved []models.UserMilestone
	if err := h.db.Where("user_id = ?", userID).Find(&achieved).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load milestones"})
		return
	}

	achievedMap := make(map[string]*models.UserMilestone, len(achieved))
	for i := range achieved {
		achievedMap[achieved[i].MilestoneKey] = &achieved[i]
	}

	results := make([]milestoneResponse, 0, len(config.MilestoneDefinitions))
	for _, def := range config.MilestoneDefinitions {
		r := milestoneResponse{
			Key:              def.Key,
			DaysRequired:     def.DaysRequired,
			Name:             def.Name,
			BlessingsAwarded: def.BlessingsAwarded,
			BadgeVariant:     "standard",
		}

		if um, ok := achievedMap[def.Key]; ok {
			r.Earned = true
			r.BadgeVariant = um.BadgeVariant
			ts := um.AchievedAt.Format(time.RFC3339)
			r.AchievedAt = &ts
		}

		results = append(results, r)
	}

	c.JSON(http.StatusOK, gin.H{"milestones": results})
}

// DismissCelebration marks a milestone celebration as seen.
// Idempotent — safe to call multiple times. If already dismissed or not found, returns 200.
//
// POST /api/milestones/:key/dismiss
func (h *MilestonesHandler) DismissCelebration(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	key := c.Param("key")

	now := time.Now()
	// WHERE includes `AND celebration_dismissed_at IS NULL` so already-dismissed rows
	// are not touched — purely a no-op. Always responds 200 either way (non-critical),
	// but a write failure is logged so it's not entirely invisible.
	if err := h.db.Model(&models.UserMilestone{}).
		Where("user_id = ? AND milestone_key = ? AND celebration_dismissed_at IS NULL", userID, key).
		Update("celebration_dismissed_at", now).Error; err != nil {
		log.Printf("MilestonesHandler.DismissCelebration: update failed for user %v key %s: %v", userID, key, err)
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
