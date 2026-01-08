package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)


// Placeholder handlers - will implement later
func GetHistory(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Get history endpoint - to be implemented"))
}

func ClearHistory(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Clear history endpoint - to be implemented"))
}
