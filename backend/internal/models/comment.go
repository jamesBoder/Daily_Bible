package models

import (
    "time"
    "gorm.io/gorm"
)

type Comment struct {
    ID             uint           `gorm:"primaryKey" json:"id"`
    CreatedAt      time.Time      `json:"created_at"`
    UpdatedAt      time.Time      `json:"updated_at"`
    DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Foreign keys
    UserID         uint   `gorm:"not null;index" json:"user_id"`
    VerseID        int    `gorm:"not null" json:"verse_id"`
    VerseReference string `gorm:"size:255;not null;index" json:"verse_reference"`
    
    // Comment content
    CommentText    string `gorm:"type:text;not null" json:"comment_text"`
    
    // Relationships
    User User `gorm:"foreignKey:UserID" json:"user,omitempty"`

	
}
