package main

import (
	"fmt"
	"log"
	"strings"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/services"
)

func main() {
	fmt.Println("🧪 Testing JWT Token Service...")
	fmt.Println("================================")

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Verify JWT_SECRET is loaded
	if cfg.JWTSecret == "" {
		log.Fatal("❌ JWT_SECRET not found in config")
	}
	fmt.Printf("✅ JWT_SECRET loaded (length: %d)\n\n", len(cfg.JWTSecret))

	// Create token service
	tokenService := services.NewTokenService(cfg)
	fmt.Println("✅ TokenService created successfully\n")

	// Test 1: Generate Token
	fmt.Println("Test 1: Generate Token")
	fmt.Println("-----------------------")
	testUserID := uint(123)
	testEmail := "test@example.com"

	token, err := tokenService.GenerateToken(testUserID, testEmail)
	if err != nil {
		log.Fatal("❌ Failed to generate token:", err)
	}

	fmt.Printf("✅ Token generated successfully\n")
	fmt.Printf("   Token length: %d characters\n", len(token))
	
	// Verify token has 3 parts (header.payload.signature)
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		log.Fatal("❌ Token should have 3 parts, got:", len(parts))
	}
	fmt.Printf("✅ Token has correct structure (3 parts)\n")
	fmt.Printf("   Token preview: %s...%s\n\n", token[:20], token[len(token)-20:])

	// Test 2: Validate Token
	fmt.Println("Test 2: Validate Token")
	fmt.Println("-----------------------")
	claims, err := tokenService.ValidateToken(token)
	if err != nil {
		log.Fatal("❌ Failed to validate token:", err)
	}

	fmt.Println("✅ Token validated successfully")
	fmt.Printf("   UserID: %d\n", claims.UserID)
	fmt.Printf("   Email: %s\n", claims.Email)
	
	// Verify claims match
	if claims.UserID != testUserID {
		log.Fatalf("❌ UserID mismatch: expected %d, got %d", testUserID, claims.UserID)
	}
	if claims.Email != testEmail {
		log.Fatalf("❌ Email mismatch: expected %s, got %s", testEmail, claims.Email)
	}
	fmt.Println("✅ Claims match original values\n")

	// Test 3: Check Expiration
	fmt.Println("Test 3: Check Token Expiration")
	fmt.Println("--------------------------------")
	if claims.ExpiresAt == nil {
		log.Fatal("❌ ExpiresAt is nil")
	}
	
	expiresIn := claims.ExpiresAt.Time.Sub(claims.IssuedAt.Time)
	expectedHours := 168.0 // 7 days
	actualHours := expiresIn.Hours()
	
	fmt.Printf("   Issued at: %s\n", claims.IssuedAt.Time.Format("2006-01-02 15:04:05"))
	fmt.Printf("   Expires at: %s\n", claims.ExpiresAt.Time.Format("2006-01-02 15:04:05"))
	fmt.Printf("   Duration: %.0f hours (%.0f days)\n", actualHours, actualHours/24)
	
	if actualHours < expectedHours-1 || actualHours > expectedHours+1 {
		log.Fatalf("❌ Expiration mismatch: expected ~%.0f hours, got %.0f hours", expectedHours, actualHours)
	}
	fmt.Println("✅ Token expires in 7 days as expected\n")

	// Test 4: Refresh Token
	fmt.Println("Test 4: Refresh Token")
	fmt.Println("----------------------")
	
	// Wait 1 second to ensure different IssuedAt timestamp
	fmt.Println("   Waiting 1 second for timestamp difference...")
	time.Sleep(1 * time.Second)
	
	newToken, err := tokenService.RefreshToken(token)
	if err != nil {
		log.Fatal("❌ Failed to refresh token:", err)
	}

	fmt.Println("✅ Token refreshed successfully")
	fmt.Printf("   New token length: %d characters\n", len(newToken))
	
	// Verify new token is different
	if newToken == token {
		log.Fatal("❌ Refreshed token should be different from original")
	}
	fmt.Println("✅ Refreshed token is different from original\n")

	// Validate refreshed token
	newClaims, err := tokenService.ValidateToken(newToken)
	if err != nil {
		log.Fatal("❌ Failed to validate refreshed token:", err)
	}

	if newClaims.UserID != testUserID || newClaims.Email != testEmail {
		log.Fatal("❌ Refreshed token claims don't match")
	}
	fmt.Println("✅ Refreshed token has correct claims\n")

	// Test 5: Invalid Token
	fmt.Println("Test 5: Invalid Token Handling")
	fmt.Println("--------------------------------")
	invalidToken := "invalid.token.here"
	_, err = tokenService.ValidateToken(invalidToken)
	if err == nil {
		log.Fatal("❌ Should have failed to validate invalid token")
	}
	fmt.Printf("✅ Invalid token rejected correctly: %v\n\n", err)

	// Summary
	fmt.Println("================================")
	fmt.Println("🎉 All Token Service Tests Passed!")
	fmt.Println("================================")
	fmt.Println("\n✅ Token Generation: Working")
	fmt.Println("✅ Token Validation: Working")
	fmt.Println("✅ Token Expiration: 7 days (correct)")
	fmt.Println("✅ Token Refresh: Working")
	fmt.Println("✅ Invalid Token Handling: Working")
	fmt.Println("\n✨ Step 9: JWT Token Service - COMPLETE!")
}
