package models

import (
    "time"
    "gorm.io/gorm"
)

type User struct {
    // GORM base fields (add these at the top)
    ID        uint           `gorm:"primaryKey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Your existing fields (add GORM tags)
    Email    string `gorm:"uniqueIndex;not null" json:"email"`
    Username string `gorm:"size:50" json:"username"`
    Password string `gorm:"not null" json:"-"`
    
    // Relationships (if you want to preload)
    Favorites []Favorite `gorm:"foreignKey:UserID" json:"favorites,omitempty"`
    History   []History  `gorm:"foreignKey:UserID" json:"history,omitempty"`
}
