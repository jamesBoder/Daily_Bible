package main

import (
	"fmt"
	"log"
	"os"

	"dailybible/internal/config"
	"dailybible/internal/database"
	"dailybible/internal/models"
	"dailybible/internal/repository"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load config
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Connect to database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("✅ Database connected successfully")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	verseRepo := repository.NewVerseRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	historyRepo := repository.NewHistoryRepository(db)

	fmt.Println("✅ All repositories initialized")

	// Cleanup any existing test data first (in correct order due to foreign keys)
	fmt.Println("\n--- Cleaning Up Any Existing Test Data ---")
	
	// Get existing user and verse IDs if they exist
	var existingUser models.User
	db.Unscoped().Where("email = ?", "test@repo.com").First(&existingUser)
	
	var existingVerse models.Verse
	db.Unscoped().Where("reference = ?", "John 3:16").First(&existingVerse)
	
	// Delete in correct order: history -> favorites -> verse -> user
	if existingUser.ID > 0 {
		db.Unscoped().Where("user_id = ?", existingUser.ID).Delete(&models.History{})
		db.Unscoped().Where("user_id = ?", existingUser.ID).Delete(&models.Favorite{})
	}
	if existingVerse.ID > 0 {
		db.Unscoped().Where("verse_id = ?", existingVerse.ID).Delete(&models.Favorite{})
		db.Unscoped().Delete(&existingVerse)
	}
	if existingUser.ID > 0 {
		db.Unscoped().Delete(&existingUser)
	}
	
	fmt.Println("✅ Cleaned up existing test data")

	// Test 1: User Repository
	fmt.Println("\n--- Testing User Repository ---")
	testUser := &models.User{
		Email:    "test@repo.com",
		Username: "testrepo",
		Password: "hashedpassword123",
	}

	// Create user
	if err := userRepo.Create(testUser); err != nil {
		log.Fatal("Failed to create user:", err)
	}
	fmt.Printf("✅ Created user with ID: %d\n", testUser.ID)

	// Get by email
	foundUser, err := userRepo.GetByEmail("test@repo.com")
	if err != nil {
		log.Fatal("Failed to get user by email:", err)
	}
	fmt.Printf("✅ Found user by email: %s\n", foundUser.Email)

	// Get by username
	foundUser2, err := userRepo.GetByUsername("testrepo")
	if err != nil {
		log.Fatal("Failed to get user by username:", err)
	}
	fmt.Printf("✅ Found user by username: %s\n", foundUser2.Username)

	// Test 2: Verse Repository
	fmt.Println("\n--- Testing Verse Repository ---")
	testVerse := &models.Verse{
		Reference:   "John 3:16",
		Text:        "For God so loved the world...",
		Translation: "KJV",
	}

	// Create verse
	if err := verseRepo.Create(testVerse); err != nil {
		log.Fatal("Failed to create verse:", err)
	}
	fmt.Printf("✅ Created verse with ID: %d\n", testVerse.ID)

	// Get by reference
	foundVerse, err := verseRepo.GetByReference("John 3:16")
	if err != nil {
		log.Fatal("Failed to get verse by reference:", err)
	}
	fmt.Printf("✅ Found verse: %s\n", foundVerse.Reference)

	// Test 3: Favorite Repository
	fmt.Println("\n--- Testing Favorite Repository ---")

	// Add favorite
	if err := favoriteRepo.Add(testUser.ID, testVerse.ID); err != nil {
		log.Fatal("Failed to add favorite:", err)
	}
	fmt.Println("✅ Added favorite")

	// Check if exists
	exists, err := favoriteRepo.Exists(testUser.ID, testVerse.ID)
	if err != nil {
		log.Fatal("Failed to check favorite exists:", err)
	}
	fmt.Printf("✅ Favorite exists: %v\n", exists)

	// List favorites
	favorites, err := favoriteRepo.List(testUser.ID)
	if err != nil {
		log.Fatal("Failed to list favorites:", err)
	}
	fmt.Printf("✅ User has %d favorite(s)\n", len(favorites))

	// Test 4: History Repository
	fmt.Println("\n--- Testing History Repository ---")

	// Track view
	if err := historyRepo.Track(testUser.ID, testVerse.ID); err != nil {
		log.Fatal("Failed to track history:", err)
	}
	fmt.Println("✅ Tracked verse view")

	// List history
	history, err := historyRepo.List(testUser.ID, 10)
	if err != nil {
		log.Fatal("Failed to list history:", err)
	}
	fmt.Printf("✅ User has %d history entry(ies)\n", len(history))

	// Cleanup
	fmt.Println("\n--- Cleaning Up Test Data ---")

	// Hard delete history (to remove foreign key constraint)
	if err := db.Unscoped().Where("user_id = ?", testUser.ID).Delete(&models.History{}).Error; err != nil {
		log.Fatal("Failed to hard delete history:", err)
	}
	fmt.Println("✅ Hard deleted history")

	// Hard delete favorite (to remove foreign key constraint)
	if err := db.Unscoped().Where("user_id = ? AND verse_id = ?", testUser.ID, testVerse.ID).Delete(&models.Favorite{}).Error; err != nil {
		log.Fatal("Failed to hard delete favorite:", err)
	}
	fmt.Println("✅ Hard deleted favorite")

	// Delete verse
	if err := db.Unscoped().Delete(testVerse).Error; err != nil {
		log.Fatal("Failed to delete verse:", err)
	}
	fmt.Println("✅ Deleted verse")

	// Delete user
	if err := userRepo.Delete(testUser.ID); err != nil {
		log.Fatal("Failed to delete user:", err)
	}
	fmt.Println("✅ Deleted user")

	fmt.Println("\n🎉 All repository tests passed!")
	os.Exit(0)
}
