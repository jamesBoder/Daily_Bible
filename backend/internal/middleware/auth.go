package middleware

import (
	"net/http"
	"strings"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates the Bearer token and sets userID + isPremium in the Gin context.
// isPremium is cached once per request to avoid repeated DB hits when multiple handlers
// (blessings, streak, unlocks) would otherwise each call IsPremium independently.
func AuthMiddleware(tokenService *services.TokenService, checker services.SubscriptionChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Trim spaces and strip "Bearer " prefix
		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == authHeader {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			return
		}

		// Trim any remaining spaces from the token
		token = strings.TrimSpace(token)

		// validate token using TokenService
		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		// store user ID in Gin context
		c.Set("userID", claims.UserID)

		// Cache isPremium once per request so handlers can read c.GetBool("isPremium")
		// instead of each making a separate DB query.
		if checker != nil {
			c.Set("isPremium", checker.IsPremium(claims.UserID))
		}

		c.Next()
	}
}

// OptionalAuthMiddleware validates authentication if token is present, but doesn't require it.
// This allows endpoints to work for both authenticated and anonymous users.
// If authenticated, userID and isPremium will be set in context (same as AuthMiddleware).
func OptionalAuthMiddleware(tokenService *services.TokenService, checker ...services.SubscriptionChecker) gin.HandlerFunc {
	var sc services.SubscriptionChecker
	if len(checker) > 0 {
		sc = checker[0]
	}
	return func(c *gin.Context) {
		// Extract token from Authorization header
		authHeader := c.GetHeader("Authorization")

		// If no auth header, continue without authentication
		if authHeader == "" {
			c.Next()
			return
		}

		// Trim spaces and strip "Bearer " prefix
		authHeader = strings.TrimSpace(authHeader)
		token := strings.TrimPrefix(authHeader, "Bearer ")

		// If token format is invalid, continue without authentication
		if token == authHeader || token == "" {
			c.Next()
			return
		}

		// Trim any remaining spaces from the token
		token = strings.TrimSpace(token)

		// Validate token using TokenService
		claims, err := tokenService.ValidateToken(token)
		if err != nil {
			// If token is invalid, continue without authentication
			// Don't abort the request - just don't set userID
			c.Next()
			return
		}

		// Store user ID in Gin context for authenticated requests
		c.Set("userID", claims.UserID)

		// Cache isPremium so handlers on optional-auth routes (e.g. daily verse)
		// can apply the 1.5× blessings multiplier for premium users.
		if sc != nil {
			c.Set("isPremium", sc.IsPremium(claims.UserID))
		}

		c.Next()
	}
}
