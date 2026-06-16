package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"time"

	"context"

	"dailybible/internal/config"
	"dailybible/internal/database"
	"dailybible/internal/handlers"
	"dailybible/internal/middleware"
	"dailybible/internal/repository"
	"dailybible/internal/routes"
	"dailybible/internal/services"

	sentry "github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	stripe "github.com/stripe/stripe-go/v80"
)

// healthHandler is a simple health check endpoint
func healthHandler(c *gin.Context) {
	c.JSON(200, gin.H{
		"status":    "ok",
		"database":  "connected",
		"timestamp": time.Now().UTC(),
	})
}

// errorHandler is a test endpoint to trigger an error
func errorHandler(c *gin.Context) {
	panic("Test panic for error handling middleware")
}

func main() {
	// Top-level context used to signal background goroutines (scheduler) to stop.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 1. Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// 1b. Initialize Sentry (no-op when DSN is empty)
	if cfg.SentryDSN != "" {
		if err := sentry.Init(sentry.ClientOptions{
			Dsn:              cfg.SentryDSN,
			EnableTracing:    true,
			TracesSampleRate: 0.2,
		}); err != nil {
			log.Printf("Sentry init failed: %v", err)
		} else {
			defer sentry.Flush(2 * time.Second)
			log.Println("Sentry initialized")
		}
	}

	// 2. Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 3. Run migrations
	if err := database.RunMigrations(db); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// 3a. Backfill daily_date for pre-migration verses (idempotent — rows with a
	// non-NULL daily_date are untouched). Derives the date from the earliest
	// history view using the same UTC-10 offset the backend uses to assign dates.
	if n, err := database.BackfillDailyDates(db); err != nil {
		log.Printf("Warning: daily_date backfill failed: %v", err)
	} else {
		log.Printf("Backfill: %d verse(s) had daily_date populated from history", n)
	}

	// 3b. Grandfather pre-existing users as verified (runs on every start, idempotent).
	// The WHERE clause `verification_token IS NULL` ensures only users created before the
	// email verification feature was added are grandfathered. New unverified users who have
	// a pending verification token are intentionally excluded.
	if result := db.Exec(`UPDATE users SET email_verified = true WHERE email_verified = false AND verification_token IS NULL AND deleted_at IS NULL`); result.Error != nil {
		log.Printf("Warning: grandfathering SQL failed: %v", result.Error)
	} else {
		log.Printf("Grandfathering: %d pre-existing users marked as email_verified", result.RowsAffected)
	}

	// 3c. Phase 8: Validate and configure Stripe at startup.
	// Server refuses to start if either key is missing — a missing webhook secret
	// would silently accept unsigned webhooks (security hole), not just a crash.
	stripeKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeKey == "" {
		log.Fatal("STRIPE_SECRET_KEY is required")
	}
	if os.Getenv("STRIPE_WEBHOOK_SECRET") == "" {
		log.Fatal("STRIPE_WEBHOOK_SECRET is required")
	}
	stripe.Key = stripeKey

	// 4. Initialize repositories
	userRepo := repository.NewUserRepository(db)
	verseRepo := repository.NewVerseRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	historyRepo := repository.NewHistoryRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	passwordHistoryRepo := repository.NewPasswordHistoryRepository(db)
	googleOAuthConfig := config.GoogleOAuthConfig()

	// 5. Initialize services
	authService := services.NewAuthService(userRepo)
	tokenService := services.NewTokenService(cfg)
	emailValidationService := services.NewEmailValidationService()

	// Log resolved email config before creating the service so any misconfiguration
	// (wrong FROM_EMAIL, missing RESEND_API_KEY) is immediately visible in logs.
	log.Printf("Email config: FROM_EMAIL=%q  FRONTEND_URL=%q  RESEND_API_KEY_SET=%v",
		cfg.FromEmail, cfg.FrontendURL, cfg.ResendAPIKey != "")
	emailService := services.NewEmailService(cfg.ResendAPIKey, cfg.FromEmail, cfg.FrontendURL)
	oauthService := services.NewOAuthService(userRepo, tokenService, googleOAuthConfig, emailService)
	verseService := services.NewVerseService(verseRepo)
	favoriteService := services.NewFavoriteService(favoriteRepo, verseRepo)
	bibleAPIService := services.NewBibleAPIService(
		cfg.BibleAPIKey,
		cfg.BibleAPIBaseURL,
		cfg.BibleVersionID,
	)
	dailyVerseService := services.NewDailyVerseService(
		bibleAPIService,
		verseRepo,
	)
	historyService := services.NewHistoryService(historyRepo)

	commentService := services.NewCommentService(commentRepo)
	settingsService := services.NewSettingsService(db)

	// Initialize Phase 1 services
	// Phase 8: real Stripe-backed checker, wrapped with a 5-minute in-memory cache.
	// The cache eliminates a DB round-trip on every premium-gated request.
	// The Stripe webhook handler calls cachedChecker.Invalidate(userID) on status
	// changes so cancels and upgrades take effect within seconds, not 5 minutes.
	stripeChecker := services.NewStripeSubscriptionChecker(db)
	cachedChecker := services.NewCachedSubscriptionChecker(stripeChecker, 0) // 0 = default 5 min TTL
	subscriptionChecker := services.SubscriptionChecker(cachedChecker)
	streakService := services.NewStreakService(db, subscriptionChecker)
	blessingsService := services.NewBlessingsService(db)

	// Initialize Phase 2 services
	rewardsService := services.NewRewardsService(db, blessingsService)

	// Initialize Phase 3 services
	journalService := services.NewJournalService(db, blessingsService)

	// Initialize Phase 6 services
	unlockService := services.NewUnlockService(db, blessingsService)

	// Initialize Phase 8 services
	subscriptionService := services.NewSubscriptionService(db, rewardsService, streakService)

	// Phase 9: parse ADMIN_USER_IDS env var (same pattern as DEV_PREMIUM_USER_IDS).
	adminIDs := map[uint]bool{}
	if raw := os.Getenv("ADMIN_USER_IDS"); raw != "" {
		for _, part := range strings.Split(raw, ",") {
			if id, err := strconv.ParseUint(strings.TrimSpace(part), 10, 64); err == nil {
				adminIDs[uint(id)] = true
			}
		}
	}

	// Initialize Phase 9 services
	communityService := services.NewCommunityService(db, subscriptionChecker)

	// Initialize Phase 10 services
	mannaService := services.NewMannaService(db, blessingsService)

	// Push notification service — no-op when VAPID keys aren't configured
	pushService := services.NewPushService(
		db,
		cfg.VAPIDPublicKey,
		cfg.VAPIDPrivateKey,
		cfg.VAPIDSubscriber,
	)
	if pushService.IsEnabled() {
		log.Println("Push notifications: VAPID configured, daily reminders enabled")
	} else {
		log.Println("Push notifications: VAPID keys not set — push disabled (set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY to enable)")
	}

	// Email reminder scheduler
	reminderScheduler := services.NewReminderScheduler(
		db, emailService, dailyVerseService, tokenService, cfg,
	)
	if cfg.ReminderEnabled {
		go reminderScheduler.RunHourly(ctx)
		log.Printf("ReminderScheduler: started (send_hour=%d, batch=%d)",
			cfg.ReminderSendHour, cfg.ReminderBatchSize)
	}

	// Streak-break reminder scheduler
	streakReminderScheduler := services.NewStreakReminderScheduler(
		db, emailService, tokenService, cfg,
	)
	if cfg.StreakReminderEnabled {
		go streakReminderScheduler.RunHourly(ctx)
		log.Printf("StreakReminderScheduler: started (send_hour=%d local)", cfg.StreakReminderHour)
	}

	// Landing-page subscriber daily verse scheduler
	subscriberReminderScheduler := services.NewSubscriberReminderScheduler(
		db, emailService, dailyVerseService, cfg,
	)
	if cfg.SubscriberReminderEnabled {
		go subscriberReminderScheduler.RunHourly(ctx)
		log.Printf("SubscriberReminderScheduler: started (send_hour=%d UTC)", cfg.ReminderSendHour)
	}

	// create validator instance
	validate := validator.New()
	_ = validate // currently not used, but can be integrated into services or handlers later

	// 6. Initialize handlers
	_ = authService // Use services to avoid "declared and not used" errors
	_ = verseService
	_ = favoriteService
	_ = tokenService
	_ = bibleAPIService
	_ = dailyVerseService
	_ = historyService
	_ = commentService
	_ = emailService

	// init authHandler variable
	authHandler := handlers.NewAuthHandler(
		userRepo,
		tokenService,
		emailValidationService,
		emailService,
		passwordHistoryRepo,
	)

	// init verseHandler variable
	verseHandler := handlers.NewVerseHandler(
		dailyVerseService,
		bibleAPIService,
		historyService,
		streakService,
		blessingsService,
		settingsService,
		rewardsService,
		subscriptionChecker,
	)

	// init favoriteHandler variable
	favoriteHandler := handlers.NewFavoriteHandler(
		favoriteService,
		bibleAPIService,
		blessingsService,
	)

	// init historyHandler variable
	historyHandler := handlers.NewHistoryHandler(
		historyService,
		bibleAPIService,
	)

	// init commentHandler variable
	commentHandler := handlers.NewCommentHandler(
		commentService,
		blessingsService,
		subscriptionChecker,
	)

	// init profileHandler variable
	profileHandler := handlers.NewProfileHandler(
		userRepo,
		favoriteRepo,
		historyRepo,
		commentRepo,
		passwordHistoryRepo,
		emailService,
		emailValidationService,
		validate,
		streakService,
		blessingsService,
		settingsService,
		db,
	)

	// init oauthHandler variable
	oauthHandler := handlers.NewOAuthHandler(
		oauthService,
	)

	// init settingsHandler variable
	settingsHandler := handlers.NewSettingsHandler(
		settingsService,
		tokenService,
	)

	// init streakHandler variable
	streakHandler := handlers.NewStreakHandler(
		streakService,
		blessingsService,
		settingsService,
		db,
	)

	// init milestonesHandler variable
	milestonesHandler := handlers.NewMilestonesHandler(db)

	// init blessingsHandler variable
	blessingsHandler := handlers.NewBlessingsHandler(
		blessingsService,
	)

	// init journalHandler variable
	journalHandler := handlers.NewJournalHandler(
		journalService,
		subscriptionChecker,
	)

	// init translationsHandler variable (Phase 4)
	translationsHandler := handlers.NewTranslationsHandler(
		settingsService,
		subscriptionChecker,
	)

	// init unlocksHandler variable (Phase 6)
	unlocksHandler := handlers.NewUnlocksHandler(
		unlockService,
		blessingsService,
	)

	// Phase 8: wire subscriptionService into journalHandler for HasOneTimePurchase("journal_unlock").
	journalHandler.SetSubscriptionService(subscriptionService)
	// Phase 8: wire subscriptionService into translationsHandler for HasOneTimePurchase("modern_translations").
	translationsHandler.SetSubscriptionService(subscriptionService)
	// Phase 8: wire subscriptionService into commentHandler for HasOneTimePurchase("reflection_archive").
	commentHandler.SetSubscriptionService(subscriptionService)

	// init subscriptionHandler variable (Phase 8)
	subscriptionHandler := handlers.NewSubscriptionHandler(
		subscriptionService,
		subscriptionChecker,
		cachedChecker,
		userRepo,
	)

	// Phase 9 handlers
	communityHandler := handlers.NewCommunityHandler(communityService, subscriptionChecker, adminIDs)
	// Wire community service into verseHandler for milestone auto-posts.
	verseHandler.SetCommunityService(communityService)

	// Phase 10 handlers
	mannaHandler := handlers.NewMannaHandler(mannaService, subscriptionChecker, streakService, settingsService, adminIDs)

	// Push handler
	pushHandler := handlers.NewPushHandler(pushService)

	// Phase 12 services
	readingPlanService := services.NewReadingPlanService(db, verseRepo, subscriptionChecker, blessingsService)
	annotationService := services.NewAnnotationService(db)
	searchService := services.NewSearchService(db)

	// Phase 12 handlers
	readingPlanHandler := handlers.NewReadingPlanHandler(readingPlanService, subscriptionChecker)
	annotationHandler := handlers.NewAnnotationHandler(annotationService, subscriptionChecker)
	searchHandler := handlers.NewSearchHandler(searchService, subscriptionChecker)
	prayerHandler := handlers.NewPrayerHandler(db, blessingsService, subscriptionChecker)

	// Daily Disciplines
	disciplineService := services.NewDisciplineService(db, blessingsService)
	disciplineHandler := handlers.NewDisciplineHandler(disciplineService)
	verseHandler.SetDisciplineService(disciplineService)
	favoriteHandler.SetDisciplineService(disciplineService)
	journalHandler.SetDisciplineService(disciplineService)
	commentHandler.SetDisciplineService(disciplineService)
	mannaHandler.SetDisciplineService(disciplineService)
	annotationHandler.SetDisciplineService(disciplineService)
	readingPlanHandler.SetDisciplineService(disciplineService)

	// Email capture handler — public landing page opt-in
	subscriberHandler := handlers.NewSubscriberHandler(db, emailService, cfg.FrontendURL)

	// Phase 10: seed word bank on every start — idempotent (ON CONFLICT DO NOTHING).
	// Running unconditionally means new words added to the SQL file are picked up
	// on the next deploy without manual intervention.
	if err := database.SeedMannaWords(db); err != nil {
		log.Printf("WARNING: Manna seed failed: %v", err)
	}
	if wordCount := mannaService.SeedWordCount(); wordCount == 0 {
		log.Printf("CRITICAL: Manna word bank is empty after seeding — /manna will return 500 until this is resolved")
	} else {
		log.Printf("Manna word bank: %d words loaded", wordCount)
	}
	if err := database.SeedCommunityPosts(db); err != nil {
		log.Printf("WARNING: Community posts seed failed: %v", err)
	}
	if err := database.CleanCommunityPosts(db); err != nil {
		log.Printf("WARNING: Community cleanup failed: %v", err)
	}
	if err := database.SeedReadingPlans(db); err != nil {
		log.Printf("WARNING: Reading plans seed failed: %v", err)
	}

	// 7. Setup router and start server
	log.Println("Database connected and migrations completed successfully!")
	log.Println("Backend is ready. Setting up routes...")

	// init gin router
	router := gin.New()

	// Resolve the client IP from X-Real-IP, not X-Forwarded-For. Our nginx sets
	// `X-Real-IP $remote_addr` (a single value it OVERWRITES on every request),
	// whereas it builds X-Forwarded-For with `$proxy_add_x_forwarded_for`, which
	// APPENDS the real IP after any client-supplied value. gin returns the
	// left-most X-Forwarded-For entry once the peer is trusted, so a client can
	// pin a spoofed IP there and dodge the rate limiter. X-Real-IP has no such
	// hole because the client cannot influence it past nginx. Combined with the
	// trusted-proxy config below this makes c.ClientIP() (used by the auth rate
	// limiter and access logger) spoof-resistant for traffic arriving via nginx.
	router.RemoteIPHeaders = []string{"X-Real-IP"}

	// Trusted proxy configuration — controls how c.ClientIP() resolves the real
	// client IP, which the auth rate limiter and access logger depend on. gin
	// trusts ALL proxies by default and returns the left-most X-Forwarded-For
	// value, which a client can spoof to dodge the rate limiter.
	//
	// Set TRUSTED_PROXIES (comma-separated CIDRs/IPs) to the proxy layer in
	// front of this service so gin walks past it to the true client:
	//   - Local Docker: the nginx container subnet, e.g. "172.16.0.0/12"
	//   - Fly.io: front the backend over the private network (.internal /
	//     .flycast) and trust "fdaa::/16", or trust the Fly edge ranges.
	//
	// SAFETY: if TRUSTED_PROXIES is unset we keep gin's permissive default and
	// log a warning, rather than guessing a CIDR. A wrong restrictive value
	// would collapse every real client onto a single proxy IP — one shared
	// bucket — and rate-limit the entire user base at once.
	if tp := os.Getenv("TRUSTED_PROXIES"); tp != "" {
		var proxies []string
		for _, p := range strings.Split(tp, ",") {
			if p = strings.TrimSpace(p); p != "" {
				proxies = append(proxies, p)
			}
		}
		if err := router.SetTrustedProxies(proxies); err != nil {
			log.Printf("WARNING: invalid TRUSTED_PROXIES %q: %v — keeping gin default (client IP is spoofable)", tp, err)
		} else {
			log.Printf("Trusted proxies set to %v — client IP resolved from X-Forwarded-For behind these", proxies)
		}
	} else {
		log.Println("WARNING: TRUSTED_PROXIES not set — client IP is taken from a spoofable X-Forwarded-For header; auth rate limiting is best-effort. Set TRUSTED_PROXIES to the proxy CIDR to harden.")
	}

	// Sentry must be the first middleware so it can capture panics from all
	// subsequent middleware and handlers. Repanic: true re-panics after capture
	// so gin.Recovery() still handles the HTTP response.
	router.Use(sentrygin.New(sentrygin.Options{
		Repanic: true,
	}))

	// use logger middleware
	router.Use(middleware.Logger())
	//
	router.Use(gin.Recovery())

	// debug print logger middleware setup
	log.Println("Logger middleware set up")

	// init CORS middleware config
	corsConfig := cors.DefaultConfig()
	log.Println("Setting up CORS middleware")
	corsConfig.AllowCredentials = true

	// Get frontend URL from environment, default to localhost:3000
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	// Allow multiple origins for development and production
	allowedOrigins := []string{
		frontendURL,                              // Production frontend URL from env
		"https://www.wordsofpraise.app",          // www subdomain (Edge / some browsers use this)
		"http://localhost:3000",                  // Local development
		"http://localhost",                       // Local development
		"http://localhost:80",                    // Local development
		"https://wordsofpraise-frontend.fly.dev", // Production frontend (explicit)
		"https://wordsofpraise-backend.fly.dev",  // Backend (for health checks)
	}

	// Add production URLs if they're set in environment
	if prodFrontend := os.Getenv("PRODUCTION_FRONTEND_URL"); prodFrontend != "" {
		allowedOrigins = append(allowedOrigins, prodFrontend)
	}
	if prodBackend := os.Getenv("PRODUCTION_BACKEND_URL"); prodBackend != "" {
		allowedOrigins = append(allowedOrigins, prodBackend)
	}

	log.Printf("CORS allowed origins: %v", allowedOrigins)

	// In production, you might want to use AllowOriginFunc for more flexible origin checking
	corsConfig.AllowOrigins = allowedOrigins
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Authorization", "Content-Type", "sentry-trace", "baggage"}
	router.Use(cors.New(corsConfig))
	router.Use(gzip.Gzip(gzip.DefaultCompression))

	// debug print
	log.Printf("Starting server at %s\n", cfg.ServerAddress)

	// setup routes
	routes.SetupRoutes(router, authHandler, tokenService, verseHandler, favoriteHandler, historyHandler, commentService, commentHandler, profileHandler, oauthHandler, settingsHandler, streakHandler, blessingsHandler, milestonesHandler, journalHandler, translationsHandler, unlocksHandler, subscriptionHandler, subscriptionChecker, communityHandler, mannaHandler, pushHandler, readingPlanHandler, annotationHandler, searchHandler, prayerHandler, subscriberHandler, disciplineHandler)

	// debug print setup routes
	log.Println("Routes have been set up")

	// add health endpoint
	router.GET("/health", healthHandler)

	// add test error endpoint
	router.GET("/test-panic", errorHandler)

	// Start hourly push reminder scheduler. On each hour boundary it calls
	// SendRemindersForHour(), which checks each subscription's preferred time
	// against the current UTC time converted to the user's timezone — so every
	// user gets a notification at their chosen local hour regardless of timezone.
	go func() {
		for {
			now := time.Now().UTC()
			// Sleep until the top of the next hour.
			nextHour := time.Date(now.Year(), now.Month(), now.Day(), now.Hour()+1, 0, 5, 0, time.UTC)
			time.Sleep(nextHour.Sub(now))
			pushService.SendRemindersForHour()
		}
	}()

	// create http.Server with router
	c := &http.Server{
		Addr:    cfg.ServerAddress,
		Handler: router,
	}

	// start server in goroutine
	go func() {
		if err := c.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// debug print
	log.Printf("Server is running at %s\n", cfg.ServerAddress)

	// create signal channel
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	log.Println("Shutting down server...")

	// Signal background goroutines (reminder scheduler) to stop.
	cancel()

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()
	if err := c.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")

}
