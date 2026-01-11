package routes

import (
	"github.com/gin-gonic/gin"
	"dailybible/internal/handlers"
	"dailybible/internal/middleware"
)



// SetupRoutes - Initialize and organize API routes
// Group related routes together
// Apply middleware to groups
// Keep main.go clean
// Make routes easy to find

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler)  {
	// Example route group for user-related endpoints
	api := router.Group("/api")
	{
		// auth routes
		auth := api.Group("/auth")
		{
			 auth.POST("/register", authHandler.Register)
			 auth.POST("/login", authHandler.Login)
			 auth.POST("/logout", handlers.Logout)
			 auth.GET("/me", handlers.GetMe)
		}

		// verses routes
		verses := api.Group("/verses")
		{
			 verses.GET("/daily", handlers.GetDailyVerse)
			 verses.GET("/:reference", handlers.GetVerseByReference)
			 verses.GET("/search", handlers.SearchVerses)
		}

		// Protected routes (require auth)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// favorites routes
			favorites := protected.Group("/favorites")
			{
				favorites.GET("/", handlers.GetFavorites)
				favorites.POST("/", handlers.AddFavorite)
				favorites.DELETE("/:id", handlers.RemoveFavorite)
			}

			// history routes
			history := protected.Group("/history")
			{
				history.GET("/", handlers.GetHistory)
				history.DELETE("/:id", handlers.ClearHistory)
			}
		}		
	}
}