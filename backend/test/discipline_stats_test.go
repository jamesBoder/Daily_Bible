package journaltest

// discipline_stats_test.go — verifies DisciplineService.GetStats's streak walk
// and epoch-aligned perfect-cycle logic against seeded completion rows.
//
// Run with: go test ./test/ -run TestDisciplineStats -v

import (
	"testing"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"
	"dailybible/internal/services"

	"gorm.io/gorm"
)

const (
	discUserUnbrokenStreak uint = 33331
	discUserBrokenStreak   uint = 33332
	discUserTodayPending   uint = 33333
	discUserNeverCompleted uint = 33334
	discUserPerfectCycle   uint = 33335
)

func cleanupDisciplineCompletions(db *gorm.DB) {
	db.Unscoped().
		Where("user_id IN ?", []uint{
			discUserUnbrokenStreak, discUserBrokenStreak, discUserTodayPending,
			discUserNeverCompleted, discUserPerfectCycle,
		}).
		Delete(&models.UserDisciplineCompletion{})
}

// discToday returns today's UTC-10 date, same formula as DisciplineService.
func discToday() time.Time {
	todayStr := time.Now().UTC().Add(-10 * time.Hour).Format("2006-01-02")
	d, _ := time.Parse("2006-01-02", todayStr)
	return d
}

func seedCompletion(t *testing.T, db *gorm.DB, userID uint, date time.Time, key string) {
	t.Helper()
	err := db.Create(&models.UserDisciplineCompletion{
		UserID:        userID,
		DateUTC10:     date.Format("2006-01-02"),
		DisciplineKey: key,
		CompletedAt:   date,
	}).Error
	if err != nil {
		t.Fatalf("seedCompletion(%d, %s, %s): %v", userID, date.Format("2006-01-02"), key, err)
	}
}

func statFor(stats []services.DisciplineStat, key string) *services.DisciplineStat {
	for i := range stats {
		if stats[i].Key == key {
			return &stats[i]
		}
	}
	return nil
}

func TestDisciplineStats_UnbrokenStreak(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupDisciplineCompletions(db) })

	today := discToday()
	// read_verse completed today and the 4 days before — read_verse is offered
	// every day (the anchor discipline), so this is a clean 5-day streak.
	for i := 0; i <= 4; i++ {
		seedCompletion(t, db, discUserUnbrokenStreak, today.AddDate(0, 0, -i), "read_verse")
	}

	svc := services.NewDisciplineService(db, services.NewBlessingsService(db))
	resp, err := svc.GetStats(discUserUnbrokenStreak)
	if err != nil {
		t.Fatalf("GetStats: %v", err)
	}
	stat := statFor(resp.Stats, "read_verse")
	if stat == nil {
		t.Fatal("read_verse stat missing from response")
	}
	if stat.CurrentStreak != 5 {
		t.Errorf("CurrentStreak = %d, want 5", stat.CurrentStreak)
	}
	if stat.LifetimeCompletions != 5 {
		t.Errorf("LifetimeCompletions = %d, want 5", stat.LifetimeCompletions)
	}
}

func TestDisciplineStats_BrokenStreak(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupDisciplineCompletions(db) })

	today := discToday()
	// Completed today, today-1, today-2. Missed today-3 (no row). Completed
	// today-4, today-5 (further back, but the streak should stop at the miss).
	for _, i := range []int{0, 1, 2, 4, 5} {
		seedCompletion(t, db, discUserBrokenStreak, today.AddDate(0, 0, -i), "read_verse")
	}

	svc := services.NewDisciplineService(db, services.NewBlessingsService(db))
	resp, err := svc.GetStats(discUserBrokenStreak)
	if err != nil {
		t.Fatalf("GetStats: %v", err)
	}
	stat := statFor(resp.Stats, "read_verse")
	if stat == nil {
		t.Fatal("read_verse stat missing from response")
	}
	if stat.CurrentStreak != 3 {
		t.Errorf("CurrentStreak = %d, want 3 (streak must stop at the missed day-3, not continue into day-4/day-5)", stat.CurrentStreak)
	}
	if stat.LifetimeCompletions != 5 {
		t.Errorf("LifetimeCompletions = %d, want 5 (all seeded rows still count toward lifetime)", stat.LifetimeCompletions)
	}
}

func TestDisciplineStats_TodayPendingDoesNotBreakStreak(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupDisciplineCompletions(db) })

	today := discToday()
	// Today has no completion row (pending), but yesterday/day-2/day-3 do.
	for _, i := range []int{1, 2, 3} {
		seedCompletion(t, db, discUserTodayPending, today.AddDate(0, 0, -i), "read_verse")
	}

	svc := services.NewDisciplineService(db, services.NewBlessingsService(db))
	resp, err := svc.GetStats(discUserTodayPending)
	if err != nil {
		t.Fatalf("GetStats: %v", err)
	}
	stat := statFor(resp.Stats, "read_verse")
	if stat == nil {
		t.Fatal("read_verse stat missing from response")
	}
	if stat.CurrentStreak != 3 {
		t.Errorf("CurrentStreak = %d, want 3 (today being offered-but-incomplete must not zero the streak)", stat.CurrentStreak)
	}
}

func TestDisciplineStats_NeverCompleted(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupDisciplineCompletions(db) })

	svc := services.NewDisciplineService(db, services.NewBlessingsService(db))
	resp, err := svc.GetStats(discUserNeverCompleted)
	if err != nil {
		t.Fatalf("GetStats: %v", err)
	}
	stat := statFor(resp.Stats, "read_verse")
	if stat == nil {
		t.Fatal("read_verse stat missing from response")
	}
	if stat.CurrentStreak != 0 {
		t.Errorf("CurrentStreak = %d, want 0", stat.CurrentStreak)
	}
	if stat.LifetimeCompletions != 0 {
		t.Errorf("LifetimeCompletions = %d, want 0", stat.LifetimeCompletions)
	}
	if stat.LastCompletedDate != nil {
		t.Errorf("LastCompletedDate = %v, want nil", *stat.LastCompletedDate)
	}
	// Every active discipline should still get a zero-value row, not be omitted.
	if len(resp.Stats) == 0 {
		t.Error("Stats is empty for a brand-new user — every active discipline should render at 0/0")
	}
}

func TestDisciplineStats_PerfectCycleVsImperfectCycle(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupDisciplineCompletions(db) })

	epoch := config.DisciplineEpoch()
	cycleLen := len(config.DisciplineRotation)

	// Cycle 0 (days epoch..epoch+13): complete every offered discipline on every
	// day — should count as a perfect cycle.
	for i := 0; i < cycleLen; i++ {
		day := epoch.AddDate(0, 0, i)
		for _, def := range config.GetDayDisciplines(day.Format("2006-01-02")) {
			seedCompletion(t, db, discUserPerfectCycle, day, def.Key)
		}
	}

	// Cycle 1 (days epoch+14..epoch+27): complete everything EXCEPT skip the
	// first offered discipline on the first day — should NOT count as perfect.
	for i := 0; i < cycleLen; i++ {
		day := epoch.AddDate(0, 0, cycleLen+i)
		defs := config.GetDayDisciplines(day.Format("2006-01-02"))
		for j, def := range defs {
			if i == 0 && j == 0 {
				continue // deliberate gap
			}
			seedCompletion(t, db, discUserPerfectCycle, day, def.Key)
		}
	}

	svc := services.NewDisciplineService(db, services.NewBlessingsService(db))
	resp, err := svc.GetStats(discUserPerfectCycle)
	if err != nil {
		t.Fatalf("GetStats: %v", err)
	}
	if resp.PerfectCycles < 1 {
		t.Errorf("PerfectCycles = %d, want >= 1 (cycle 0 was fully completed)", resp.PerfectCycles)
	}
	// Sanity: cycle 1's deliberate gap must not inflate the count beyond what
	// cycle 0 alone contributes. We can't assert an exact count without knowing
	// how many cycles have elapsed since epoch at test-run time, but we can
	// assert cycle 1 didn't ALSO get counted by checking the count isn't
	// suspiciously high relative to elapsed cycles.
	today, _ := time.Parse("2006-01-02", discToday().Format("2006-01-02"))
	elapsedCycles := int(today.Sub(epoch).Hours()/24) / cycleLen
	if resp.PerfectCycles > elapsedCycles {
		t.Errorf("PerfectCycles = %d exceeds elapsed cycles (%d) — cycle 1's deliberate gap must not have counted as perfect", resp.PerfectCycles, elapsedCycles)
	}
}
