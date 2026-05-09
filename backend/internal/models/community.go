package models

import (
	"time"

	"gorm.io/gorm"
)

// CommunityPost is a post on the community message board.
// PostType: "announcement" (admin), "user" (premium), "milestone" (system), "prayer" (all users), "challenge" (admin).
// UserID is nil for system/admin posts (displayed as "Words of Praise").
// ExpiresAt is set for prayer requests (7-day expiry) and time-limited challenges; nil means no expiry.
type CommunityPost struct {
	ID        uint   `gorm:"primaryKey;autoIncrement"`
	UserID    *uint  `gorm:"index"`
	PostType  string `gorm:"size:20;index"`
	Body      string `gorm:"size:500"`
	IsPinned  bool   `gorm:"default:false;index"`
	ExpiresAt *time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// CommunityReaction is a reaction (amen/pray/heart/join) by a user on a post.
// The composite unique index prevents duplicate reactions of the same type per user per post.
type CommunityReaction struct {
	ID           uint   `gorm:"primaryKey;autoIncrement"`
	PostID       uint   `gorm:"uniqueIndex:idx_reaction_unique;index"`
	UserID       uint   `gorm:"uniqueIndex:idx_reaction_unique"`
	ReactionType string `gorm:"size:20;uniqueIndex:idx_reaction_unique"`
	CreatedAt    time.Time
}
