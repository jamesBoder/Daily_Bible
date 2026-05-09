package database

import (
	"os"
	"testing"

	"dailybible/internal/config"
)

// TestMain runs AutoMigrate before any test in this package so that
// TestConnect, TestTablesExist, and the backfill tests all have a
// fully-migrated schema to work against.
func TestMain(m *testing.M) {
	setDefaultEnv("DB_HOST", "localhost")
	setDefaultEnv("DB_PORT", "5433")
	setDefaultEnv("DB_USER", "dailybible_user")
	setDefaultEnv("DB_PASSWORD", "test123")
	setDefaultEnv("DB_NAME", "daily_bible_dev")
	setDefaultEnv("DB_SSLMODE", "disable")

	cfg, err := config.Load()
	if err == nil {
		if db, err := Connect(cfg); err == nil {
			// Best-effort — if migrations fail the individual tests will surface
			// the specific error; we don't want TestMain to mask them.
			_ = RunMigrations(db)
		}
	}

	os.Exit(m.Run())
}
