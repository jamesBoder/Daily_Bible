package models

import "time"

// MannaGuess records one guess within a MannaGame.
// Result is a comma-separated tile result string: "correct,present,absent,absent,correct"
type MannaGuess struct {
	ID        uint      `gorm:"primaryKey;autoIncrement"`
	GameID    uint      `gorm:"index"`
	GuessWord string    `gorm:"size:10"`
	Result    string    `gorm:"size:50"` // comma-separated: correct|present|absent × 5
	CreatedAt time.Time
}
