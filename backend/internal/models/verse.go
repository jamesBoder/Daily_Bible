package models

import (
    "time"
    "gorm.io/gorm"
)

type Verse struct {
    // GORM base fields
    ID        uint           `gorm:"primaryKey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Verse fields
    Reference   string `gorm:"uniqueIndex;not null" json:"reference"`  // e.g., "John 3:16"
    Text        string `gorm:"type:text;not null" json:"text"`
    Book        string `gorm:"size:50;not null" json:"book"`
    Chapter     int    `gorm:"not null" json:"chapter"`
    VerseNumber int    `gorm:"not null" json:"verse_number"`
    Translation string `gorm:"size:10;default:'KJV'" json:"translation"`
    
    // Relationships
    Favorites []Favorite `gorm:"foreignKey:VerseID" json:"favorites,omitempty"`
    History   []History  `gorm:"foreignKey:VerseID" json:"history,omitempty"`
}
