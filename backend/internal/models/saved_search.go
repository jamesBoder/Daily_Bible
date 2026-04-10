package models

import (
	"time"
)

// SavedSearch is a named search query saved by a premium user.
// Name is optional — if blank, the Query string is used as the display label.
// Cap: 10 per user, enforced in the service layer.
type SavedSearch struct {
	ID        uint   `gorm:"primaryKey;autoIncrement"`
	UserID    uint   `gorm:"index"`
	Query     string `gorm:"size:200"`
	Name      string `gorm:"size:100"` // user-assigned label, optional
	CreatedAt time.Time
}
