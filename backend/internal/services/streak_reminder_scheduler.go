package services

import (
	"context"
	"log"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"

	"gorm.io/gorm"
)

// StreakReminderScheduler sends a late-evening nudge to users whose streak is at
// risk — i.e. they have a current streak > 0 but haven't recorded a
// daily_engagement for today in their local timezone. Runs hourly and fires for
// each user when their local clock hits StreakReminderHour (default: 21 / 9 pm).
type StreakReminderScheduler struct {
	db           *gorm.DB
	emailService *EmailService
	tokenService *TokenService
	cfg          *config.Config
}

func NewStreakReminderScheduler(
	db *gorm.DB,
	emailService *EmailService,
	tokenService *TokenService,
	cfg *config.Config,
) *StreakReminderScheduler {
	return &StreakReminderScheduler{
		db:           db,
		emailService: emailService,
		tokenService: tokenService,
		cfg:          cfg,
	}
}

// RunHourly fires SendBatch immediately on startup, then once per hour until
// ctx is cancelled.
func (s *StreakReminderScheduler) RunHourly(ctx context.Context) {
	s.SendBatch(ctx)
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.SendBatch(ctx)
		case <-ctx.Done():
			log.Println("StreakReminderScheduler: stopping")
			return
		}
	}
}

// SendBatch queries all eligible users, filters to those whose local hour is
// StreakReminderHour, skips any who have already engaged today or already
// received a reminder today, and sends the streak-break warning email.
func (s *StreakReminderScheduler) SendBatch(ctx context.Context) {
	// Fetch all candidates: verified, opted-in, active streak.
	var candidates []struct {
		UserID            uint
		Email             string
		Username          string
		PreferredTimezone string
		PreferredLanguage string
		CurrentStreak     int
	}

	if err := s.db.Table("users u").
		Select(`u.id          AS user_id,
		        u.email,
		        u.username,
		        s.preferred_timezone,
		        s.preferred_language,
		        st.current_streak`).
		Joins("JOIN user_settings s  ON s.user_id  = u.id").
		Joins("JOIN user_streaks  st ON st.user_id = u.id").
		Where(`u.email_verified  = true
		       AND u.deleted_at  IS NULL
		       AND s.email_notifications  = true
		       AND s.daily_verse_reminder = true
		       AND st.current_streak      > 0`).
		Scan(&candidates).Error; err != nil {
		log.Printf("StreakReminderScheduler: eligibility query failed: %v", err)
		return
	}

	if len(candidates) == 0 {
		return
	}

	for _, u := range candidates {
		select {
		case <-ctx.Done():
			return
		default:
		}

		loc, err := time.LoadLocation(u.PreferredTimezone)
		if err != nil || loc == nil {
			loc = time.UTC
		}

		now := time.Now().In(loc)
		if now.Hour() != s.cfg.StreakReminderHour {
			continue
		}

		todayStr := now.Format("2006-01-02")

		// Skip if the user already engaged today — streak is not actually at risk.
		var engagementCount int64
		if err := s.db.Model(&models.UserActivityLog{}).
			Where("user_id = ? AND date_local = ? AND action_type = 'daily_engagement'",
				u.UserID, todayStr).
			Count(&engagementCount).Error; err != nil {
			log.Printf("StreakReminderScheduler: activity check failed for user %d: %v", u.UserID, err)
			continue
		}
		if engagementCount > 0 {
			continue
		}

		// Dedup: skip if we already sent a reminder today.
		var existing models.StreakReminderLog
		if err := s.db.Where("user_id = ? AND sent_date = ?", u.UserID, todayStr).
			First(&existing).Error; err == nil {
			continue
		}

		unsubToken, err := s.tokenService.GenerateUnsubscribeToken(u.UserID)
		if err != nil {
			log.Printf("StreakReminderScheduler: token error for user %d: %v", u.UserID, err)
			continue
		}
		unsubURL := s.cfg.FrontendURL + "/api/settings/unsubscribe?token=" + unsubToken

		sendErr := s.emailService.SendStreakReminder(
			u.Email, u.Username, u.CurrentStreak, unsubURL,
		)

		logEntry := models.StreakReminderLog{
			UserID:   u.UserID,
			SentDate: todayStr,
			SentAt:   time.Now(),
			Status:   "sent",
		}
		if sendErr != nil {
			log.Printf("StreakReminderScheduler: send failed for user %d: %v", u.UserID, sendErr)
			logEntry.Status = "failed"
			logEntry.Error = sendErr.Error()
		}
		if err := s.db.Create(&logEntry).Error; err != nil {
			log.Printf("StreakReminderScheduler: failed to write log for user %d: %v", u.UserID, err)
		}
	}
}
