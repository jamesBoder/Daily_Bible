package database

import (
	_ "embed"
	"strings"

	"gorm.io/gorm"
)

// execStatements splits a SQL string on ";\n" and executes each non-empty
// statement individually. This is required because pgx v5 (the underlying
// PostgreSQL driver) uses the extended query protocol, which rejects
// multi-statement strings in a single Exec call.
func execStatements(db *gorm.DB, sql string) error {
	for _, stmt := range strings.Split(sql, ";\n") {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}
		if err := db.Exec(stmt).Error; err != nil {
			return err
		}
	}
	return nil
}

//go:embed seeds/manna_words.sql
var mannaSeedSQL string

//go:embed seeds/manna_connection_notes.sql
var mannaConnectionNotesSQL string

//go:embed seeds/community_posts.sql
var communityPostsSeedSQL string

//go:embed seeds/community_cleanup.sql
var communityCleanupSQL string

//go:embed seeds/reading_plans.sql
var readingPlansSeedSQL string

//go:embed seeds/reading_plan_entries.sql
var readingPlanEntriesSeedSQL string

// SeedMannaWords inserts the bundled word bank into manna_words and then
// applies connection notes for words whose link to their scripture is not
// immediately obvious. Both operations are idempotent and safe on every startup.
func SeedMannaWords(db *gorm.DB) error {
	if err := execStatements(db, mannaSeedSQL); err != nil {
		return err
	}
	return execStatements(db, mannaConnectionNotesSQL)
}

// SeedCommunityPosts deletes stale test admin posts and inserts the three
// real seed posts (welcome, weekly challenge, streak reminder).
// The SQL is idempotent — safe to call on every startup.
func SeedCommunityPosts(db *gorm.DB) error {
	return execStatements(db, communityPostsSeedSQL)
}

// CleanCommunityPosts soft-deletes profane posts and all posts from test
// accounts. Safe to call on every startup — already-deleted rows are skipped
// by the WHERE deleted_at IS NULL guards.
func CleanCommunityPosts(db *gorm.DB) error {
	return execStatements(db, communityCleanupSQL)
}

// SeedReadingPlans inserts the bundled reading plan catalog and day entries.
// Both operations are idempotent — plans use ON CONFLICT DO NOTHING on slug,
// and entries are skipped when any entry already exists for the plan.
func SeedReadingPlans(db *gorm.DB) error {
	if err := execStatements(db, readingPlansSeedSQL); err != nil {
		return err
	}
	return execStatements(db, readingPlanEntriesSeedSQL)
}
