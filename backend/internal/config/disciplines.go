package config

import "time"

// disciplineEpochStr is the UTC-10 date for cycle day 0.
// Do not change after launch — shifting the epoch changes disciplines for all users.
const disciplineEpochStr = "2026-05-01"

// DisciplineDef describes a single discipline type.
type DisciplineDef struct {
	Key             string
	Blessings       int
	Active          bool
	RequiresPremium bool
}

// DisciplineDefinitions is the full catalogue of disciplines, active and inactive.
// To add a new discipline: append here, add its key to DisciplineRotation rows, add i18n key.
var DisciplineDefinitions = []DisciplineDef{
	{Key: "read_verse", Blessings: 5, Active: true},
	{Key: "write_journal", Blessings: 8, Active: true},
	{Key: "favorite_verse", Blessings: 5, Active: true},
	{Key: "share_verse", Blessings: 5, Active: true},
	{Key: "annotate_verse", Blessings: 10, Active: true, RequiresPremium: true},
	{Key: "advance_plan_day", Blessings: 12, Active: true},
	{Key: "solve_manna_any", Blessings: 5, Active: true},
	{Key: "solve_manna_4", Blessings: 10, Active: true},
	{Key: "write_reflection_50", Blessings: 15, Active: true},
	{Key: "complete_reading_plan", Blessings: 20, Active: true},
	{Key: "react_community", Blessings: 5, Active: false},
	{Key: "complete_rosary", Blessings: 15, Active: true, RequiresPremium: true},
}

// disciplineMap is an O(1) lookup built once at package init from DisciplineDefinitions.
var disciplineMap = func() map[string]DisciplineDef {
	m := make(map[string]DisciplineDef, len(DisciplineDefinitions))
	for _, d := range DisciplineDefinitions {
		m[d.Key] = d
	}
	return m
}()

// DisciplineRotation is the 14-day ordered schedule.
// Cycle length = len(DisciplineRotation) — never hardcoded elsewhere.
// Harder disciplines (write_reflection_50 ×2, solve_manna_4 ×2) appear less often.
// complete_reading_plan is an "anchor" discipline (present in every row, like
// read_verse) since finishing a plan is event-driven, not schedulable to a
// specific day — see DisciplineEpoch's doc comment for why this is safe to do
// without touching the epoch. complete_rosary appears twice (a deliberate,
// premium reflective practice, not a daily tap), similar cadence to annotate_verse.
var DisciplineRotation = [][]string{
	{"read_verse", "write_journal", "complete_reading_plan"},
	{"read_verse", "favorite_verse", "solve_manna_any", "complete_reading_plan"},
	{"read_verse", "share_verse", "complete_reading_plan", "complete_rosary"},
	{"read_verse", "annotate_verse", "write_reflection_50", "complete_reading_plan"},
	{"read_verse", "solve_manna_4", "complete_reading_plan"},
	{"read_verse", "advance_plan_day", "write_journal", "complete_reading_plan"},
	{"read_verse", "favorite_verse", "complete_reading_plan"},
	{"read_verse", "share_verse", "solve_manna_any", "complete_reading_plan"},
	{"read_verse", "annotate_verse", "complete_reading_plan"},
	{"read_verse", "write_reflection_50", "advance_plan_day", "complete_reading_plan"},
	{"read_verse", "solve_manna_any", "complete_reading_plan", "complete_rosary"},
	{"read_verse", "write_journal", "favorite_verse", "complete_reading_plan"},
	{"read_verse", "share_verse", "solve_manna_4", "complete_reading_plan"},
	{"read_verse", "annotate_verse", "advance_plan_day", "complete_reading_plan"},
}

// DisciplineEpoch returns the parsed epoch date (cycle day 0), for callers that
// need to bound a date-range walk at the same boundary GetDayDisciplines uses.
// GetDayDisciplines itself clamps negative day-offsets to 0 rather than
// rejecting pre-epoch dates, so any backward walk must stop here explicitly
// rather than relying on that clamp.
func DisciplineEpoch() time.Time {
	epoch, _ := time.Parse("2006-01-02", disciplineEpochStr)
	return epoch
}

// GetDayDisciplines returns the active disciplines for a given UTC-10 date string.
// Inactive keys are silently skipped. Cycle day is pure date math with no timezone ambiguity.
func GetDayDisciplines(dateUTC10 string) []DisciplineDef {
	today, err := time.Parse("2006-01-02", dateUTC10)
	if err != nil {
		return nil
	}
	epoch, _ := time.Parse("2006-01-02", disciplineEpochStr)
	days := int(today.Sub(epoch).Hours() / 24)
	if days < 0 {
		days = 0
	}
	cycleDay := days % len(DisciplineRotation)
	keys := DisciplineRotation[cycleDay]
	result := make([]DisciplineDef, 0, len(keys))
	for _, k := range keys {
		if d, ok := disciplineMap[k]; ok && d.Active {
			result = append(result, d)
		}
	}
	return result
}

// GetDisciplineDef returns the definition for a key, or false if not found.
func GetDisciplineDef(key string) (DisciplineDef, bool) {
	d, ok := disciplineMap[key]
	return d, ok
}
