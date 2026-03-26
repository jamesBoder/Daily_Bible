package database

import (
	_ "embed"

	"gorm.io/gorm"
)

//go:embed seeds/manna_words.sql
var mannaSeedSQL string

//go:embed seeds/community_posts.sql
var communityPostsSeedSQL string

// SeedMannaWords inserts the bundled word bank into manna_words.
// The SQL is idempotent (ON CONFLICT (word) DO NOTHING), so it is
// safe to call on every startup; existing rows are never overwritten.
func SeedMannaWords(db *gorm.DB) error {
	return db.Exec(mannaSeedSQL).Error
}

// SeedCommunityPosts deletes stale test admin posts and inserts the three
// real seed posts (welcome, weekly challenge, streak reminder).
// The SQL is idempotent — safe to call on every startup.
func SeedCommunityPosts(db *gorm.DB) error {
	return db.Exec(communityPostsSeedSQL).Error
}
