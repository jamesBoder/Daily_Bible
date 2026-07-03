package services

import (
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"errors"
	"log"
	"time"

	"gorm.io/gorm"
)

const (
	maxActivePlansPremium      = 4
	maxActivePlansFree         = 2
	BlessingsPerPlanDay        = 10
	BlessingsForPlanCompletion = 50
	journalExcerptRunes        = 80
)

var (
	ErrPlanNotFound    = errors.New("plan not found")
	ErrPlanPremium     = errors.New("plan requires premium subscription")
	ErrAlreadyEnrolled = errors.New("already enrolled in this plan")
	ErrMaxPlansReached = errors.New("maximum active plans reached")
	ErrNotEnrolled     = errors.New("not enrolled in this plan")
	ErrPlanComplete    = errors.New("plan already completed")
)

// ReadingPlanSummary is the shape returned for library listings.
type ReadingPlanSummary struct {
	ID              uint                 `json:"id"`
	Slug            string               `json:"slug"`
	Title           string               `json:"title"`
	Description     string               `json:"description"`
	LengthDays      int                  `json:"length_days"`
	IsSeasonal      bool                 `json:"is_seasonal"`
	SeasonKey       string               `json:"season_key"`
	RequiresPremium bool                 `json:"requires_premium"`
	IsSeasonActive  bool                 `json:"is_season_active"`
	UserProgress    *PlanProgressSummary `json:"user_progress,omitempty"`
}

// PlanProgressSummary is embedded when the user is enrolled.
type PlanProgressSummary struct {
	LastReadDay int        `json:"last_read_day"`
	CompletedAt *time.Time `json:"completed_at"`
	IsActive    bool       `json:"is_active"`
	PlanStreak  int        `json:"plan_streak"`
}

// ReadingPlanDetail includes the full entry list.
type ReadingPlanDetail struct {
	ReadingPlanSummary
	Entries []ReadingPlanEntryResponse `json:"entries"`
}

// PrevDaySummary is the previous day's recap included in the today-entry response
// when the user has at least one day already read. JournalExcerpt is the first
// 80 chars of the user's journal entry for that verse ref; empty when none exists.
type PrevDaySummary struct {
	VerseRef       string `json:"verse_ref"`
	DayTitle       string `json:"day_title"`
	JournalExcerpt string `json:"journal_excerpt"`
}

// ReadingPlanEntryResponse is the JSON shape for a single plan day entry.
// Enriched fields (prayer, application, question, context_note, content_type,
// is_memory_verse) are included when populated; they default to empty/false for
// legacy entries that pre-date Part 1b.
// VerseText is resolved from the local verses table in GetPlanForToday so the
// client never needs a second round-trip to /api/verses/search.
type ReadingPlanEntryResponse struct {
	ID              uint            `json:"id"`
	DayNumber       int             `json:"day_number"`
	DayTitle        string          `json:"day_title"`
	VerseRef        string          `json:"verse_ref"`
	VerseText       string          `json:"verse_text"` // passage_text when seeded; otherwise resolved from local DB
	Reflection      string          `json:"reflection"`
	PassageRefs     string          `json:"passage_refs"`
	Prayer          string          `json:"prayer"`
	Application     string          `json:"application"`
	Question        string          `json:"question"`
	ContextNote     string          `json:"context_note"`
	ContentType     string          `json:"content_type"`
	IsMemoryVerse   bool            `json:"is_memory_verse"`
	QuizQuestion    string          `json:"quiz_question"`
	QuizOptions     string          `json:"quiz_options"` // JSON array
	QuizExplanation string          `json:"quiz_explanation"`
	WordStudies     string          `json:"word_studies"`       // JSON object keyed by word
	DeepDiveText    string          `json:"deep_dive_text"`     // extended commentary; empty = section hidden
	DeepDiveRefs    string          `json:"deep_dive_refs"`     // JSON array of further-study refs
	PrevDay         *PrevDaySummary `json:"prev_day,omitempty"` // previous day recap; nil on day 1
}

// UserPlanProgressDetail includes plan metadata alongside progress.
type UserPlanProgressDetail struct {
	PlanID      uint       `json:"plan_id"`
	Slug        string     `json:"slug"`
	Title       string     `json:"title"`
	LengthDays  int        `json:"length_days"`
	LastReadDay int        `json:"last_read_day"`
	CompletedAt *time.Time `json:"completed_at"`
	EnrolledAt  time.Time  `json:"enrolled_at"`
	PlanStreak  int        `json:"plan_streak"`
}

// entryToResponse maps a ReadingPlanEntry model to its JSON response shape.
// ContentType defaults to "verse" when the DB column is empty (legacy rows).
func entryToResponse(e models.ReadingPlanEntry) ReadingPlanEntryResponse {
	ct := e.ContentType
	if ct == "" {
		ct = "verse"
	}
	return ReadingPlanEntryResponse{
		ID:              e.ID,
		DayNumber:       e.DayNumber,
		DayTitle:        e.DayTitle,
		VerseRef:        e.VerseRef,
		VerseText:       e.PassageText, // pre-seeded passage text; GetPlanForToday falls back to verse lookup if empty
		Reflection:      e.Reflection,
		PassageRefs:     e.PassageRefs,
		Prayer:          e.Prayer,
		Application:     e.Application,
		Question:        e.Question,
		ContextNote:     e.ContextNote,
		ContentType:     ct,
		IsMemoryVerse:   e.IsMemoryVerse,
		QuizQuestion:    e.QuizQuestion,
		QuizOptions:     e.QuizOptions,
		QuizExplanation: e.QuizExplanation,
		WordStudies:     e.WordStudies,
		DeepDiveText:    e.DeepDiveText,
		DeepDiveRefs:    e.DeepDiveRefs,
	}
}

// ReadingPlanService handles all reading plan operations.
type ReadingPlanService struct {
	db                  *gorm.DB
	verseRepo           repository.VerseRepository
	subscriptionChecker SubscriptionChecker
	blessingsService    *BlessingsService
}

// NewReadingPlanService creates a new ReadingPlanService.
func NewReadingPlanService(db *gorm.DB, verseRepo repository.VerseRepository, subscriptionChecker SubscriptionChecker, blessingsService *BlessingsService) *ReadingPlanService {
	return &ReadingPlanService{
		db:                  db,
		verseRepo:           verseRepo,
		subscriptionChecker: subscriptionChecker,
		blessingsService:    blessingsService,
	}
}

// GetLibrary returns all active plans. Free users only see non-premium plans.
// When userID > 0, the user's progress is embedded in each plan.
func (s *ReadingPlanService) GetLibrary(userID uint, isPremium bool) ([]ReadingPlanSummary, error) {
	var plans []models.ReadingPlan
	query := s.db.Where("is_active = true")
	if !isPremium {
		query = query.Where("requires_premium = false")
	}
	if err := query.Order("sort_order ASC, created_at ASC").Find(&plans).Error; err != nil {
		return nil, err
	}

	now := time.Now().UTC().Add(-10 * time.Hour)
	summaries := make([]ReadingPlanSummary, 0, len(plans))
	for _, p := range plans {
		sum := planToSummary(p, now)
		if userID > 0 {
			var prog models.UserPlanProgress
			if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, p.ID).
				First(&prog).Error; err == nil {
				sum.UserProgress = &PlanProgressSummary{
					LastReadDay: prog.LastReadDay,
					CompletedAt: prog.CompletedAt,
					IsActive:    prog.IsActive,
					PlanStreak:  prog.PlanStreak,
				}
			}
		}
		summaries = append(summaries, sum)
	}
	return summaries, nil
}

// GetPlan returns full plan details including all entries.
func (s *ReadingPlanService) GetPlan(slug string, userID uint, isPremium bool) (*ReadingPlanDetail, error) {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, err
	}
	if plan.RequiresPremium && !isPremium {
		return nil, ErrPlanPremium
	}

	var entries []models.ReadingPlanEntry
	if err := s.db.Where("plan_id = ?", plan.ID).Order("day_number ASC").Find(&entries).Error; err != nil {
		return nil, err
	}

	now := time.Now().UTC().Add(-10 * time.Hour)
	detail := &ReadingPlanDetail{
		ReadingPlanSummary: planToSummary(plan, now),
		Entries:            make([]ReadingPlanEntryResponse, 0, len(entries)),
	}

	if userID > 0 {
		var prog models.UserPlanProgress
		if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).
			First(&prog).Error; err == nil {
			detail.UserProgress = &PlanProgressSummary{
				LastReadDay: prog.LastReadDay,
				CompletedAt: prog.CompletedAt,
				IsActive:    prog.IsActive,
				PlanStreak:  prog.PlanStreak,
			}
		}
	}

	for _, e := range entries {
		detail.Entries = append(detail.Entries, entryToResponse(e))
	}
	return detail, nil
}

// EnrollUser creates a UserPlanProgress row for the user.
func (s *ReadingPlanService) EnrollUser(userID uint, slug string, isPremium bool) (*models.UserPlanProgress, error) {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, err
	}
	if plan.RequiresPremium && !isPremium {
		return nil, ErrPlanPremium
	}

	// Check for active enrollment first.
	var existing models.UserPlanProgress
	err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).First(&existing).Error
	if err == nil {
		return nil, ErrAlreadyEnrolled
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Enforce the active-plan cap before either path below — reactivating a
	// previously-left plan adds an active plan just like a fresh enrollment.
	cap := maxActivePlansFree
	if isPremium {
		cap = maxActivePlansPremium
	}
	var count int64
	if err := s.db.Model(&models.UserPlanProgress{}).
		Where("user_id = ? AND is_active = true AND completed_at IS NULL", userID).
		Count(&count).Error; err != nil {
		return nil, err
	}
	if int(count) >= cap {
		return nil, ErrMaxPlansReached
	}

	// Check for an inactive enrollment from a previous unenroll. The unique index
	// on (user_id, plan_id) prevents creating a second row — reactivate instead.
	var inactive models.UserPlanProgress
	if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = false", userID, plan.ID).
		First(&inactive).Error; err == nil {
		// Reactivate with reset progress.
		inactive.IsActive = true
		inactive.LastReadDay = 0
		inactive.CompletedAt = nil
		inactive.EnrolledAt = time.Now().UTC()
		inactive.PlanStreak = 0
		inactive.LastPlanReadDate = nil
		if err := s.db.Save(&inactive).Error; err != nil {
			return nil, err
		}
		return &inactive, nil
	}

	prog := models.UserPlanProgress{
		UserID:     userID,
		PlanID:     plan.ID,
		EnrolledAt: time.Now().UTC(),
		IsActive:   true,
	}
	if err := s.db.Create(&prog).Error; err != nil {
		return nil, err
	}
	return &prog, nil
}

// AdvanceDay marks the next day as read, credits Blessings, and returns updated progress.
// Returns the progress row, a bool indicating whether the plan just completed, and the
// number of blessings actually credited (BlessingsPerPlanDay or BlessingsForPlanCompletion).
func (s *ReadingPlanService) AdvanceDay(userID uint, slug string) (*models.UserPlanProgress, bool, int, error) {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, 0, ErrPlanNotFound
		}
		return nil, false, 0, err
	}

	var prog models.UserPlanProgress
	if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).
		First(&prog).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, 0, ErrNotEnrolled
		}
		return nil, false, 0, err
	}
	if prog.CompletedAt != nil {
		return nil, false, 0, ErrPlanComplete
	}

	prog.LastReadDay++
	justCompleted := prog.LastReadDay >= plan.LengthDays
	if justCompleted {
		now := time.Now().UTC()
		prog.CompletedAt = &now
	}

	// Compute per-plan streak using UTC-10 date boundary.
	utc10 := time.Now().UTC().Add(-10 * time.Hour)
	todayStr := utc10.Format("2006-01-02")
	yesterdayStr := utc10.AddDate(0, 0, -1).Format("2006-01-02")
	switch {
	case prog.LastPlanReadDate == nil:
		prog.PlanStreak = 1
	case *prog.LastPlanReadDate == todayStr:
		// Already counted today — leave streak unchanged.
	case *prog.LastPlanReadDate == yesterdayStr:
		prog.PlanStreak++
	default:
		prog.PlanStreak = 1
	}
	dateStr := todayStr
	prog.LastPlanReadDate = &dateStr

	if err := s.db.Save(&prog).Error; err != nil {
		return nil, false, 0, err
	}

	amount := BlessingsPerPlanDay
	reason := "read_plan_entry"
	if justCompleted {
		amount = BlessingsForPlanCompletion
		reason = "complete_reading_plan"
	}
	if _, err := s.blessingsService.Credit(userID, amount, reason, 1.0); err != nil {
		log.Printf("blessings credit failed for user %d reason %s: %v", userID, reason, err)
	}

	return &prog, justCompleted, amount, nil
}

// GetActiveEnrollments returns the user's active plan enrollments with plan metadata.
func (s *ReadingPlanService) GetActiveEnrollments(userID uint) ([]UserPlanProgressDetail, error) {
	type row struct {
		PlanID      uint
		Slug        string
		Title       string
		LengthDays  int
		LastReadDay int
		CompletedAt *time.Time
		EnrolledAt  time.Time
		PlanStreak  int
	}

	var rows []row
	if err := s.db.Table("user_plan_progresses upp").
		Select("upp.plan_id, rp.slug, rp.title, rp.length_days, upp.last_read_day, upp.completed_at, upp.enrolled_at, upp.plan_streak").
		Joins("JOIN reading_plans rp ON rp.id = upp.plan_id").
		Where("upp.user_id = ? AND upp.is_active = true", userID).
		Order("upp.enrolled_at DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	out := make([]UserPlanProgressDetail, 0, len(rows))
	for _, r := range rows {
		out = append(out, UserPlanProgressDetail(r))
	}
	return out, nil
}

// GetPlanForToday returns the next unread day entry for the user in the given plan.
func (s *ReadingPlanService) GetPlanForToday(userID uint, slug string) (*ReadingPlanEntryResponse, error) {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, err
	}

	var prog models.UserPlanProgress
	if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).
		First(&prog).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotEnrolled
		}
		return nil, err
	}

	nextDay := prog.LastReadDay + 1
	if nextDay > plan.LengthDays {
		nextDay = plan.LengthDays
	}

	var entry models.ReadingPlanEntry
	if err := s.db.Where("plan_id = ? AND day_number = ?", plan.ID, nextDay).First(&entry).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPlanNotFound
		}
		return nil, err
	}

	resp := entryToResponse(entry)

	// entryToResponse already sets VerseText from PassageText when it is seeded.
	// Fall back to a local DB lookup only for legacy entries that have no stored passage text.
	if resp.VerseText == "" {
		if verse, err := s.verseRepo.GetByReference(entry.VerseRef); err == nil && verse != nil {
			resp.VerseText = verse.Text
		}
	}

	// Build the previous-day recap when the user has already read at least one day.
	if prog.LastReadDay > 0 {
		var prevEntry models.ReadingPlanEntry
		if err := s.db.Where("plan_id = ? AND day_number = ?", plan.ID, prog.LastReadDay).
			First(&prevEntry).Error; err == nil {
			prev := &PrevDaySummary{
				VerseRef: prevEntry.VerseRef,
				DayTitle: prevEntry.DayTitle,
			}
			// Try to attach the first 80 chars of any journal entry the user wrote for that verse.
			var je models.JournalEntry
			if err := s.db.Where("user_id = ? AND linked_verse = ? AND deleted_at IS NULL", userID, prevEntry.VerseRef).
				Order("created_at DESC").
				First(&je).Error; err == nil && je.ContentPlain != "" {
				excerpt := je.ContentPlain
				if len([]rune(excerpt)) > journalExcerptRunes {
					runes := []rune(excerpt)
					excerpt = string(runes[:journalExcerptRunes]) + "…"
				}
				prev.JournalExcerpt = excerpt
			}
			resp.PrevDay = prev
		}
	}

	return &resp, nil
}

// GetCurrentSeasonalPlan returns the seasonal plan whose season dates include today.
func (s *ReadingPlanService) GetCurrentSeasonalPlan() (*ReadingPlanSummary, error) {
	now := time.Now().UTC().Add(-10 * time.Hour)
	var plan models.ReadingPlan
	err := s.db.Where(
		"is_seasonal = true AND is_active = true AND season_start <= ? AND season_end >= ?",
		now, now,
	).First(&plan).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	sum := planToSummary(plan, now)
	return &sum, nil
}

// Unenroll marks the user's progress row as inactive.
func (s *ReadingPlanService) Unenroll(userID uint, slug string) error {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrPlanNotFound
		}
		return err
	}
	result := s.db.Model(&models.UserPlanProgress{}).
		Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).
		Update("is_active", false)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrNotEnrolled
	}
	return nil
}

func planToSummary(p models.ReadingPlan, now time.Time) ReadingPlanSummary {
	seasonActive := false
	if p.IsSeasonal && p.SeasonStart != nil && p.SeasonEnd != nil {
		seasonActive = !now.Before(*p.SeasonStart) && !now.After(*p.SeasonEnd)
	}
	return ReadingPlanSummary{
		ID:              p.ID,
		Slug:            p.Slug,
		Title:           p.Title,
		Description:     p.Description,
		LengthDays:      p.LengthDays,
		IsSeasonal:      p.IsSeasonal,
		SeasonKey:       p.SeasonKey,
		RequiresPremium: p.RequiresPremium,
		IsSeasonActive:  seasonActive,
	}
}
