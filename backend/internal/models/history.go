package models

import (
	"gorm.io/gorm"
	"time"
)

type History struct {
	// GORM base fields
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Foreign keys
	UserID  uint `gorm:"not null;index" json:"user_id"`
	VerseID uint `gorm:"not null;index" json:"verse_id"`

	// Additional fields
	ViewedAt time.Time `gorm:"not null;index" json:"viewed_at"`

	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Verse Verse `gorm:"foreignKey:VerseID" json:"verse,omitempty"`
}
