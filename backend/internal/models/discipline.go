package models

import "time"

// UserDisciplineCompletion records one discipline completion per user per UTC-10 day.
// The composite unique index on (UserID, DateUTC10, DisciplineKey) is created automatically
// by GORM AutoMigrate from the uniqueIndex struct tags — no explicit CREATE INDEX needed.
type UserDisciplineCompletion struct {
	ID                uint   `gorm:"primaryKey;autoIncrement"`
	UserID            uint   `gorm:"type:uint;uniqueIndex:idx_discipline_completion"`
	DateUTC10         string `gorm:"size:10;uniqueIndex:idx_discipline_completion"`
	DisciplineKey     string `gorm:"size:50;uniqueIndex:idx_discipline_completion"`
	BlessingsCredited int
	CompletedAt       time.Time
}
