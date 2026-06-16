package handlers

import (
	"dailybible/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// disciplineCompletedField is embedded in action responses when a discipline is newly completed.
// Used by Manna and Annotation handlers that return structs rather than gin.H.
type disciplineCompletedField struct {
	Key               string `json:"key"`
	BlessingsCredited int    `json:"blessings_credited"`
}

// DisciplineHandler handles /api/disciplines endpoints.
type DisciplineHandler struct {
	service *services.DisciplineService
}

// NewDisciplineHandler creates a new DisciplineHandler.
func NewDisciplineHandler(service *services.DisciplineService) *DisciplineHandler {
	return &DisciplineHandler{service: service}
}

// GetToday handles GET /api/disciplines/today.
// Returns today's disciplines and completion state for the authenticated user.
func (h *DisciplineHandler) GetToday(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	resp, err := h.service.GetToday(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch disciplines"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// Complete handles POST /api/disciplines/:key/complete.
// Manual fallback endpoint — most completions fire automatically from action hooks.
func (h *DisciplineHandler) Complete(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	key := c.Param("key")
	isPremium := c.GetBool("isPremium")

	credited, err := h.service.TryComplete(userID, key, isPremium)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to complete discipline"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"blessings_credited": credited})
}
