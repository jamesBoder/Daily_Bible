package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)



// Placeholder handlers - will implement later
func GetDailyVerse (c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Get daily verse endpoint - to be implemented"))

}

func GetVerseByReference (c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Get verse by reference endpoint - to be implemented"))
}

func SearchVerses (c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Search verses endpoint - to be implemented"))
}

