package main

import (
    "log"
    "net/http"
    "os"
    "os/signal"
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
    "github.com/go-playground/validator/v10"
    
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

    // 3b. Grandfather existing users as verified (one-time, idempotent)
    if result := db.Exec(`UPDATE users SET email_verified = true WHERE email_verified = false AND deleted_at IS NULL`); result.Error != nil {
        log.Printf("Warning: grandfathering SQL failed: %v", result.Error)
    } else {
        log.Printf("Grandfathering: %d existing users marked as email_verified", result.RowsAffected)
    }
    
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

    )

    // init favoriteHandler variable
    favoriteHandler := handlers.NewFavoriteHandler(
        favoriteService,
        bibleAPIService,
    )

    // init historyHandler variable
    historyHandler := handlers.NewHistoryHandler(
        historyService,
        bibleAPIService,
    )

    // init commentService variable
    commentHandler := handlers.NewCommentHandler(
        commentService,
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
    )

    // init oauthHandler variable
    oauthHandler := handlers.NewOAuthHandler(
        oauthService,
    )
    
    // init settingsHandler variable
    settingsHandler := handlers.NewSettingsHandler(
        settingsService,
    )
    
    // 7. Setup router and start server
    log.Println("Database connected and migrations completed successfully!")
    log.Println("Backend is ready. TODO: Add HTTP server and routes")

    
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
    
    log.Printf("CORS allowed origins: %v", allowedOrigins)
    
    // In production, you might want to use AllowOriginFunc for more flexible origin checking
    corsConfig.AllowOrigins = allowedOrigins
    corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
    corsConfig.AllowHeaders = []string{"Authorization", "Content-Type"}
    router.Use(cors.New(corsConfig))

    // debug print
    log.Printf("Starting server at %s\n", cfg.ServerAddress)

    // setup routes
    routes.SetupRoutes(router, authHandler, tokenService, verseHandler, favoriteHandler, historyHandler, commentService, commentHandler, profileHandler, oauthHandler, settingsHandler)

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
    


