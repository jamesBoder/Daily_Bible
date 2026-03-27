package handlers

// imports

import (
	"log"
	"net/http"
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

	// respond with user profile data
	c.JSON(http.StatusOK, gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
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
	c.JSON(http.StatusOK, gin.H{
		"username":        user.Username,
		"email":           user.Email,
		"member_since":    user.CreatedAt,
		"avatar_initials": initials,
		"avatar_color":    avatarColor,
		"is_premium":      false, // Phase 8
		"streak":          streakData,
		"milestones":      milestoneList,
		"reading_stats":   readingStats,
	})
}

// UpdateProfile handler
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID") 
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		Username string `json:"username" validate:"required,min=3,max=50"`
		Email    string `json:"email" validate:"required,email"`
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

	// validate email (check for disposable domains and typos)
	isValid, suggestion, errMsg := h.emailValidator.ValidateEmail(req.Email)
	if !isValid {
		response := gin.H{
			"error": errMsg,
			"field": "email",
		}
		if suggestion != "" {
			response["suggestion"] = suggestion
		}
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// check if user exists
	user, err := h.userRepo.GetByID(userID.(uint)) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if email is being changed and if it's already taken by another user
	if req.Email != user.Email {
		existingUser, _ := h.userRepo.GetByEmail(req.Email)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
			return
		}
	}

	// Check if username is being changed and if it's already taken by another user
	if req.Username != user.Username {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already in use"})
			return
		}
	}

	// Detect email change before updating
	emailChanged := req.Email != user.Email

	// update user via userRepo.Update()
	user.Username = req.Username
	user.Email = req.Email

	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// If email changed, reset verification and send new verification email
	if emailChanged {
		token, err := services.GenerateToken()
		if err != nil {
			log.Printf("Failed to generate verification token after email change for user %d: %v", user.ID, err)
		} else {
			if err := h.userRepo.UpdateVerificationToken(user.ID, token, time.Now().Add(24*time.Hour)); err != nil {
				log.Printf("Failed to store verification token after email change for user %d: %v", user.ID, err)
			} else {
				if err := h.emailService.SendVerificationEmail(user.Email, user.Username, token); err != nil {
					log.Printf("Failed to send verification email to %s: %v", user.Email, err)
				}
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"id":               user.ID,
			"username":         user.Username,
			"email":            user.Email,
			"created_at":       user.CreatedAt,
			"email_verified":   false,
			"google_id":        getStringValue(user.GoogleID),
			"google_email":     getStringValue(user.GoogleEmail),
			"google_picture":   getStringValue(user.GooglePicture),
			"is_google_linked": user.IsGoogleLinked,
			"message":          "Profile updated. A verification email has been sent to your new address.",
		})
		return
	}

	// respond with updated profile data (no email change)
	c.JSON(http.StatusOK, gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"email":            user.Email,
		"created_at":       user.CreatedAt,
		"email_verified":   user.EmailVerified,
		"google_id":        getStringValue(user.GoogleID),
		"google_email":     getStringValue(user.GoogleEmail),
		"google_picture":   getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
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
