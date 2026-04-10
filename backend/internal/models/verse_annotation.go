package models

import (
	"time"
)

// VerseAnnotation is a private user note attached to a specific phrase in a verse.
// PhraseText is stored for display — it is the text the user selected or typed.
// Annotations are premium-only and never shared publicly.
type VerseAnnotation struct {
	ID             uint   `gorm:"primaryKey;autoIncrement"`
	UserID         uint   `gorm:"index"`
	VerseReference string `gorm:"size:100"` // e.g. "Psalm 23:2"
	PhraseText     string `gorm:"size:500"` // the highlighted phrase
	AnnotationText string `gorm:"type:text"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
}
