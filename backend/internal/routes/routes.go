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

func SetupRoutes(router *gin.Engine, authHandler *handlers.AuthHandler , tokenService *services.TokenService, verseHandler *handlers.VerseHandler, favoriteHandler *handlers.FavoriteHandler, historyHandler *handlers.HistoryHandler, commentService *services.CommentService, commentHandler *handlers.CommentHandler, profileHandler *handlers.ProfileHandler, oauthHandler *handlers.OAuthHandler) {
	// Example route group for user-related endpoints
	api := router.Group("/api")
	{
		// auth routes
		auth := api.Group("/auth")
		{
			 auth.POST("/register", authHandler.Register)
			 auth.POST("/login", authHandler.Login)
			 auth.POST("/logout", authHandler.Logout)
			 // /me endpoint requires authentication
			 auth.GET("/me", middleware.AuthMiddleware(tokenService), authHandler.GetMe)
			 // Google OAuth routes
			 auth.GET("/google/login", oauthHandler.GoogleLogin)
			 auth.GET("/google/callback", oauthHandler.GoogleCallback)
			 auth.POST("/google/link", middleware.AuthMiddleware(tokenService), oauthHandler.LinkGoogle)
			 auth.POST("/google/unlink", middleware.AuthMiddleware(tokenService), oauthHandler.UnlinkGoogle)
		}

		// verses routes - use optional auth to track history for authenticated users
		verses := api.Group("/verses")
		verses.Use(middleware.OptionalAuthMiddleware(tokenService))
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
				favorites.GET("", favoriteHandler.GetFavorites)
				favorites.POST("", favoriteHandler.AddFavorite)
				favorites.DELETE("/:id", favoriteHandler.RemoveFavorite)
			}

			// history routes
			history := protected.Group("/history")
			{
				history.GET("", historyHandler.GetHistory)
				history.DELETE("", historyHandler.ClearHistory)
			}

			// comments routes
			comments := protected.Group("/comments")
			{
				comments.POST("", commentHandler.AddOrUpdateComment)
				comments.GET("/verse/:reference", commentHandler.GetCommentForVerse)
				comments.DELETE("/:id", commentHandler.DeleteComment)
				comments.GET("/user", commentHandler.GetUserComments)
			}

			// profile routes
			profile := protected.Group("/profile")
			{
				profile.GET("", profileHandler.GetProfile)
				profile.PUT("", profileHandler.UpdateProfile)
				profile.GET("/stats", profileHandler.GetStats)
				profile.PUT("/password", profileHandler.UpdatePassword)
			}
		}	
			
	}
}
