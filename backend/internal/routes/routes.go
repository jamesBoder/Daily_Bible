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
	translationsHandler *handlers.TranslationsHandler,
	unlocksHandler *handlers.UnlocksHandler,
	subscriptionHandler *handlers.SubscriptionHandler,
	subscriptionChecker services.SubscriptionChecker,
	// Phase 9
	friendHandler      *handlers.FriendHandler,
	leaderboardHandler *handlers.LeaderboardHandler,
) {
	api := router.Group("/api")
	{
		// auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/logout", authHandler.Logout)
			// /me endpoint requires authentication
			auth.GET("/me", middleware.AuthMiddleware(tokenService, subscriptionChecker), authHandler.GetMe)
			// Email verification & password reset (public)
			auth.POST("/verify-email", authHandler.VerifyEmail)
			auth.POST("/resend-verification", authHandler.ResendVerification)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
			auth.POST("/reset-password", authHandler.ResetPassword)
			// Google OAuth routes
			auth.GET("/google/login", oauthHandler.GoogleLogin)
			auth.GET("/google/callback", oauthHandler.GoogleCallback)
			auth.POST("/google/link", middleware.AuthMiddleware(tokenService, subscriptionChecker), oauthHandler.LinkGoogle)
			auth.POST("/google/unlink", middleware.AuthMiddleware(tokenService, subscriptionChecker), oauthHandler.UnlinkGoogle)
		}

		// Phase 8: Stripe webhook — public (no auth), must be before any body-parsing middleware
		api.POST("/webhooks/stripe", subscriptionHandler.HandleStripeWebhook)

		// translations route (Phase 4) — public with optional auth
		translationsGroup := api.Group("/translations")
		translationsGroup.Use(middleware.OptionalAuthMiddleware(tokenService, subscriptionChecker))
		{
			translationsGroup.GET("", translationsHandler.GetTranslations)
		}

		// verses routes - use optional auth to track history for authenticated users
		verses := api.Group("/verses")
		verses.Use(middleware.OptionalAuthMiddleware(tokenService, subscriptionChecker))
		{
			verses.GET("/daily", verseHandler.GetDailyVerse)
			verses.GET("/:reference", verseHandler.GetVerseByReference)
			verses.GET("/search", verseHandler.SearchVerses)
		}

		// Protected routes (require auth)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(tokenService, subscriptionChecker))
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
				profile.GET("/aggregate", profileHandler.GetProfileAggregate)
				profile.PUT("", profileHandler.UpdateProfile)
				profile.GET("/stats", profileHandler.GetStats)
				profile.GET("/check-availability", profileHandler.CheckAvailability)
				profile.POST("/password/set", profileHandler.SetPassword)
				profile.PUT("/password", profileHandler.UpdatePassword)
				profile.POST("/resend-verification", profileHandler.ResendVerificationFromProfile)
			}

			// settings routes
			settings := protected.Group("/settings")
			{
				settings.GET("", settingsHandler.GetSettings)
				settings.PUT("", settingsHandler.UpdateSettings)
				settings.GET("/language", settingsHandler.GetLanguage)
				settings.PUT("/language", settingsHandler.UpdateLanguage)
			}

			// streak routes
			streak := protected.Group("/streak")
			{
				streak.GET("", streakHandler.GetStreakSummary)
				streak.POST("/grace-day", streakHandler.UseGraceDay)
				streak.GET("/calendar", streakHandler.GetCalendar)
			}

			// milestones routes
			milestones := protected.Group("/milestones")
			{
				milestones.GET("", milestonesHandler.GetMilestones)
				milestones.POST("/:key/dismiss", milestonesHandler.DismissCelebration)
			}

			// unlocks routes (Phase 6)
			protected.GET("/unlocks", unlocksHandler.GetUnlocks)
			protected.POST("/blessings/spend", unlocksHandler.SpendBlessings)

			// blessings routes
			blessings := protected.Group("/blessings")
			{
				blessings.GET("", blessingsHandler.GetBalance)
				blessings.GET("/transactions", blessingsHandler.GetTransactions)
			}

			// journal routes (Phase 3)
			journal := protected.Group("/journal")
			{
				journal.GET("", journalHandler.GetEntries)
				journal.POST("", journalHandler.CreateEntry)
				journal.GET("/prompt", journalHandler.GetWeeklyPrompt) // must be before /:id
				journal.GET("/:id", journalHandler.GetEntry)
				journal.PUT("/:id", journalHandler.UpdateEntry)
				journal.DELETE("/:id", journalHandler.DeleteEntry)
			}

			// Phase 8: subscription routes
			sub := protected.Group("/subscription")
			{
				sub.GET("/status", subscriptionHandler.GetStatus)
				sub.POST("/checkout", subscriptionHandler.CreateCheckout)
				sub.POST("/portal", subscriptionHandler.CreatePortalSession)
			}

			// Phase 9: friends routes
			friends := protected.Group("/friends")
			{
				friends.GET("", friendHandler.GetFriends)
				friends.GET("/requests", friendHandler.GetPendingRequests)
				friends.POST("/request", friendHandler.SendRequest)
				friends.PUT("/request/:id", friendHandler.AcceptRequest)
				friends.DELETE("/request/:id", friendHandler.RejectRequest)
				friends.DELETE("/:id", friendHandler.RemoveFriend)
			}

			// Phase 9: leaderboard (auth-required routes)
			leaderboard := protected.Group("/leaderboard")
			{
				leaderboard.GET("/friends", leaderboardHandler.GetFriendsBoard)
				leaderboard.PUT("/visibility", leaderboardHandler.SetVisibility)
			}
		}

		// Phase 9: community board on optional-auth router (guests can view)
		optionalAuth := api.Group("/leaderboard")
		optionalAuth.Use(middleware.OptionalAuthMiddleware(tokenService, subscriptionChecker))
		{
			optionalAuth.GET("/community", leaderboardHandler.GetCommunityBoard)
		}
	}
}
