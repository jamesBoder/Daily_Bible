package handlers

// imports

import (
	"fmt"
	"log"
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"dailybible/internal/config"
	"dailybible/internal/models"
	"dailybible/internal/password"
	"dailybible/internal/repository"
	"dailybible/internal/services"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

// usernameRegex allows letters, digits, underscores, and hyphens (3–30 chars).
var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_\-]{3,30}$`)

// rateBucket is a per-user sliding-window counter used by checkRateLimit.
type rateBucket struct {
	mu    sync.Mutex
	times []time.Time
}

// checkRateLimit returns true if the request is within the allowed rate.
// It prunes timestamps outside the window and records the new request.
func checkRateLimit(m *sync.Map, key uint, max int, window time.Duration) bool {
	actual, _ := m.LoadOrStore(key, &rateBucket{})
	b := actual.(*rateBucket)
	b.mu.Lock()
	defer b.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-window)
	valid := b.times[:0]
	for _, t := range b.times {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	b.times = valid
	if len(b.times) >= max {
		return false
	}
	b.times = append(b.times, now)
	return true
}

// ProfileHandler struct

type ProfileHandler struct {
	userRepo            repository.UserRepository
	favoriteRepo        repository.FavoriteRepository
	historyRepo         repository.HistoryRepository
	commentRepo         *repository.CommentRepository
	passwordHistoryRepo repository.PasswordHistoryRepository
	emailService        *services.EmailService
	emailValidator      *services.EmailValidationService
	validator           *validator.Validate
	streakService       *services.StreakService
	blessingsService    *services.BlessingsService
	settingsService     *services.SettingsService
	db                  *gorm.DB
	// per-user rate limiters (sliding window, in-memory)
	updateLimiter sync.Map // 5 req / 60 s — profile update
	availLimiter  sync.Map // 20 req / 60 s — availability check
}

// constructor init handler with dependencies

func NewProfileHandler(
	userRepo repository.UserRepository,
	favoriteRepo repository.FavoriteRepository,
	historyRepo repository.HistoryRepository,
	commentRepo *repository.CommentRepository,
	passwordHistoryRepo repository.PasswordHistoryRepository,
	emailService *services.EmailService,
	emailValidator *services.EmailValidationService,
	validator *validator.Validate,
	streakService *services.StreakService,
	blessingsService *services.BlessingsService,
	settingsService *services.SettingsService,
	db *gorm.DB,
) *ProfileHandler {
	return &ProfileHandler{
		userRepo:            userRepo,
		favoriteRepo:        favoriteRepo,
		historyRepo:         historyRepo,
		commentRepo:         commentRepo,
		passwordHistoryRepo: passwordHistoryRepo,
		emailService:        emailService,
		emailValidator:      emailValidator,
		validator:           validator,
		streakService:       streakService,
		blessingsService:    blessingsService,
		settingsService:     settingsService,
		db:                  db,
	}
}

// CheckAvailability checks if a username or email is already taken.
// Query params: ?username=foo  or  ?email=foo@bar.com
// Returns {"available": true/false} — the authenticated user's own values are always available.
func (h *ProfileHandler) CheckAvailability(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if !checkRateLimit(&h.availLimiter, userID.(uint), 20, time.Minute) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many requests — please slow down"})
		return
	}

	if username := c.Query("username"); username != "" {
		existing, _ := h.userRepo.GetByUsername(username)
		available := existing == nil || existing.ID == userID.(uint)
		c.JSON(http.StatusOK, gin.H{"available": available})
		return
	}

	if email := c.Query("email"); email != "" {
		existing, _ := h.userRepo.GetByEmail(email)
		available := existing == nil || existing.ID == userID.(uint)
		c.JSON(http.StatusOK, gin.H{"available": available})
		return
	}

	c.JSON(http.StatusBadRequest, gin.H{"error": "Provide 'username' or 'email' query param"})
}

// GetProfile handler
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID") 
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// fetch user from userRepo
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	resp := gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	}
	if user.PendingEmail != nil && *user.PendingEmail != "" {
		resp["pending_email"] = *user.PendingEmail
	}
	c.JSON(http.StatusOK, resp)
}

// GetProfileAggregate returns aggregated profile data for the profile page
func (h *ProfileHandler) GetProfileAggregate(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	uid := userID.(uint)

	// ── Batch 1: user + settings (independent; streak needs timezone from settings) ──
	var (
		user     *models.User
		userErr  error
		settings *models.UserSettings
	)
	var wg1 sync.WaitGroup
	wg1.Add(2)
	go func() {
		defer wg1.Done()
		user, userErr = h.userRepo.GetByID(uid)
	}()
	go func() {
		defer wg1.Done()
		var err error
		settings, err = h.settingsService.GetUserSettings(uid)
		if err != nil {
			settings = &models.UserSettings{PreferredTimezone: "UTC"}
		}
	}()
	wg1.Wait()

	if userErr != nil || user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	// ── Batch 2: 8 independent queries in parallel ────────────────────────────
	var (
		streak             *models.UserStreak
		streakRecoverable  bool
		balance            int
		favCount           int64
		histCount          int64
		commentCount       int64
		activeDaysCount    int64
		achievedMilestones []models.UserMilestone
		undismissed        models.UserMilestone
		hasUndismissed     bool
	)

	var wg2 sync.WaitGroup
	wg2.Add(8)

	go func() {
		defer wg2.Done()
		var err error
		streak, streakRecoverable, err = h.streakService.GetStreakSummary(uid, settings.PreferredTimezone)
		if err != nil {
			streak = &models.UserStreak{}
		}
	}()
	go func() {
		defer wg2.Done()
		balance, _ = h.blessingsService.GetBalance(uid)
	}()
	go func() {
		defer wg2.Done()
		favCount, _ = h.favoriteRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg2.Done()
		histCount, _ = h.historyRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg2.Done()
		commentCount, _ = h.commentRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg2.Done()
		h.db.Model(&models.UserActivityLog{}).
			Where("user_id = ? AND action_type = 'daily_engagement'", uid).
			Count(&activeDaysCount)
	}()
	go func() {
		defer wg2.Done()
		h.db.Where("user_id = ?", uid).Find(&achievedMilestones)
	}()
	go func() {
		defer wg2.Done()
		hasUndismissed = h.db.
			Where("user_id = ? AND celebration_dismissed_at IS NULL", uid).
			Order("achieved_at DESC").
			First(&undismissed).Error == nil
	}()

	wg2.Wait()

	achievedMap := make(map[string]*models.UserMilestone, len(achievedMilestones))
	for i := range achievedMilestones {
		achievedMap[achievedMilestones[i].MilestoneKey] = &achievedMilestones[i]
	}

	// Build the milestones list (all 9 defs merged with achieved data).
	type milestoneItem struct {
		Key              string  `json:"key"`
		DaysRequired     int     `json:"days_required"`
		Name             string  `json:"name"`
		BlessingsAwarded int     `json:"blessings_awarded"`
		Earned           bool    `json:"earned"`
		AchievedAt       *string `json:"achieved_at,omitempty"`
		BadgeVariant     string  `json:"badge_variant"`
	}
	milestoneList := make([]milestoneItem, 0, len(config.MilestoneDefinitions))
	achievedBoolMap := make(map[string]bool, len(achievedMilestones))
	for _, def := range config.MilestoneDefinitions {
		item := milestoneItem{
			Key:              def.Key,
			DaysRequired:     def.DaysRequired,
			Name:             def.Name,
			BlessingsAwarded: def.BlessingsAwarded,
			BadgeVariant:     "standard",
		}
		if um, ok := achievedMap[def.Key]; ok {
			item.Earned = true
			item.BadgeVariant = um.BadgeVariant
			ts := um.AchievedAt.Format(time.RFC3339)
			item.AchievedAt = &ts
			achievedBoolMap[def.Key] = true
		}
		milestoneList = append(milestoneList, item)
	}

	// Compute next_milestone.
	var nextMilestoneDTO interface{}
	if def := config.NextMilestone(streak.CurrentStreak, achievedBoolMap); def != nil {
		nextMilestoneDTO = gin.H{
			"key":               def.Key,
			"name":              def.Name,
			"days_required":     def.DaysRequired,
			"blessings_awarded": def.BlessingsAwarded,
		}
	}

	// Find undismissed milestone (for celebration modal surfacing).
	var newlyAchievedDTO interface{}
	if hasUndismissed {
		for _, def := range config.MilestoneDefinitions {
			if def.Key == undismissed.MilestoneKey {
				ts := undismissed.AchievedAt.Format(time.RFC3339)
				newlyAchievedDTO = gin.H{
					"key":               def.Key,
					"name":              def.Name,
					"days_required":     def.DaysRequired,
					"blessings_awarded": def.BlessingsAwarded,
					"achieved_at":       ts,
				}
				break
			}
		}
	}

	// Calculate avatar initials from username
	initials := ""
	if len(user.Username) > 0 {
		initials = string(user.Username[0])
		if len(user.Username) > 1 {
			for i := 1; i < len(user.Username); i++ {
				if user.Username[i-1] == ' ' && user.Username[i] != ' ' {
					initials += string(user.Username[i])
					break
				}
			}
		}
		initials = strings.ToUpper(initials)
	}

	// Generate avatar color from user ID (deterministic warm palette).
	colors := []string{"#C9A84C", "#E8963A", "#B8860B", "#CD7F32", "#9B8FC4"}
	avatarColor := colors[user.ID%uint(len(colors))]

	// Build streak section (matches GET /api/streak shape).
	streakData := gin.H{
		"current_streak":           streak.CurrentStreak,
		"longest_streak":           streak.LongestStreak,
		"last_active_date":         streak.LastActiveDate,
		"grace_days_remaining":     streak.GraceDaysRemaining,
		"grace_days_reset_at":      streak.GraceDaysResetAt,
		"streak_recoverable":       streakRecoverable,
		"blessings_balance":        balance,
		"next_milestone":           nextMilestoneDTO,
		"newly_achieved_milestone": newlyAchievedDTO,
	}

	// Build reading stats.
	readingStats := gin.H{
		"verses_read":       histCount,
		"days_active":       activeDaysCount,
		"favorites_count":   favCount,
		"reflections_count": commentCount,
	}

	// respond with aggregated profile data (single round trip — no waterfall)
	aggregateResp := gin.H{
		"username":        user.Username,
		"email":           user.Email,
		"member_since":    user.CreatedAt,
		"avatar_initials": initials,
		"avatar_color":    avatarColor,
		"is_premium":      false, // Phase 8
		"streak":          streakData,
		"milestones":      milestoneList,
		"reading_stats":   readingStats,
	}
	if user.PendingEmail != nil && *user.PendingEmail != "" {
		aggregateResp["pending_email"] = *user.PendingEmail
	}
	c.JSON(http.StatusOK, aggregateResp)
}

// UpdateProfile handler
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Rate limit: 5 profile updates per minute per user
	if !checkRateLimit(&h.updateLimiter, userID.(uint), 5, time.Minute) {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Too many update requests — please wait a moment"})
		return
	}

	var req struct {
		Username        string `json:"username" validate:"required,min=3,max=30"`
		Email           string `json:"email" validate:"required,email"`
		CurrentPassword string `json:"current_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// Username format: letters, digits, underscores, hyphens only
	if !usernameRegex.MatchString(req.Username) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username may only contain letters, numbers, underscores, and hyphens",
			"field": "username",
		})
		return
	}

	// Validate email (disposable domains, typos)
	isValid, suggestion, errMsg := h.emailValidator.ValidateEmail(req.Email)
	if !isValid {
		response := gin.H{"error": errMsg, "field": "email"}
		if suggestion != "" {
			response["suggestion"] = suggestion
		}
		c.JSON(http.StatusBadRequest, response)
		return
	}

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	emailChanging := req.Email != user.Email
	// Also consider a pending change already in place
	pendingEmailChanging := emailChanging || (user.PendingEmail != nil && *user.PendingEmail != req.Email)
	_ = pendingEmailChanging // used below

	// Require current password to confirm an email change (password-based accounts only)
	if emailChanging && user.Password != "" {
		if req.CurrentPassword == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Current password is required to change your email address",
				"field": "current_password",
			})
			return
		}
		if !user.CheckPassword(req.CurrentPassword) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Incorrect password",
				"field": "current_password",
			})
			return
		}
	}

	// Username change cooldown: once every 30 days
	const usernameCooldown = 30 * 24 * time.Hour
	if req.Username != user.Username && user.UsernameChangedAt != nil {
		elapsed := time.Since(*user.UsernameChangedAt)
		if elapsed < usernameCooldown {
			daysLeft := int((usernameCooldown-elapsed).Hours()/24) + 1
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": fmt.Sprintf("Username can only be changed once every 30 days. Try again in %d day(s).", daysLeft),
				"field": "username",
			})
			return
		}
	}

	// Uniqueness checks
	if emailChanging {
		existingUser, _ := h.userRepo.GetByEmail(req.Email)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
			return
		}
	}
	if req.Username != user.Username {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already in use"})
			return
		}
	}

	// Apply username change (with cooldown timestamp)
	if req.Username != user.Username {
		now := time.Now()
		user.UsernameChangedAt = &now
		user.Username = req.Username
	}

	// For email changes: store as pending — the live email is not updated until the user
	// clicks the confirmation link sent to the new address.
	if emailChanging {
		// Notify old email that a change was requested
		if err := h.emailService.SendEmailChangeNotification(user.Email, user.Username, req.Email); err != nil {
			log.Printf("Failed to send email-change notification to old address %s for user %d: %v", user.Email, user.ID, err)
		}

		token, err := services.GenerateToken()
		if err != nil {
			log.Printf("Failed to generate pending-email token for user %d: %v", user.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate email change"})
			return
		}

		if err := h.userRepo.Update(user); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
			return
		}
		if err := h.userRepo.SetPendingEmail(user.ID, req.Email, token, time.Now().Add(24*time.Hour)); err != nil {
			log.Printf("Failed to set pending email for user %d: %v", user.ID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate email change"})
			return
		}
		if err := h.emailService.SendPendingEmailVerification(req.Email, user.Username, token); err != nil {
			log.Printf("Failed to send pending-email verification to %s: %v", req.Email, err)
		}

		c.JSON(http.StatusOK, gin.H{
			"id":               user.ID,
			"username":         user.Username,
			"email":            user.Email,
			"pending_email":    req.Email,
			"created_at":       user.CreatedAt,
			"email_verified":   user.EmailVerified,
			"google_id":        getStringValue(user.GoogleID),
			"google_email":     getStringValue(user.GoogleEmail),
			"google_picture":   getStringValue(user.GooglePicture),
			"is_google_linked": user.IsGoogleLinked,
			"message":          fmt.Sprintf("A confirmation link has been sent to %s. Your current email stays active until you verify the new one.", req.Email),
		})
		return
	}

	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	pendingEmail := ""
	if user.PendingEmail != nil {
		pendingEmail = *user.PendingEmail
	}
	resp := gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	}
	if pendingEmail != "" {
		resp["pending_email"] = pendingEmail
	}
	c.JSON(http.StatusOK, resp)
}

// GetStats handler
func (h *ProfileHandler) GetStats(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	uid := userID.(uint)

	// All four queries are independent — run them concurrently.
	var (
		favCount     int64
		histCount    int64
		commentCount int64
		user         *models.User
		favErr       error
		histErr      error
		commentErr   error
		userErr      error
	)

	var wg sync.WaitGroup
	wg.Add(4)
	go func() {
		defer wg.Done()
		favCount, favErr = h.favoriteRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg.Done()
		histCount, histErr = h.historyRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg.Done()
		commentCount, commentErr = h.commentRepo.CountByUserID(uid)
	}()
	go func() {
		defer wg.Done()
		user, userErr = h.userRepo.GetByID(uid)
	}()
	wg.Wait()

	if favErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite count"})
		return
	}
	if histErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history count"})
		return
	}
	if commentErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comment count"})
		return
	}
	if userErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	accountAge := int64((time.Since(user.CreatedAt)).Hours() / 24)

	c.JSON(http.StatusOK, gin.H{
		"favorite_count":   favCount,
		"history_count":    histCount,
		"comment_count":    commentCount,
		"account_age_days": accountAge,
	})
}

// SetPassword handler - allows OAuth users to set their first password
func (h *ProfileHandler) SetPassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		NewPassword     string `json:"newPassword" validate:"required,min=8"`
		ConfirmPassword string `json:"confirmPassword" validate:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// check if passwords match
	if req.NewPassword != req.ConfirmPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if user already has a password
	if user.Password != "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password already set",
			"details": "Use the change password feature to update your existing password",
		})
		return
	}

	// validate new password strength
	validPassword, err := password.ValidatePasswordStrength(req.NewPassword)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// set password (SetPassword will hash it)
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// save to database
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	// save to password history
	passwordHistory := &models.PasswordHistory{
		UserID:       userID.(uint),
		PasswordHash: user.Password,
		ChangedAt:    time.Now(),
	}
	if err := h.passwordHistoryRepo.Create(passwordHistory); err != nil {
		// Log error but don't fail the request
		// Password was successfully set, history is not critical
	}

	// respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Password set successfully. You can now unlink your Google account if desired.",
	})
}

// UpdatePassword handler - allows users to change their password
func (h *ProfileHandler) UpdatePassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		CurrentPassword string `json:"currentPassword" validate:"required"`
		NewPassword     string `json:"newPassword" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if user is OAuth-only (no password set)
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot change password for OAuth-only accounts",
			"details": "Please set a password first or continue using Google login",
		})
		return
	}

	// verify current password
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// validate new password strength
	validPassword, err := password.ValidatePasswordStrength(req.NewPassword)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// check if new password is same as current password
	if req.CurrentPassword == req.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be different from current password"})
		return
	}

	// check password history - prevent reuse of last 5 passwords
	const passwordHistoryLimit = 5
	recentPasswords, err := h.passwordHistoryRepo.GetRecentByUserID(userID.(uint), passwordHistoryLimit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check password history"})
		return
	}

	// check if new password matches any recent passwords
	for _, historyEntry := range recentPasswords {
		if password.CheckPasswordHash(req.NewPassword, historyEntry.PasswordHash) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot reuse recent passwords",
				"details": "This password was used recently. Please choose a different password.",
			})
			return
		}
	}

	// save current password to history before updating
	passwordHistory := &models.PasswordHistory{
		UserID:       userID.(uint),
		PasswordHash: user.Password, // Save current (old) password hash
		ChangedAt:    time.Now(),
	}
	if err := h.passwordHistoryRepo.Create(passwordHistory); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password history"})
		return
	}

	// update password (SetPassword will hash it)
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// save to database
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	// clean up old password history entries (keep only last 5)
	if err := h.passwordHistoryRepo.DeleteOldestForUser(userID.(uint), passwordHistoryLimit); err != nil {
		// Log error but don't fail the request
		// Password was successfully changed, cleanup is not critical
	}

	// respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Password updated successfully",
	})
}

// ResendVerificationFromProfile sends a new verification email for the currently
// authenticated user. Protected route — requires valid JWT.
func (h *ProfileHandler) ResendVerificationFromProfile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.EmailVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
		return
	}

	token, err := services.GenerateToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate verification token"})
		return
	}

	if err := h.userRepo.UpdateVerificationToken(user.ID, token, time.Now().Add(24*time.Hour)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store verification token"})
		return
	}

	if err := h.emailService.SendVerificationEmail(user.Email, user.Username, token); err != nil {
		log.Printf("Failed to send verification email to %s: %v", user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send verification email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Verification email sent. Please check your inbox.",
	})
}
