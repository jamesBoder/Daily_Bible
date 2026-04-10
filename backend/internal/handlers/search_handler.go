package handlers

import (
	"dailybible/internal/services"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SearchHandler handles premium search endpoints under /api/search/.
type SearchHandler struct {
	service             *services.SearchService
	subscriptionChecker services.SubscriptionChecker
}

// NewSearchHandler creates a new SearchHandler.
func NewSearchHandler(service *services.SearchService, subscriptionChecker services.SubscriptionChecker) *SearchHandler {
	return &SearchHandler{
		service:             service,
		subscriptionChecker: subscriptionChecker,
	}
}

// SearchReflections handles GET /api/search/reflections?q=<query> — premium-gated.
func (h *SearchHandler) SearchReflections(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "search_premium_required"})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q is required"})
		return
	}

	results, err := h.service.SearchReflections(userID, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

// SearchJournal handles GET /api/search/journal?q=<query> — premium-gated.
func (h *SearchHandler) SearchJournal(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "search_premium_required"})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "q is required"})
		return
	}

	results, err := h.service.SearchJournal(userID, query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"results": results})
}

// GetSavedSearches handles GET /api/search/saved — premium-gated.
func (h *SearchHandler) GetSavedSearches(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "search_premium_required"})
		return
	}

	searches, err := h.service.GetSavedSearches(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch saved searches"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"saved_searches": searches})
}

// SaveSearch handles POST /api/search/saved — premium-gated.
func (h *SearchHandler) SaveSearch(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "search_premium_required"})
		return
	}

	var body struct {
		Query string `json:"query" binding:"required"`
		Name  string `json:"name"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.SaveSearch(userID, body.Query, body.Name)
	if err != nil {
		if errors.Is(err, services.ErrMaxSavedSearches) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "max_saved_searches_reached"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save search"})
		return
	}
	c.JSON(http.StatusCreated, result)
}

// DeleteSavedSearch handles DELETE /api/search/saved/:id — premium-gated.
func (h *SearchHandler) DeleteSavedSearch(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	isPremium := c.GetBool("isPremium")

	if !isPremium {
		c.JSON(http.StatusForbidden, gin.H{"error": "search_premium_required"})
		return
	}

	searchID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid search id"})
		return
	}

	if err := h.service.DeleteSavedSearch(userID, uint(searchID)); err != nil {
		if errors.Is(err, services.ErrSavedSearchNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "saved search not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete saved search"})
		return
	}
	c.Status(http.StatusNoContent)
}
