package services

import (
	"context"
	"log"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"

	"gorm.io/gorm"
)

// SubscriberReminderScheduler sends the daily verse to landing-page subscribers
// (EmailSubscriber rows) at a fixed UTC hour. Unlike ReminderScheduler, there is
// no per-user timezone — all subscribers receive the email at the same UTC hour.
type SubscriberReminderScheduler struct {
	db                *gorm.DB
	emailService      *EmailService
	dailyVerseService *DailyVerseService
	cfg               *config.Config
}

func NewSubscriberReminderScheduler(
	db *gorm.DB,
	emailService *EmailService,
	dailyVerseService *DailyVerseService,
	cfg *config.Config,
) *SubscriberReminderScheduler {
	return &SubscriberReminderScheduler{
		db:                db,
		emailService:      emailService,
		dailyVerseService: dailyVerseService,
		cfg:               cfg,
	}
}

// RunHourly fires SendBatch immediately on startup, then once per hour until
// ctx is cancelled (e.g. on graceful shutdown).
func (s *SubscriberReminderScheduler) RunHourly(ctx context.Context) {
	s.SendBatch(ctx)
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			s.SendBatch(ctx)
		case <-ctx.Done():
			log.Println("SubscriberReminderScheduler: stopping")
			return
		}
	}
}

// SendBatch sends the daily verse to all active landing-page subscribers, skipping
// any who already received an email today (UTC date). It mirrors the dedup and
// logging pattern used by ReminderScheduler for consistency.
func (s *SubscriberReminderScheduler) SendBatch(ctx context.Context) {
	now := time.Now().UTC()

	// Only send at the configured UTC hour.
	if now.Hour() != s.cfg.ReminderSendHour {
		return
	}

	todayUTC := now.Format("2006-01-02")

	// Fetch all active subscribers.
	var subscribers []models.EmailSubscriber
	if err := s.db.Find(&subscribers).Error; err != nil {
		log.Printf("SubscriberReminderScheduler: subscriber query failed: %v", err)
		return
	}
	if len(subscribers) == 0 {
		return
	}

	// Fetch today's verse once for the whole batch.
	verse, err := s.dailyVerseService.GetDailyVerse()
	if err != nil {
		log.Printf("SubscriberReminderScheduler: could not fetch daily verse: %v", err)
		return
	}
	// Copy fields immediately — never write to the cached verse pointer.
	verseText := verse.Text
	verseReference := verse.Reference

	for _, sub := range subscribers {
		select {
		case <-ctx.Done():
			return
		default:
		}

		// Dedup: skip if already sent today.
		var existing models.SubscriberReminderLog
		if err := s.db.Where("subscriber_id = ? AND sent_date = ?", sub.ID, todayUTC).
			First(&existing).Error; err == nil {
			continue
		}

		unsubURL := s.cfg.FrontendURL + "/api/subscribe/unsubscribe?token=" + sub.UnsubscribeToken

		sendErr := s.emailService.SendSubscriberDailyVerse(
			sub.Email, verseText, verseReference, unsubURL,
		)

		logEntry := models.SubscriberReminderLog{
			SubscriberID: sub.ID,
			SentDate:     todayUTC,
			SentAt:       time.Now(),
			Status:       "sent",
		}
		if sendErr != nil {
			log.Printf("SubscriberReminderScheduler: send failed for subscriber %d (%s): %v",
				sub.ID, sub.Email, sendErr)
			logEntry.Status = "failed"
			logEntry.Error = sendErr.Error()
		}
		if err := s.db.Create(&logEntry).Error; err != nil {
			log.Printf("SubscriberReminderScheduler: failed to write log for subscriber %d: %v",
				sub.ID, err)
		}
	}
}
