package models

import "time"

// MannaWord is a word in the Manna puzzle word bank.
// Words are 5 letters (uppercase), paired with a scripture reference.
type MannaWord struct {
	ID                 uint   `gorm:"primaryKey;autoIncrement"`
	Word               string `gorm:"size:10;uniqueIndex"` // uppercase, 5 letters
	ScriptureReference string `gorm:"size:100"`
	ScriptureText      string `gorm:"type:text"`
	CreatedAt          time.Time
}
