package models

import (
	"gorm.io/gorm"
	"time"
)

// JournalEntry is a private devotional diary entry belonging to one user.
// ContentPlain is always stored for all users.
// ContentRich (Tiptap JSON) is only populated for premium users — stored but
// ignored at read time for free users until Phase 8 flips IsPremium.
// LinkedVerse is an optional scripture reference (premium only).
// PromptID links an entry to the weekly JournalPrompt that inspired it (nullable).
type JournalEntry struct {
	ID           uint           `gorm:"primaryKey;autoIncrement"`
	UserID       uint           `gorm:"index"`
	ContentPlain string         `gorm:"type:text"`
	ContentRich  string         `gorm:"type:text"`
	LinkedVerse  string         `gorm:"size:100"`
	PromptID     *uint
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

// JournalPrompt is a weekly curated reflective question shown to premium users.
// ActiveFrom is the Sunday the prompt goes live; ActiveUntil is the following Saturday.
// Only one prompt should be active at a time. Query with:
//
//	WHERE active_from <= NOW() AND active_until >= NOW()
type JournalPrompt struct {
	ID          uint      `gorm:"primaryKey;autoIncrement"`
	PromptText  string    `gorm:"type:text"`
	ActiveFrom  time.Time `gorm:"type:date"`
	ActiveUntil time.Time `gorm:"type:date"`
	CreatedAt   time.Time
}
