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
	communityHandler *handlers.CommunityHandler,
	// Phase 10
	mannaHandler *handlers.MannaHandler,
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

		// Phase 9: community board — optional auth (guests see limited feed)
		community := api.Group("/community")
		community.Use(middleware.OptionalAuthMiddleware(tokenService, subscriptionChecker))
		{
			community.GET("", communityHandler.GetFeed)
			community.GET("/walking-today", communityHandler.GetWalkingToday)
		}

		// Protected routes (require auth)
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware(tokenService, subscriptionChecker))
		{
			// verse share (blessings credit — requires auth)
			protected.POST("/verses/share", verseHandler.RecordShare)

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

			// Phase 9: community board (auth-required routes)
			protectedCommunity := protected.Group("/community")
			{
				protectedCommunity.POST("", communityHandler.CreatePost)
				protectedCommunity.DELETE("/:id", communityHandler.DeletePost)
				protectedCommunity.POST("/:id/react", communityHandler.AddReaction)
				protectedCommunity.DELETE("/:id/react", communityHandler.RemoveReaction)
				protectedCommunity.POST("/admin", communityHandler.CreateAdminPost)
			}

			// Phase 10: Manna puzzle (auth-required; premium gate inside handler)
			manna := protected.Group("/manna")
			{
				manna.GET("/today",   mannaHandler.GetToday)
				manna.POST("/guess",  mannaHandler.SubmitGuess)
				manna.POST("/hint",   mannaHandler.GetHint)
				manna.GET("/stats",   mannaHandler.GetStats)
				manna.GET("/history", mannaHandler.GetHistory)
			}

			// Phase 10: Manna archive (premium only; gate inside handler)
			mannaArchive := protected.Group("/manna/archive")
			{
				mannaArchive.GET("/:date", mannaHandler.GetArchive)
				mannaArchive.POST("/:date/guess", mannaHandler.SubmitArchiveGuess)
				mannaArchive.POST("/:date/hint", mannaHandler.GetArchiveHint)
			}

			// Phase 10 M-20: admin word management (auth-required; admin gate inside handler)
			adminManna := protected.Group("/admin/manna")
			{
				adminManna.POST("/words", mannaHandler.AddWord)
			}
		}
	}

	// Phase 10: yesterday's word — public, no auth
	api.GET("/manna/yesterday", mannaHandler.GetYesterday)
}
