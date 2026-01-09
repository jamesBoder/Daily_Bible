package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

	
// Placeholder handlers - will implement later
func GetFavorites(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Get favorites endpoint - to be implemented"))
}

func AddFavorite(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Add favorite endpoint - to be implemented"))
}

func RemoveFavorite(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Remove favorite endpoint - to be implemented"))
}
