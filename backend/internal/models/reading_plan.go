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
// The enriched fields (Prayer, Application, Question, ContextNote, PassageRefs,
// ContentType, IsMemoryVerse) are all nullable — existing seed rows are unaffected.
type ReadingPlanEntry struct {
	ID           uint   `gorm:"primaryKey;autoIncrement"`
	PlanID       uint   `gorm:"index"`
	DayNumber    int                              // 1-based
	VerseRef     string `gorm:"size:100"`        // e.g. "John 14:27"
	Reflection   string `gorm:"type:text"`       // optional curator-authored framing text
	// Enriched fields (Part 1b)
	PassageRefs  string `gorm:"type:text"`       // JSON array of extra refs, e.g. ["Romans 5:1","Psalm 29:11"]
	Prayer       string `gorm:"type:text"`       // suggested prayer for the day (1–3 sentences)
	Application  string `gorm:"type:text"`       // one practical action to take today
	Question     string `gorm:"type:text"`       // journaling / reflection prompt
	ContextNote  string `gorm:"type:text"`       // brief historical or literary context
	ContentType  string `gorm:"size:30;default:'verse'"` // verse | passage | psalm | chapter | meditation
	IsMemoryVerse bool  `gorm:"default:false"`   // highlight as the week's memory verse
	PassageText    string `gorm:"type:text"`     // full passage text stored in seed; avoids verse-lookup for ranges
	DayTitle       string `gorm:"size:200"`      // e.g. "The Peace That Passes Understanding"
	// Interactive features (Part 2)
	QuizQuestion   string `gorm:"type:text"`     // comprehension check question; empty = skip
	QuizOptions    string `gorm:"type:text"`     // JSON: [{"label":"A","text":"...","correct":false}, ...]
	QuizExplanation string `gorm:"type:text"`    // shown after any answer selection
	WordStudies    string `gorm:"type:text"`     // JSON: {"word": {"original":"...","transliteration":"...","definition":"...","refs":[...]}}
	// Dig deeper (2h)
	DeepDiveText   string `gorm:"type:text"`     // extended commentary; empty = section hidden
	DeepDiveRefs   string `gorm:"type:text"`     // JSON array of further-study verse refs
	CreatedAt      time.Time
}

// UserPlanProgress tracks a user's enrollment and progress through a ReadingPlan.
// LastReadDay = 0 means enrolled but not yet started.
// LastReadDay = N means day N was the last day completed.
// CompletedAt is set when LastReadDay == plan.LengthDays.
// IsActive = false when the user has unenrolled.
// PlanStreak counts consecutive UTC-10 days the user has read this plan.
// LastPlanReadDate is "YYYY-MM-DD" in UTC-10 — stored as string to avoid timezone ambiguity.
type UserPlanProgress struct {
	ID                uint       `gorm:"primaryKey;autoIncrement"`
	UserID            uint       `gorm:"index;uniqueIndex:idx_user_plan_progress"`
	PlanID            uint       `gorm:"uniqueIndex:idx_user_plan_progress"`
	EnrolledAt        time.Time
	LastReadDay       int        `gorm:"default:0"`
	CompletedAt       *time.Time
	IsActive          bool       `gorm:"default:true"`
	PlanStreak        int        `gorm:"default:0"`
	LastPlanReadDate  *string    `gorm:"type:varchar(10)"` // "YYYY-MM-DD" in UTC-10
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
