package database

import (
	"os"
	"testing"

	"dailybible/internal/config"
	"dailybible/internal/models"
)

func TestConnect(t *testing.T) {
	// Set environment variables for test
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5433")
	os.Setenv("DB_USER", "dailybible_user")
	os.Setenv("DB_PASSWORD", "test123")
	os.Setenv("DB_NAME", "daily_bible_dev")
	os.Setenv("DB_SSLMODE", "disable")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	db, err := Connect(cfg)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Failed to get sql.DB from gorm.DB: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}

	t.Log("✅ Database connection successful")

	// Test CRUD operations
	t.Run("CreateUser", func(t *testing.T) {
		// Clean up any existing test user first (hard delete)
		db.Unscoped().Where("email = ?", "test@example.com").Delete(&models.User{})

		user := models.User{
			Email:    "test@example.com",
			Username: "testuser",
			Password: "hashedpassword",
		}

		result := db.Create(&user)
		if result.Error != nil {
			t.Fatalf("Failed to create test user: %v", result.Error)
		}

		if user.ID == 0 {
			t.Fatal("User ID should be set after creation")
		}

		t.Logf("✅ Created user with ID: %d", user.ID)

		// Query the user
		var queriedUser models.User
		result = db.Where("email = ?", "test@example.com").First(&queriedUser)
		if result.Error != nil {
			t.Fatalf("Failed to query user: %v", result.Error)
		}

		if queriedUser.Email != user.Email {
			t.Errorf("Expected email %s, got %s", user.Email, queriedUser.Email)
		}

		t.Log("✅ User query successful")

		// Delete test user (hard delete for cleanup)
		result = db.Unscoped().Delete(&queriedUser)
		if result.Error != nil {
			t.Fatalf("Failed to delete test user: %v", result.Error)
		}

		t.Log("✅ User deletion successful")
	})
}

func TestConnectionPool(t *testing.T) {
	// Set environment variables for test
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5433")
	os.Setenv("DB_USER", "dailybible_user")
	os.Setenv("DB_PASSWORD", "test123")
	os.Setenv("DB_NAME", "daily_bible_dev")
	os.Setenv("DB_SSLMODE", "disable")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	db, err := Connect(cfg)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("Failed to get sql.DB: %v", err)
	}

	stats := sqlDB.Stats()
	t.Logf("Connection pool stats:")
	t.Logf("  Max Open Connections: %d", stats.MaxOpenConnections)
	t.Logf("  Open Connections: %d", stats.OpenConnections)
	t.Logf("  In Use: %d", stats.InUse)
	t.Logf("  Idle: %d", stats.Idle)

	// GORM default is 100, which is fine for our use case
	if stats.MaxOpenConnections == 0 {
		t.Error("Max open connections should not be 0")
	}

	t.Log("✅ Connection pool configured correctly")
}

func TestTablesExist(t *testing.T) {
	// Set environment variables for test
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "5433")
	os.Setenv("DB_USER", "dailybible_user")
	os.Setenv("DB_PASSWORD", "test123")
	os.Setenv("DB_NAME", "daily_bible_dev")
	os.Setenv("DB_SSLMODE", "disable")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	db, err := Connect(cfg)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	tables := []string{"users", "verses", "favorites", "histories"}

	for _, table := range tables {
		var exists bool
		query := `SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = ?
		)`
		
		err := db.Raw(query, table).Scan(&exists).Error
		if err != nil {
			t.Fatalf("Failed to check if table %s exists: %v", table, err)
		}

		if !exists {
			t.Errorf("Table %s does not exist", table)
		} else {
			t.Logf("✅ Table '%s' exists", table)
		}
	}
}
