package services

import (
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"errors"
	"time"

	"gorm.io/gorm"
)

const maxActivePlans = 3

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
}

// ReadingPlanDetail includes the full entry list.
type ReadingPlanDetail struct {
	ReadingPlanSummary
	Entries []ReadingPlanEntryResponse `json:"entries"`
}

// ReadingPlanEntryResponse is the JSON shape for a single plan day entry.
// Enriched fields (prayer, application, question, context_note, content_type,
// is_memory_verse) are included when populated; they default to empty/false for
// legacy entries that pre-date Part 1b.
// VerseText is resolved from the local verses table in GetPlanForToday so the
// client never needs a second round-trip to /api/verses/search.
type ReadingPlanEntryResponse struct {
	ID            uint   `json:"id"`
	DayNumber     int    `json:"day_number"`
	VerseRef      string `json:"verse_ref"`
	VerseText     string `json:"verse_text"`     // resolved locally; empty when ref not in DB
	Reflection    string `json:"reflection"`
	PassageRefs   string `json:"passage_refs"`
	Prayer        string `json:"prayer"`
	Application   string `json:"application"`
	Question      string `json:"question"`
	ContextNote   string `json:"context_note"`
	ContentType   string `json:"content_type"`
	IsMemoryVerse bool   `json:"is_memory_verse"`
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
}

// entryToResponse maps a ReadingPlanEntry model to its JSON response shape.
// ContentType defaults to "verse" when the DB column is empty (legacy rows).
func entryToResponse(e models.ReadingPlanEntry) ReadingPlanEntryResponse {
	ct := e.ContentType
	if ct == "" {
		ct = "verse"
	}
	return ReadingPlanEntryResponse{
		ID:            e.ID,
		DayNumber:     e.DayNumber,
		VerseRef:      e.VerseRef,
		Reflection:    e.Reflection,
		PassageRefs:   e.PassageRefs,
		Prayer:        e.Prayer,
		Application:   e.Application,
		Question:      e.Question,
		ContextNote:   e.ContextNote,
		ContentType:   ct,
		IsMemoryVerse: e.IsMemoryVerse,
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

	now := time.Now().UTC()
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

	now := time.Now().UTC()
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

	// Check for an inactive enrollment from a previous unenroll. The unique index
	// on (user_id, plan_id) prevents creating a second row — reactivate instead.
	var inactive models.UserPlanProgress
	if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = false", userID, plan.ID).
		First(&inactive).Error; err == nil {
		// Reactivate with reset progress.
		inactive.IsActive    = true
		inactive.LastReadDay = 0
		inactive.CompletedAt = nil
		inactive.EnrolledAt  = time.Now().UTC()
		if err := s.db.Save(&inactive).Error; err != nil {
			return nil, err
		}
		return &inactive, nil
	}

	cap := 1
	if isPremium {
		cap = maxActivePlans
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
// Returns the progress row and a bool indicating whether the plan just completed.
func (s *ReadingPlanService) AdvanceDay(userID uint, slug string) (*models.UserPlanProgress, bool, error) {
	var plan models.ReadingPlan
	if err := s.db.Where("slug = ? AND is_active = true", slug).First(&plan).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, ErrPlanNotFound
		}
		return nil, false, err
	}

	var prog models.UserPlanProgress
	if err := s.db.Where("user_id = ? AND plan_id = ? AND is_active = true", userID, plan.ID).
		First(&prog).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, false, ErrNotEnrolled
		}
		return nil, false, err
	}
	if prog.CompletedAt != nil {
		return nil, false, ErrPlanComplete
	}

	prog.LastReadDay++
	justCompleted := prog.LastReadDay >= plan.LengthDays
	if justCompleted {
		now := time.Now().UTC()
		prog.CompletedAt = &now
	}
	if err := s.db.Save(&prog).Error; err != nil {
		return nil, false, err
	}

	blessings := s.blessingsService
	uid := userID
	completed := justCompleted
	go func() {
		defer func() { recover() }() //nolint:errcheck
		amount := 10
		reason := "read_plan_entry"
		if completed {
			amount = 50
			reason = "complete_reading_plan"
		}
		_ , _ = blessings.Credit(uid, amount, reason, 1.0)
	}()

	return &prog, justCompleted, nil
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
	}

	var rows []row
	if err := s.db.Table("user_plan_progresses upp").
		Select("upp.plan_id, rp.slug, rp.title, rp.length_days, upp.last_read_day, upp.completed_at, upp.enrolled_at").
		Joins("JOIN reading_plans rp ON rp.id = upp.plan_id").
		Where("upp.user_id = ? AND upp.is_active = true", userID).
		Order("upp.enrolled_at DESC").
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	out := make([]UserPlanProgressDetail, 0, len(rows))
	for _, r := range rows {
		out = append(out, UserPlanProgressDetail{
			PlanID:      r.PlanID,
			Slug:        r.Slug,
			Title:       r.Title,
			LengthDays:  r.LengthDays,
			LastReadDay: r.LastReadDay,
			CompletedAt: r.CompletedAt,
			EnrolledAt:  r.EnrolledAt,
		})
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

	// Resolve verse text from the local DB — no external API call needed.
	// This eliminates the second round-trip that Option A required on the client.
	// Best-effort: if the reference isn't in the DB (multi-verse range, unknown
	// formatting), VerseText stays empty and the frontend falls back gracefully.
	if verse, err := s.verseRepo.GetByReference(entry.VerseRef); err == nil && verse != nil {
		resp.VerseText = verse.Text
	}

	return &resp, nil
}

// GetCurrentSeasonalPlan returns the seasonal plan whose season dates include today.
func (s *ReadingPlanService) GetCurrentSeasonalPlan() (*ReadingPlanSummary, error) {
	now := time.Now().UTC()
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
