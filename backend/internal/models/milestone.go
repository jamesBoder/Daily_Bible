package models

import (
	"time"
)

// UserMilestone represents a user's achieved milestones
type UserMilestone struct {
	ID                     uint   `gorm:"primaryKey;autoIncrement"`
	UserID                 uint   `gorm:"type:uint;uniqueIndex:idx_user_milestone"`
	MilestoneKey           string `gorm:"size:50;uniqueIndex:idx_user_milestone"`
	AchievedAt             time.Time
	BadgeVariant           string     `gorm:"size:20;default:'standard'"` // "standard" or "premium"
	CelebrationDismissedAt *time.Time // nil = not yet celebrated; set via POST /api/milestones/{key}/dismiss
}
