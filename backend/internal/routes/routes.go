package routes

import (
	"github.com/gin-gonic/gin"
	"dailybible/internal/handlers"
	"dailybible/internal/middleware"
	"dailybible/internal/services"
	
)



// SetupRoutes - Initialize and organize API routes
// Group related routes together
// Apply middleware to groups
// Keep main.go clean
// Make routes easy to find

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler , tokenService *services.TokenService, verseHandler *handlers.VerseHandler, favoriteHandler *handlers.FavoriteHandler, historyHandler *handlers.HistoryHandler) {
	// Example route group for user-related endpoints
	api := router.Group("/api")
	{
		// auth routes
		auth := api.Group("/auth")
		{
			 auth.POST("/register", authHandler.Register)
			 auth.POST("/login", authHandler.Login)
			 auth.POST("/logout", handlers.Logout)
			 // /me endpoint requires authentication
			 auth.GET("/me", middleware.AuthMiddleware(tokenService), authHandler.GetMe)
		}

		// verses routes
		verses := api.Group("/verses")
		{
			 verses.GET("/daily", verseHandler.GetDailyVerse)
			 verses.GET("/:reference", verseHandler.GetVerseByReference)
			 verses.GET("/search", verseHandler.SearchVerses)
		}

		// Protected routes (require auth)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(tokenService))
		{
			// favorites routes
			favorites := protected.Group("/favorites")
			{
				favorites.GET("/", favoriteHandler.GetFavorites)
				favorites.POST("/", favoriteHandler.AddFavorite)
				favorites.DELETE("/:id", favoriteHandler.RemoveFavorite)
			}

			// history routes
			history := protected.Group("/history")
			{
				history.GET("/", historyHandler.GetHistory)
				history.DELETE("/", historyHandler.ClearHistory)
			}
		}		
	}
}