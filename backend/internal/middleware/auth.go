package middleware

import (
	"net/http"
	"strings"

	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
	
)

func AuthMiddleware(tokenService *services.TokenService) gin.HandlerFunc {
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

		c.Next()
	}
}