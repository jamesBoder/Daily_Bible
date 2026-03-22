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
    "dailybible/internal/repository"
    "dailybible/internal/services"
    "dailybible/internal/middleware"
    "dailybible/internal/routes"
    "dailybible/internal/handlers"

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/gin-contrib/gzip"
    "github.com/go-playground/validator/v10"
    stripe "github.com/stripe/stripe-go/v80"
)

// healthHandler is a simple health check endpoint
func healthHandler(c *gin.Context) {
    c.JSON(200, gin.H{
        "status": "ok",
        "database": "connected",
        "timestamp": time.Now().UTC(),
    })
}

// errorHandler is a test endpoint to trigger an error
func errorHandler(c *gin.Context) {
    panic("Test panic for error handling middleware")
}

func main() {
    // 1. Load config
    cfg, err := config.Load()
    if err != nil {
        log.Fatal("Failed to load config:", err)
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
    oauthService := services.NewOAuthService(userRepo, tokenService, googleOAuthConfig)
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
    // Phase 8: replace StubSubscriptionChecker with the real Stripe-backed implementation.
    subscriptionChecker := services.NewStripeSubscriptionChecker(db)
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

    // create validator instance
    validate := validator.New()
    _ = validate // currently not used, but can be integrated into services or handlers later
    
    // 6. Initialize handlers 
    _ = authService      // Use services to avoid "declared and not used" errors
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
        userRepo,
    )

    // Phase 9 handlers
    communityHandler := handlers.NewCommunityHandler(communityService, subscriptionChecker, adminIDs)
    // Wire community service into verseHandler for milestone auto-posts.
    verseHandler.SetCommunityService(communityService)

    // Phase 10 handlers
    mannaHandler := handlers.NewMannaHandler(mannaService, subscriptionChecker)

    // Phase 10: seed word bank on every start — idempotent (ON CONFLICT DO NOTHING).
    // Running unconditionally means new words added to the SQL file are picked up
    // on the next deploy without manual intervention.
    if err := database.SeedMannaWords(db); err != nil {
        log.Printf("WARNING: Manna seed failed: %v", err)
    } else {
        log.Printf("Manna word bank: %d words loaded", mannaService.SeedWordCount())
    }

    // 7. Setup router and start server
    log.Println("Database connected and migrations completed successfully!")
    log.Println("Backend is ready. Setting up routes...")

    
    // init gin router
    router := gin.New()

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
        frontendURL,                                    // Production frontend URL from env
        "http://localhost:3000",                        // Local development
        "http://localhost",                             // Local development
        "http://localhost:80",                          // Local development
        "https://wordsofpraise-frontend.fly.dev",      // Production frontend (explicit)
        "https://wordsofpraise-backend.fly.dev",       // Backend (for health checks)
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
    corsConfig.AllowHeaders = []string{"Authorization", "Content-Type"}
    router.Use(cors.New(corsConfig))
    router.Use(gzip.Gzip(gzip.DefaultCompression))

    // debug print
    log.Printf("Starting server at %s\n", cfg.ServerAddress)

    // setup routes
    routes.SetupRoutes(router, authHandler, tokenService, verseHandler, favoriteHandler, historyHandler, commentService, commentHandler, profileHandler, oauthHandler, settingsHandler, streakHandler, blessingsHandler, milestonesHandler, journalHandler, translationsHandler, unlocksHandler, subscriptionHandler, subscriptionChecker, communityHandler, mannaHandler)

    // debug print setup routes
    log.Println("Routes have been set up")


    // add health endpoint
    router.GET("/health", healthHandler)

    // add test error endpoint
    router.GET("/test-panic", errorHandler)


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

    // wait for signal
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    if err := c.Shutdown(ctx); err != nil {
        log.Fatal("Server forced to shutdown:", err)
    }

    log.Println("Server exiting")

    
    }
    


