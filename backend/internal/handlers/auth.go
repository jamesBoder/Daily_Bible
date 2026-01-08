package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"

)

// Placeholder handlers - will implement later
func Register(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Register endpoint - to be implemented"))
}

func Login(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Login endpoint - to be implemented"))
}

func Logout(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Logout endpoint - to be implemented"))
}

func GetMe(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("GetMe endpoint - to be implemented"))
}
