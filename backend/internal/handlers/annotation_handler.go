package handlers

import (
	"dailybible/internal/services"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// AnnotationHandler handles all /api/annotations endpoints.
// All routes are auth-required. Write routes are premium-gated.
// GET /annotations/verse/:reference returns an empty array for non-premium
// users to avoid error states for the AnnotationIndicator check.
type AnnotationHandler struct {
	service             *services.AnnotationService
	subscriptionChecker services.SubscriptionChecker
}

// NewAnnotationHandler creates a new AnnotationHandler.
func NewAnnotationHandler(service *services.AnnotationService, subscriptionChecker services.SubscriptionChecker) *AnnotationHandler {
	return &AnnotationHandler{
		service:             service,
		subscriptionChecker: subscriptionChecker,
	}
}

// GetForVerse handles GET /api/annotations/verse/:reference
func (h *AnnotationHandler) GetForVerse(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")
	reference := c.Param("reference")

	if !isPremium {
		c.JSON(http.StatusOK, gin.H{"annotations": []interface{}{}})
		return
	}

	annotations, err := h.service.GetForVerse(userID, reference)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch annotations"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"annotations": annotations})
}

// GetAll handles GET /api/annotations — premium-gated.
func (h *AnnotationHandler) GetAll(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "annotations_premium_required"})
		return
	}

	annotations, err := h.service.GetAll(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch annotations"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"annotations": annotations})
}

// Create handles POST /api/annotations — premium-gated.
func (h *AnnotationHandler) Create(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "annotations_premium_required"})
		return
	}

	var body struct {
		VerseReference string `json:"verse_reference" binding:"required"`
		PhraseText     string `json:"phrase_text"`
		AnnotationText string `json:"annotation_text" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	annotation, err := h.service.Create(userID, body.VerseReference, body.PhraseText, body.AnnotationText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create annotation"})
		return
	}
	c.JSON(http.StatusCreated, annotation)
}

// Update handles PUT /api/annotations/:id — premium-gated.
func (h *AnnotationHandler) Update(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "annotations_premium_required"})
		return
	}

	annotationID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid annotation id"})
		return
	}

	var body struct {
		PhraseText     string `json:"phrase_text"`
		AnnotationText string `json:"annotation_text" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	annotation, err := h.service.Update(userID, uint(annotationID), body.PhraseText, body.AnnotationText)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrAnnotationNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "annotation not found"})
		case errors.Is(err, services.ErrAnnotationForbidden):
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update annotation"})
		}
		return
	}
	c.JSON(http.StatusOK, annotation)
}

// Delete handles DELETE /api/annotations/:id — premium-gated.
func (h *AnnotationHandler) Delete(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "annotations_premium_required"})
		return
	}

	annotationID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid annotation id"})
		return
	}

	if err := h.service.Delete(userID, uint(annotationID)); err != nil {
		switch {
		case errors.Is(err, services.ErrAnnotationNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": "annotation not found"})
		case errors.Is(err, services.ErrAnnotationForbidden):
			c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete annotation"})
		}
		return
	}
	c.Status(http.StatusNoContent)
}
