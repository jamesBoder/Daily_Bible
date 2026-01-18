package models

import (
    "time"
    "gorm.io/gorm"
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
    
    // Relationships
    User  User  `gorm:"foreignKey:UserID;references:ID" json:"user,omitempty"`
    Verse Verse `gorm:"foreignKey:VerseID;references:ID" json:"verse,omitempty"`
}