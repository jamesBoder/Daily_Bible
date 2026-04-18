package database

import (
	_ "embed"
	"log"
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
		if stmt == "" {
			continue
		}
		if err := db.Exec(stmt).Error; err != nil {
			return err
		}
	}
	return nil
}

// execStatementsDebug is like execStatements but logs each statement's index,
// a short preview of the SQL, and the number of rows affected. Use this for
// seeders where silent success/failure is hard to diagnose.
func execStatementsDebug(db *gorm.DB, label, sql string) error {
	stmts := strings.Split(sql, ";\n")
	active := 0
	for _, s := range stmts {
		if t := strings.TrimSpace(s); t != "" {
			active++
		}
	}
	log.Printf("[seed:%s] found %d statements to execute", label, active)

	idx := 0
	for _, stmt := range stmts {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" {
			continue
		}
		idx++

		// Build a short one-line preview (first non-comment line, max 80 chars)
		preview := ""
		for _, line := range strings.Split(stmt, "\n") {
			line = strings.TrimSpace(line)
			if line != "" && !strings.HasPrefix(line, "--") {
				if len(line) > 80 {
					preview = line[:80] + "…"
				} else {
					preview = line
				}
				break
			}
		}

		result := db.Exec(stmt)
		if result.Error != nil {
			log.Printf("[seed:%s] stmt %d/%d FAILED (%q): %v", label, idx, active, preview, result.Error)
			return result.Error
		}
		log.Printf("[seed:%s] stmt %d/%d OK — %d rows affected (%q)", label, idx, active, result.RowsAffected, preview)
	}
	return nil
}

//go:embed seeds/manna_words.sql
var mannaSeedSQL string

//go:embed seeds/manna_words_cleanup.sql
var mannaWordsCleanupSQL string

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

// SeedMannaWords inserts the bundled word bank into manna_words, removes
// entries whose target word does not appear in the scripture text (so every
// game has a visible blank), and applies connection notes.
// All operations are idempotent and safe on every startup.
func SeedMannaWords(db *gorm.DB) error {
	if err := execStatements(db, mannaSeedSQL); err != nil {
		return err
	}
	if err := execStatements(db, mannaWordsCleanupSQL); err != nil {
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
// Verbose statement-level logging is included so seed failures are easy to diagnose.
func SeedReadingPlans(db *gorm.DB) error {
	// Before counts — helps confirm whether rows already exist (triggering NOT EXISTS guards).
	var plansBefore, entriesBefore int64
	db.Raw("SELECT COUNT(*) FROM reading_plans").Scan(&plansBefore)
	db.Raw("SELECT COUNT(*) FROM reading_plan_entries").Scan(&entriesBefore)
	log.Printf("[seed:reading-plans] before — plans: %d, entries: %d", plansBefore, entriesBefore)

	if err := execStatementsDebug(db, "reading-plans", readingPlansSeedSQL); err != nil {
		return err
	}
	if err := execStatementsDebug(db, "reading-plan-entries", readingPlanEntriesSeedSQL); err != nil {
		return err
	}

	// After counts — confirm what actually landed in the DB.
	var plansAfter, entriesAfter int64
	db.Raw("SELECT COUNT(*) FROM reading_plans").Scan(&plansAfter)
	db.Raw("SELECT COUNT(*) FROM reading_plan_entries").Scan(&entriesAfter)
	log.Printf("[seed:reading-plans] after  — plans: %d (+%d), entries: %d (+%d)",
		plansAfter, plansAfter-plansBefore,
		entriesAfter, entriesAfter-entriesBefore,
	)
	return nil
}
