package routes

import (
	"dailybible/internal/handlers"
	"dailybible/internal/middleware"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
)

// SetupRoutes initializes and organizes all API routes.
// Groups are organized by feature; middleware is applied at the group level.
func SetupRoutes(
	router *gin.Engine,
	authHandler *handlers.AuthHandler,
	tokenService *services.TokenService,
	verseHandler *handlers.VerseHandler,
	favoriteHandler *handlers.FavoriteHandler,
	historyHandler *handlers.HistoryHandler,
	commentService *services.CommentService,
	commentHandler *handlers.CommentHandler,
	profileHandler *handlers.ProfileHandler,
	oauthHandler *handlers.OAuthHandler,
	settingsHandler *handlers.SettingsHandler,
	streakHandler *handlers.StreakHandler,
	blessingsHandler *handlers.BlessingsHandler,
	milestonesHandler *handlers.MilestonesHandler,
	journalHandler *handlers.JournalHandler,
) {
	_ = commentService // passed for potential future use in middleware

	api := router.Group("/api")
	{
		// ── Auth ────────────────────────────────────────────────────────────────
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/me", middleware.AuthMiddleware(tokenService), authHandler.GetMe)
			auth.GET("/google/login", oauthHandler.GoogleLogin)
			auth.GET("/google/callback", oauthHandler.GoogleCallback)
			auth.POST("/google/link", middleware.AuthMiddleware(tokenService), oauthHandler.LinkGoogle)
			auth.POST("/google/unlink", middleware.AuthMiddleware(tokenService), oauthHandler.UnlinkGoogle)
		}

		// ── Verses (optional auth — tracks history for authenticated users) ────
		verses := api.Group("/verses")
		verses.Use(middleware.OptionalAuthMiddleware(tokenService))
		{
			verses.GET("/daily", verseHandler.GetDailyVerse)
			verses.GET("/search", verseHandler.SearchVerses)
			verses.GET("/:reference", verseHandler.GetVerseByReference)
		}

		// ── Protected routes ─────────────────────────────────────────────────
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(tokenService))
		{
			// Favorites
			favorites := protected.Group("/favorites")
			{
				favorites.GET("", favoriteHandler.GetFavorites)
				favorites.POST("", favoriteHandler.AddFavorite)
				favorites.DELETE("/:id", favoriteHandler.RemoveFavorite)
			}

			// History
			history := protected.Group("/history")
			{
				history.GET("", historyHandler.GetHistory)
				history.DELETE("", historyHandler.ClearHistory)
			}

			// Comments (reflections)
			comments := protected.Group("/comments")
			{
				comments.POST("", commentHandler.AddOrUpdateComment)
				comments.GET("/verse/:reference", commentHandler.GetCommentForVerse)
				comments.DELETE("/:id", commentHandler.DeleteComment)
				comments.GET("/user", commentHandler.GetUserComments)
			}

			// Profile
			profile := protected.Group("/profile")
			{
				profile.GET("", profileHandler.GetProfile)
				profile.PUT("", profileHandler.UpdateProfile)
				profile.GET("/stats", profileHandler.GetStats)
				profile.POST("/password/set", profileHandler.SetPassword)
				profile.PUT("/password", profileHandler.UpdatePassword)
			}

			// Settings
			settings := protected.Group("/settings")
			{
				settings.GET("", settingsHandler.GetSettings)
				settings.PUT("", settingsHandler.UpdateSettings)
				settings.GET("/language", settingsHandler.GetLanguage)
				settings.PUT("/language", settingsHandler.UpdateLanguage)
			}

			// Streak (Phase 1 & 2)
			streak := protected.Group("/streak")
			{
				streak.GET("", streakHandler.GetStreakSummary)
				streak.POST("/grace-day", streakHandler.UseGraceDay)
				streak.GET("/calendar", streakHandler.GetCalendar)
			}

			// Blessings (Phase 1)
			blessings := protected.Group("/blessings")
			{
				blessings.GET("", blessingsHandler.GetBalance)
				blessings.GET("/transactions", blessingsHandler.GetTransactions)
			}

			// Milestones (Phase 2)
			milestones := protected.Group("/milestones")
			{
				milestones.GET("", milestonesHandler.GetMilestones)
				milestones.POST("/:key/dismiss", milestonesHandler.DismissCelebration)
			}

			// Unlocks stub (Phase 6)
			protected.GET("/unlocks", func(c *gin.Context) {
				c.JSON(200, gin.H{"unlocks": []interface{}{}})
			})

			// Journal (Phase 3)
			// Note: /prompt must be registered before /:id to prevent Gin
			// from matching the literal "prompt" as an :id parameter.
			journal := protected.Group("/journal")
			{
				journal.GET("", journalHandler.GetEntries)
				journal.POST("", journalHandler.CreateEntry)
				journal.GET("/prompt", journalHandler.GetWeeklyPrompt)
				journal.GET("/:id", journalHandler.GetEntry)
				journal.PUT("/:id", journalHandler.UpdateEntry)
				journal.DELETE("/:id", journalHandler.DeleteEntry)
			}
		}
	}
}
