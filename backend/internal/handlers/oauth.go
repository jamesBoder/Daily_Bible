package handlers

import (
	"net/http"
	"crypto/rand"
	"dailybible/internal/models"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"

)

// OAuthHandler handles OAuth-related requests
type OAuthHandler struct {
	oauthService *services.OAuthService
}

// NewOAuthHandler creates a new instance of OAuthHandler
func NewOAuthHandler(oauthService *services.OAuthService) *OAuthHandler {
	return &OAuthHandler{
		oauthService: oauthService,
	}
}

// GoogleLogin - redirect to Google OAuth, generate state token. endpoint: /api/auth/google/login
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
	//  Generate a random state string using crypto/rand for security
	state := make([]byte, 16)
	_, err := rand.Read(state)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state token"})
		return
	}
	stateStr := fmt.Sprintf("%x", state)

	// Get Google OAuth URL
	url := h.oauthService.GetGoogleLoginURL(stateStr)

	// Redirect to Google OAuth consent page
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback - handle Google OAuth callback. endpoint: /api/auth/google/callback
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
	// Get state from query params  
	state := c.Query("state")

	// validate state here 
	_ = state // Placeholder for state validation

	// Get code from query params
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code not found in callback"})
		return
	}

	// Handle Google OAuth callback
	user, err := h.oauthService.HandleGoogleCallback(code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to handle Google callback: " + err.Error()})
		return
	}

	// generate JWT using token service
	token, err := h.oauthService.tokenService.GenerateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// return token and user info to frontend
	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user,
	})

}

// LinkGoogle - link Google account to existing user. endpoint: /api/auth/google/link requires authentication
func (h *OAuthHandler) LinkGoogle(c *gin.Context) {
	// Implementation for linking Google account to existing user
	c.JSON(http.StatusNotImplemented, gin.H{"message": "LinkGoogle not implemented yet"})
	
}

// UnlinkGoogle - unlink Google account from existing user. endpoint: /api/auth/google/unlink requires authentication
func (h *OAuthHandler) UnlinkGoogle(c *gin.Context) {
	// removes google ID from user  
	c.JSON(http.StatusNotImplemented, gin.H{"message": "UnlinkGoogle not implemented yet"})
}