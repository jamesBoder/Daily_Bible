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

    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    // "dailybible/internal/handlers" // TODO: uncomment when implementing routes
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
    db, err := database.Connect(cfg.DatabaseURL)
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    
    // 3. Run migrations
    if err := database.RunMigrations(db); err != nil {
        log.Fatal("Failed to run migrations:", err)
    }
    
    // 4. Initialize repositories
    userRepo := repository.NewUserRepository(db)
    verseRepo := repository.NewVerseRepository(db)
    favoriteRepo := repository.NewFavoriteRepository(db)
    
    // 5. Initialize services
    authService := services.NewAuthService(userRepo)
    verseService := services.NewVerseService(verseRepo)
    favoriteService := services.NewFavoriteService(favoriteRepo)
    
    // 6. Initialize handlers (TODO: implement when needed)
    _ = authService      // Use services to avoid "declared and not used" errors
    _ = verseService
    _ = favoriteService
    
    // TODO: Initialize handlers when implementing routes
    // authHandler := handlers.NewAuthHandler()
    // favoritesHandler := handlers.NewFavoritesHandler()
    // historyHandler := handlers.NewHistoryHandler()
    
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
    corsConfig.AllowOrigins = []string{"http://localhost:3000"}
    corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
    corsConfig.AllowHeaders = []string{"Authorization", "Content-Type"}
    router.Use(cors.New(corsConfig))

    // debug print
    log.Printf("Starting server at %s\n", cfg.ServerAddress)


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
    


