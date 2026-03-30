package services

import (
	"context"
	"log"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"

	"gorm.io/gorm"
)

// ReminderScheduler sends daily verse reminder emails to opted-in users at
// their preferred local hour. It runs as a background goroutine.
type ReminderScheduler struct {
	db                *gorm.DB
	emailService      *EmailService
	dailyVerseService *DailyVerseService
	tokenService      *TokenService
	cfg               *config.Config
}

func NewReminderScheduler(
	db *gorm.DB,
	emailService *EmailService,
	dailyVerseService *DailyVerseService,
	tokenService *TokenService,
	cfg *config.Config,
) *ReminderScheduler {
	return &ReminderScheduler{
		db:                db,
		emailService:      emailService,
		dailyVerseService: dailyVerseService,
		tokenService:      tokenService,
		cfg:               cfg,
	}
}

// RunHourly fires SendBatch immediately on startup, then once per hour until
// ctx is cancelled (e.g. on graceful shutdown).
func (s *ReminderScheduler) RunHourly(ctx context.Context) {
	s.SendBatch(ctx)
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.SendBatch(ctx)
		case <-ctx.Done():
			log.Println("ReminderScheduler: stopping")
			return
		}
	}
}

// SendBatch queries all eligible users, filters by local hour, deduplicates
// against email_reminder_logs, and sends the daily verse email.
func (s *ReminderScheduler) SendBatch(ctx context.Context) {
	// Step 1 — eligibility query
	var candidates []struct {
		UserID            uint
		Email             string
		Username          string
		PreferredTimezone string
		PreferredLanguage string
	}

	if err := s.db.Table("users u").
		Select(`u.id AS user_id, u.email, u.username,
		        s.preferred_timezone, s.preferred_language`).
		Joins("JOIN user_settings s ON s.user_id = u.id").
		Where(`u.email_verified = true
		       AND u.deleted_at IS NULL
		       AND s.email_notifications = true
		       AND s.daily_verse_reminder = true`).
		Scan(&candidates).Error; err != nil {
		log.Printf("ReminderScheduler: eligibility query failed: %v", err)
		return
	}

	if len(candidates) == 0 {
		return
	}

	// Step 2 — fetch today's verse once for the entire batch
	verse, err := s.dailyVerseService.GetDailyVerse()
	if err != nil {
		log.Printf("ReminderScheduler: could not fetch daily verse: %v", err)
		return
	}
	// Read fields into locals immediately — never write to the verse pointer (shared cache).
	verseText := verse.Text
	verseReference := verse.Reference

	// Step 3 — per-user loop
	for _, u := range candidates {
		// Check context before each user to stop promptly on shutdown.
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
		if now.Hour() != s.cfg.ReminderSendHour {
			continue
		}

		todayStr := now.Format("2006-01-02")

		// Dedup: skip if already sent today in their timezone
		var existing models.EmailReminderLog
		if err := s.db.Where("user_id = ? AND sent_date = ?", u.UserID, todayStr).
			First(&existing).Error; err == nil {
			continue
		}

		unsubToken, err := s.tokenService.GenerateUnsubscribeToken(u.UserID)
		if err != nil {
			log.Printf("ReminderScheduler: token error for user %d: %v", u.UserID, err)
			continue
		}

		unsubURL := s.cfg.FrontendURL + "/api/settings/unsubscribe?token=" + unsubToken
		settingsURL := s.cfg.FrontendURL + "/settings"

		sendErr := s.emailService.SendDailyReminder(
			u.Email, u.Username,
			verseText, verseReference,
			u.PreferredLanguage,
			unsubURL, settingsURL,
		)

		logEntry := models.EmailReminderLog{
			UserID:   u.UserID,
			SentDate: todayStr,
			SentAt:   time.Now(),
			Status:   "sent",
		}
		if sendErr != nil {
			log.Printf("ReminderScheduler: send failed for user %d: %v", u.UserID, sendErr)
			logEntry.Status = "failed"
			logEntry.Error = sendErr.Error()
		}
		if err := s.db.Create(&logEntry).Error; err != nil {
			log.Printf("ReminderScheduler: failed to write log for user %d: %v", u.UserID, err)
		}
	}
}
