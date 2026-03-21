package models

import "time"

// UserFriend represents a friend connection between two users.
// An accepted friendship is stored as two rows: (A→B) and (B→A) both with status "accepted".
// A pending request has one row: (A→B) with status "pending".
type UserFriend struct {
	ID       uint   `gorm:"primaryKey;autoIncrement"`
	UserID   uint   `gorm:"index;uniqueIndex:idx_friend_pair"`
	FriendID uint   `gorm:"uniqueIndex:idx_friend_pair"`
	Status   string `gorm:"size:20"` // "pending", "accepted"
	CreatedAt time.Time
	UpdatedAt time.Time
}
