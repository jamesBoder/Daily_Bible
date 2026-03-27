package models

import "time"

// MannaWord is a word in the Manna puzzle word bank.
// Words are 5 letters (uppercase), paired with a scripture reference.
type MannaWord struct {
	ID                 uint   `gorm:"primaryKey;autoIncrement"`
	Word               string `gorm:"size:10;uniqueIndex"` // uppercase, 5 letters
	ScriptureReference string `gorm:"size:100"`
	ScriptureText      string `gorm:"type:text"`
	// ConnectionNote explains how the word connects to the scripture when the
	// relationship is not obvious (e.g. the word is the author, a key figure,
	// or the book name rather than a word that appears in the verse text).
	// Left empty when the word appears directly in the verse.
	ConnectionNote string `gorm:"type:text"`
	CreatedAt      time.Time
}
