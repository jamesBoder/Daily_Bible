package models

import (
	"time"
)

// ReadingPlan is a curated multi-day Scripture journey.
// IsSeasonal plans are tied to liturgical seasons; SeasonStart/SeasonEnd define
// when they are active. RequiresPremium gates the full plan for free users.
// IsActive = false means the plan is archived and hidden from the library.
type ReadingPlan struct {
	ID              uint       `gorm:"primaryKey;autoIncrement"`
	Slug            string     `gorm:"uniqueIndex;size:100"` // e.g. "walking-in-peace"
	Title           string     `gorm:"size:200"`
	Description     string     `gorm:"type:text"`
	LengthDays      int
	IsSeasonal      bool       `gorm:"default:false"`
	SeasonKey       string     `gorm:"size:50"` // "advent", "lent", "holy-week", "pentecost", ""
	SeasonStart     *time.Time                   // nil for non-seasonal
	SeasonEnd       *time.Time
	RequiresPremium bool       `gorm:"default:true"`
	IsActive        bool       `gorm:"default:true"` // false = archived, hidden
	SortOrder       int        `gorm:"default:0"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// ReadingPlanEntry is a single day in a ReadingPlan.
// Reflection is optional curator-authored framing text for the day.
type ReadingPlanEntry struct {
	ID         uint   `gorm:"primaryKey;autoIncrement"`
	PlanID     uint   `gorm:"index"`
	DayNumber  int                           // 1-based
	VerseRef   string `gorm:"size:100"`   // e.g. "John 14:27"
	Reflection string `gorm:"type:text"`  // optional curator-authored framing text
	CreatedAt  time.Time
}

// UserPlanProgress tracks a user's enrollment and progress through a ReadingPlan.
// LastReadDay = 0 means enrolled but not yet started.
// LastReadDay = N means day N was the last day completed.
// CompletedAt is set when LastReadDay == plan.LengthDays.
// IsActive = false when the user has unenrolled.
type UserPlanProgress struct {
	ID          uint       `gorm:"primaryKey;autoIncrement"`
	UserID      uint       `gorm:"index;uniqueIndex:idx_user_plan_progress"`
	PlanID      uint       `gorm:"uniqueIndex:idx_user_plan_progress"`
	EnrolledAt  time.Time
	LastReadDay int        `gorm:"default:0"`
	CompletedAt *time.Time
	IsActive    bool       `gorm:"default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
