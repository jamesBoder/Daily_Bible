package middleware

import (
	"fmt"
	"log"

	sentry "github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-gonic/gin"
)

// ErrorHandler catches panics, captures them in Sentry (when available), and
// returns a generic 500. Wire sentrygin middleware before this one so the hub
// is available on the context.
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("Panic recovered: %v", r)

				// Report to Sentry via the per-request hub when available,
				// otherwise fall back to the global hub.
				err := fmt.Errorf("%v", r)
				if hub := sentrygin.GetHubFromContext(c); hub != nil {
					hub.CaptureException(err)
				} else {
					sentry.CaptureException(err)
				}

				c.JSON(500, gin.H{"error": "Internal Server Error"})
				c.Abort()
			}
		}()

		c.Next()

		// Report any errors attached to the context during request processing.
		if len(c.Errors) > 0 {
			hub := sentrygin.GetHubFromContext(c)
			for _, e := range c.Errors {
				log.Printf("Error: %v", e.Err)
				if hub != nil {
					hub.CaptureException(e.Err)
				} else {
					sentry.CaptureException(e.Err)
				}
			}
			c.JSON(500, gin.H{"error": "Internal Server Error"})
			c.Abort()
		}
	}
}
