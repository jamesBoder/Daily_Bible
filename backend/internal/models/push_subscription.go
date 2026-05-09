package models

import (
	"gorm.io/gorm"
	"time"
)

// PushSubscription stores a Web Push API subscription for a single browser/device.
// A user may have multiple active subscriptions (e.g., phone + tablet).
// Soft-deletes are used so stale rows (410 Gone from push provider) are pruned
// without losing audit history.
type PushSubscription struct {
	ID        uint           `gorm:"primaryKey"      json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index"           json:"-"`

	// Composite unique index: one row per (user, device). Multiple users on a
	// shared device each get their own row; changing the device gives a fresh endpoint.
	UserID   uint   `gorm:"not null;index;uniqueIndex:idx_push_user_endpoint" json:"user_id"`
	Endpoint string `gorm:"not null;size:2048;uniqueIndex:idx_push_user_endpoint"  json:"endpoint"`
	P256DH   string `gorm:"not null;size:512"  json:"p256dh"`
	Auth     string `gorm:"not null;size:256"  json:"auth"`
}
