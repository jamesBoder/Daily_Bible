package main

import (
    "log"
    "dailybible/internal/config"
    "dailybible/internal/database"
    "dailybible/internal/repository"
    "dailybible/internal/services"

    "github.com/gin-gonic/gin"
    // "dailybible/internal/handlers" // TODO: uncomment when implementing routes
)

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


    
}   // init gin router
    router := gin.Default()
    
    // add health endpoint
    router.GET("/health", healthHandler)

    // start server
    router.Run(cfg.ServerAddress)
    if err := router.Run(cfg.ServerAddress); err != nil {
        log.Fatal("Failed to start server:", err)
    }
    
    // healthHandler is a simple health check endpoint
    func healthHandler(c *gin.Context) {
        c.JSON(200, gin.H{
            "status": "ok",
        })
    }

