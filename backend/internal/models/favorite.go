package models

import (
	"gorm.io/gorm"
	"time"
)

type Favorite struct {
	// GORM base fields
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Foreign keys
	UserID  uint `gorm:"not null;index" json:"user_id"`
	VerseID uint `gorm:"not null;index" json:"verse_id"`

	// BlessingsCredited tracks whether adding this favorite actually earned blessings
	// (the verse_favorited credit is capped at 3/day) — RemoveFavorite only refunds
	// the debit-on-unfavorite if this is true, so unfavoriting a favorite that never
	// earned anything (e.g. because the daily cap was already hit) doesn't overcharge
	// the user. Found 2026-09-16.
	BlessingsCredited bool `gorm:"default:false" json:"-"`

	// Relationships
	User  User  `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
	Verse Verse `gorm:"foreignKey:VerseID;references:ID" json:"verse,omitempty"`
}
