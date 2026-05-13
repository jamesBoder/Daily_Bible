package main

// test GetMe endpoint

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/database"
	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"dailybible/internal/routes"
	"dailybible/internal/services"
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
	userRepo := repository.NewUserRepository(db)  // Assuming a constructor exists
	tokenService := services.NewTokenService(cfg) // Replace with actual secret key
	authHandler := handlers.NewAuthHandler(userRepo, tokenService)

	// Setup routes
	routes.SetupRoutes(router, authHandler, tokenService)

	// Create a test server
	ts := httptest.NewServer(router)
	defer ts.Close()

	// Register a new user with a unique email to avoid conflicts
	timestamp := time.Now().Unix()
	uniqueEmail := fmt.Sprintf("testuser%d@example.com", timestamp)
	registerPayload := map[string]string{
		"email":    uniqueEmail,
		"username": fmt.Sprintf("testuser%d", timestamp),
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

	// Check if registration was successful
	if resp.StatusCode != http.StatusCreated {
		panic(fmt.Sprintf("Registration failed with status: %d", resp.StatusCode))
	}

	if registerResp.Token == "" {
		panic("Failed to obtain token from registration")
	}

	fmt.Printf("Successfully registered user: %s\n", uniqueEmail)

	// Now test the GetMe endpoint with the obtained token
	client := &http.Client{}
	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req.Header.Set("Authorization", "Bearer "+registerResp.Token)

	getMeResp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer getMeResp.Body.Close()

	var getMeResponse struct {
		User struct {
			ID       uint   `json:"id"`
			Email    string `json:"email"`
			Username string `json:"username"`
		} `json:"user"`
	}
	json.NewDecoder(getMeResp.Body).Decode(&getMeResponse)

	fmt.Printf("User Info: %+v\n", getMeResponse.User)

	// test #2: invalid token
	req2, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req2.Header.Set("Authorization", "Bearer invalidtoken")

	getMeResp2, err := client.Do(req2)
	if err != nil {
		panic(err)
	}
	defer getMeResp2.Body.Close()

	if getMeResp2.StatusCode != http.StatusUnauthorized {
		panic("Expected 401 Unauthorized for invalid token")
	}

	fmt.Println("Invalid token test passed with status:", getMeResp2.StatusCode)

	// test #3: missing token
	req3, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)

	getMeResp3, err := client.Do(req3)
	if err != nil {
		panic(err)
	}
	defer getMeResp3.Body.Close()

	if getMeResp3.StatusCode != http.StatusUnauthorized {
		panic("Expected 401 Unauthorized for missing token")
	}

	fmt.Println("Missing token test passed with status:", getMeResp3.StatusCode)

	// test #5: malformed token
	req5, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req5.Header.Set("Authorization", "Bearer malformed.token.here")

	getMeResp5, err := client.Do(req5)
	if err != nil {
		panic(err)
	}
	defer getMeResp5.Body.Close()

	if getMeResp5.StatusCode != http.StatusUnauthorized {
		panic("Expected 401 Unauthorized for malformed token")
	}

	fmt.Println("Malformed token test passed with status:", getMeResp5.StatusCode)

	// test #7: valid token, valid user
	req7, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req7.Header.Set("Authorization", "Bearer "+registerResp.Token)

	getMeResp7, err := client.Do(req7)
	if err != nil {
		panic(err)
	}

	defer getMeResp7.Body.Close()

	if getMeResp7.StatusCode != http.StatusOK {
		panic("Expected 200 OK for valid token and user")
	}

	var getMeResponse7 struct {
		User struct {
			ID       uint   `json:"id"`
			Email    string `json:"email"`
			Username string `json:"username"`
		} `json:"user"`
	}
	json.NewDecoder(getMeResp7.Body).Decode(&getMeResponse7)

	fmt.Printf("Valid token test passed. User Info: %+v\n", getMeResponse7.User)

	// test #8: missing Authorization header
	req8, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	// No Authorization header set

	getMeResp8, err := client.Do(req8)
	if err != nil {
		panic(err)
	}
	defer getMeResp8.Body.Close()

	if getMeResp8.StatusCode != http.StatusUnauthorized {
		panic("Expected 401 Unauthorized for missing Authorization header")
	}

	fmt.Println("Missing Authorization header test passed with status:", getMeResp8.StatusCode)

	// test #9: valid token with extra spaces
	req9, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
	req9.Header.Set("Authorization", "  Bearer   "+registerResp.Token+"   ")
	getMeResp9, err := client.Do(req9)
	if err != nil {
		panic(err)
	}
	defer getMeResp9.Body.Close()

	if getMeResp9.StatusCode != http.StatusOK {
		panic("Expected 200 OK for valid token with extra spaces")
	}

	var getMeResponse9 struct {
		User struct {
			ID       uint   `json:"id"`
			Email    string `json:"email"`
			Username string `json:"username"`
		} `json:"user"`
	}
	json.NewDecoder(getMeResp9.Body).Decode(&getMeResponse9)

	fmt.Printf("Valid token with extra spaces test passed. User Info: %+v\n", getMeResponse9.User)

	// test #10: duplicate requests with same valid token
	for i := 0; i < 3; i++ {
		req10, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/me", ts.URL), nil)
		req10.Header.Set("Authorization", "Bearer "+registerResp.Token)

		getMeResp10, err := client.Do(req10)
		if err != nil {
			panic(err)
		}
		defer getMeResp10.Body.Close()

		if getMeResp10.StatusCode != http.StatusOK {
			panic("Expected 200 OK for duplicate requests with same valid token")
		}

		var getMeResponse10 struct {
			User struct {
				ID       uint   `json:"id"`
				Email    string `json:"email"`
				Username string `json:"username"`
			} `json:"user"`
		}
		json.NewDecoder(getMeResp10.Body).Decode(&getMeResponse10)

		fmt.Printf("Duplicate request %d passed. User Info: %+v\n", i+1, getMeResponse10.User)
	}

}
