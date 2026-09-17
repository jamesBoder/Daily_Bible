package config

import "testing"

// TestGetDayDisciplines_ExcludesNotYetIntroduced guards against a real bug found
// 2026-09-16: GetDayDisciplines used to read the CURRENT DisciplineRotation table
// for every date, including historical ones. That meant adding a discipline to
// the rotation retroactively rewrote history — a long-time user's stats would
// show a discipline as "offered but missed" on days before it ever existed in
// their app. complete_reading_plan and complete_rosary were added 2026-07-21;
// dates before that must never include them.
func TestGetDayDisciplines_ExcludesNotYetIntroduced(t *testing.T) {
	before := GetDayDisciplines("2026-06-01") // pre-introduction, post-epoch
	for _, d := range before {
		if d.Key == "complete_reading_plan" || d.Key == "complete_rosary" {
			t.Errorf("2026-06-01 (before introduction) should not offer %q, got it in %v", d.Key, before)
		}
	}
	if len(before) == 0 {
		t.Error("2026-06-01 should still offer some disciplines (e.g. read_verse) — got none")
	}
}

// TestGetDayDisciplines_IncludesAfterIntroduction verifies dates on/after the
// introduction date behave exactly as before this fix — no regression for
// current or future dates.
func TestGetDayDisciplines_IncludesAfterIntroduction(t *testing.T) {
	onDay := GetDayDisciplines("2026-07-21")
	foundReadingPlan := false
	for _, d := range onDay {
		if d.Key == "complete_reading_plan" {
			foundReadingPlan = true
		}
	}
	if !foundReadingPlan {
		t.Errorf("2026-07-21 (introduction date, inclusive) should offer complete_reading_plan, got %v", onDay)
	}

	today := GetDayDisciplines("2026-09-16")
	if len(today) == 0 {
		t.Error("a normal current-day rotation should never be empty")
	}
}
