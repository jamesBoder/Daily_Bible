package models

import "time"

// MannaGame tracks a user's daily Manna puzzle session.
// One row per (user_id, game_date). Status: "in_progress", "solved", "failed".
type MannaGame struct {
	ID               uint      `gorm:"primaryKey;autoIncrement"`
	UserID           uint      `gorm:"index;uniqueIndex:idx_manna_user_date"`
	GameDate         time.Time `gorm:"type:date;uniqueIndex:idx_manna_user_date"`
	WordID           uint      `gorm:"index"` // FK to MannaWord — never sent in API response
	Status           string    `gorm:"size:20;default:'in_progress'"`
	GuessCount       int       `gorm:"default:0"`
	MaxGuesses       int       `gorm:"default:6"`
	BlessingsAwarded bool      `gorm:"default:false"` // prevent double-crediting
	// Hint system — up to 3 hints per game, each costs 15 Blessings
	HintsUsed   int    `gorm:"default:0"`
	HintLetters string `gorm:"size:50;default:''"` // "0:G,2:A" — position:letter pairs
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
