package database

import (
	_ "embed"

	"gorm.io/gorm"
)

//go:embed seeds/manna_words.sql
var mannaSeedSQL string

// SeedMannaWords inserts the bundled word bank into manna_words.
// The SQL is idempotent (ON CONFLICT (word) DO NOTHING), so it is
// safe to call on every startup; existing rows are never overwritten.
func SeedMannaWords(db *gorm.DB) error {
	return db.Exec(mannaSeedSQL).Error
}
