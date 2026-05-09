package journaltest

// testmain_test.go — package-level test setup
//
// Runs migrations ONCE before all tests in this package, then shares a single
// DB connection. Without this, each test called setupTestDB independently and
// ran AutoMigrate concurrently — causing schema-lock deadlocks under load.

import (
	"log"
	"os"
	"testing"

	"dailybible/internal/config"
	"dailybible/internal/database"

	"gorm.io/gorm"
)

// sharedDB is initialized once by TestMain and returned by every setupTestDB call.
var sharedDB *gorm.DB

func TestMain(m *testing.M) {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("TestMain: config.Load: %v", err)
	}
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("TestMain: database.Connect: %v", err)
	}
	if err := database.RunMigrations(db); err != nil {
		log.Fatalf("TestMain: RunMigrations: %v", err)
	}
	sharedDB = db
	os.Exit(m.Run())
}
