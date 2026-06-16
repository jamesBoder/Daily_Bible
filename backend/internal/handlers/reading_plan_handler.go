package handlers

import (
	"dailybible/internal/services"
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ReadingPlanHandler handles all /api/plans endpoints.
type ReadingPlanHandler struct {
	service             *services.ReadingPlanService
	subscriptionChecker services.SubscriptionChecker
	disciplineService   *services.DisciplineService
}

// NewReadingPlanHandler creates a new ReadingPlanHandler.
func NewReadingPlanHandler(service *services.ReadingPlanService, subscriptionChecker services.SubscriptionChecker) *ReadingPlanHandler {
	return &ReadingPlanHandler{
		service:             service,
		subscriptionChecker: subscriptionChecker,
	}
}

// SetDisciplineService wires the discipline service for the advance_plan_day hook.
func (h *ReadingPlanHandler) SetDisciplineService(s *services.DisciplineService) {
	h.disciplineService = s
}

// GetLibrary handles GET /api/plans
// Returns all active plans. Applies premium filter for free users.
// Works with OptionalAuth — unauthenticated requests get the free-tier view.
func (h *ReadingPlanHandler) GetLibrary(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid, _ := userID.(uint)
	isPremium := c.GetBool("isPremium")

	plans, err := h.service.GetLibrary(uid, isPremium)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch plans"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"plans": plans})
}

// GetMyPlans handles GET /api/plans/my
// Returns the authenticated user's active enrollments.
func (h *ReadingPlanHandler) GetMyPlans(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	enrollments, err := h.service.GetActiveEnrollments(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch enrollments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"enrollments": enrollments})
}

// GetSeasonalCurrent handles GET /api/plans/seasonal/current
// Returns the seasonal plan active today, or null.
func (h *ReadingPlanHandler) GetSeasonalCurrent(c *gin.Context) {
	plan, err := h.service.GetCurrentSeasonalPlan()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch seasonal plan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"plan": plan})
}

// GetPlan handles GET /api/plans/:slug
// Returns full plan detail. OptionalAuth for premium filtering.
func (h *ReadingPlanHandler) GetPlan(c *gin.Context) {
	slug := c.Param("slug")
	userID, _ := c.Get("userID")
	uid, _ := userID.(uint)
	isPremium := c.GetBool("isPremium")

	plan, err := h.service.GetPlan(slug, uid, isPremium)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPlanNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		case errors.Is(err, services.ErrPlanPremium):
			c.JSON(http.StatusForbidden, gin.H{"error": "plan_premium_required"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch plan"})
		}
		return
	}
	c.JSON(http.StatusOK, plan)
}

// GetTodayEntry handles GET /api/plans/:slug/today
// Returns the next unread entry for the authenticated user.
func (h *ReadingPlanHandler) GetTodayEntry(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("userID").(uint)

	entry, err := h.service.GetPlanForToday(userID, slug)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPlanNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		case errors.Is(err, services.ErrNotEnrolled):
			c.JSON(http.StatusForbidden, gin.H{"error": "not_enrolled"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch today's entry"})
		}
		return
	}
	c.JSON(http.StatusOK, entry)
}

// Enroll handles POST /api/plans/:slug/enroll
func (h *ReadingPlanHandler) Enroll(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	prog, err := h.service.EnrollUser(userID, slug, isPremium)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPlanNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		case errors.Is(err, services.ErrPlanPremium):
			c.JSON(http.StatusForbidden, gin.H{"error": "plan_premium_required"})
		case errors.Is(err, services.ErrAlreadyEnrolled):
			c.JSON(http.StatusConflict, gin.H{"error": "already_enrolled"})
		case errors.Is(err, services.ErrMaxPlansReached):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "max_plans_reached"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to enroll"})
		}
		return
	}
	c.JSON(http.StatusCreated, prog)
}

// Advance handles POST /api/plans/:slug/advance
// Marks the next day as read and credits Blessings.
func (h *ReadingPlanHandler) Advance(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("userID").(uint)

	prog, justCompleted, blessingsEarned, err := h.service.AdvanceDay(userID, slug)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrPlanNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		case errors.Is(err, services.ErrNotEnrolled):
			c.JSON(http.StatusForbidden, gin.H{"error": "not_enrolled"})
		case errors.Is(err, services.ErrPlanComplete):
			c.JSON(http.StatusConflict, gin.H{"error": "plan_already_complete"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to advance"})
		}
		return
	}

	resp := gin.H{
		"progress":         prog,
		"just_completed":   justCompleted,
		"blessings_earned": blessingsEarned,
		"plan_streak":      prog.PlanStreak,
	}
	if h.disciplineService != nil {
		isPremium := c.GetBool("isPremium")
		if dcCredits, dcErr := h.disciplineService.TryComplete(userID, "advance_plan_day", isPremium); dcErr != nil {
			log.Printf("discipline TryComplete advance_plan_day failed user %d: %v", userID, dcErr)
		} else if dcCredits > 0 {
			resp["discipline_completed"] = gin.H{"key": "advance_plan_day", "blessings_credited": dcCredits}
		}
	}
	c.JSON(http.StatusOK, resp)
}

// Unenroll handles DELETE /api/plans/:slug/unenroll
func (h *ReadingPlanHandler) Unenroll(c *gin.Context) {
	slug := c.Param("slug")
	userID := c.MustGet("userID").(uint)

	if err := h.service.Unenroll(userID, slug); err != nil {
		switch {
		case errors.Is(err, services.ErrPlanNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "plan not found"})
		case errors.Is(err, services.ErrNotEnrolled):
			c.JSON(http.StatusNotFound, gin.H{"error": "not_enrolled"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to unenroll"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "unenrolled"})
}
