package main

// test GetMe endpoint

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"

	

	"dailybible/internal/routes"
	"dailybible/internal/handlers"
	"dailybible/internal/services"
	"dailybible/internal/repository"
	"dailybible/internal/models"
	"dailybible/internal/config"
	"dailybible/internal/database"
	"github.com/gin-gonic/gin"

)



func main() {
	// Initialize Gin router
	router := gin.Default()

		// Load config from .env file (same as main.go)
	cfg, err := config.Load()
	if err != nil {
		panic("Failed to load config: " + err.Error())
	}

	// Connect to database using loaded config
	db, err := database.Connect(cfg)
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}



	// Initialize dependencies
	userRepo := repository.NewUserRepository(db) // Assuming a constructor exists
	tokenService := services.NewTokenService(cfg) // Replace with actual secret key
	authHandler := handlers.NewAuthHandler(userRepo, tokenService)

	// Setup routes
	routes.SetupRoutes(router, authHandler, tokenService)

	// Create a test server
	ts := httptest.NewServer(router)
	defer ts.Close()

	// Simulate user registration to get a token
	registerPayload := map[string]string{
		"email":    "james@example.com",
		"username": "jamesboder99",
		"password": "SecurePass123!",
	}
	payloadBytes, _ := json.Marshal(registerPayload)
	resp, err := http.Post(fmt.Sprintf("%s/api/auth/register", ts.URL), "application/json", bytes.NewBuffer(payloadBytes))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var registerResp struct {
		User  models.User `json:"user"`
		Token string      `json:"token"`
	}
	json.NewDecoder(resp.Body).Decode(&registerResp)

	// Now test the GetMe endpoint with the obtained token
	client := &http.Client{}
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req.Header.Set("Authorization", "Bearer "+registerResp.Token)

	getMeResp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer getMeResp.Body.Close()

	var userInfo struct {
		ID       uint   `json:"id"`
		Email    string `json:"email"`
		Username string `json:"username"`
	}
	json.NewDecoder(getMeResp.Body).Decode(&userInfo)

	fmt.Printf("User Info: %+v\n", userInfo)
}