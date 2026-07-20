package services

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"dailybible/internal/models"
	webpush "github.com/SherClockHolmes/webpush-go"
	"gorm.io/gorm"
)

// PushService manages Web Push subscriptions and dispatches notifications.
type PushService struct {
	db         *gorm.DB
	vapidPub   string
	vapidPriv  string
	subscriber string
}

// NewPushService creates a PushService. If vapidPub/vapidPriv are empty, push
// is disabled — all send operations become no-ops and IsEnabled returns false.
func NewPushService(db *gorm.DB, vapidPub, vapidPriv, subscriber string) *PushService {
	return &PushService{
		db:         db,
		vapidPub:   vapidPub,
		vapidPriv:  vapidPriv,
		subscriber: subscriber,
	}
}

// IsEnabled reports whether VAPID keys have been configured.
func (s *PushService) IsEnabled() bool {
	return s.vapidPub != "" && s.vapidPriv != ""
}

// VAPIDPublicKey returns the public VAPID key for the browser to use when subscribing.
func (s *PushService) VAPIDPublicKey() string {
	return s.vapidPub
}

// SaveSubscription stores (or refreshes) a push subscription for a user/device.
// The WHERE clause includes user_id to prevent cross-user endpoint hijacking.
func (s *PushService) SaveSubscription(userID uint, endpoint, p256dh, auth string) error {
	sub := models.PushSubscription{
		UserID:   userID,
		Endpoint: endpoint,
		P256DH:   p256dh,
		Auth:     auth,
	}
	// WHERE must include user_id — otherwise a matching endpoint from a different
	// user would be reassigned (cross-user subscription hijack).
	return s.db.
		Where("user_id = ? AND endpoint = ?", userID, endpoint).
		Assign(models.PushSubscription{P256DH: p256dh, Auth: auth}).
		FirstOrCreate(&sub).Error
}

// DeleteSubscription removes a push subscription by endpoint for a given user.
func (s *PushService) DeleteSubscription(userID uint, endpoint string) error {
	return s.db.
		Where("user_id = ? AND endpoint = ?", userID, endpoint).
		Delete(&models.PushSubscription{}).Error
}

// subRow is a join of PushSubscription + relevant UserSettings + UserStreak fields.
type subRow struct {
	models.PushSubscription
	PreferredTimezone string
	PreferredLanguage string
	PushReminderTime  string
	LastActiveDate    *string // user's local YYYY-MM-DD from user_streaks
}

// localizedBody holds per-language push notification strings.
var localizedBody = map[string][2]string{
	"en": {"Words of Praise", "Today's verse is ready. Open the app to read it. 🙏"},
	"es": {"Palabras de Alabanza", "El versículo de hoy está listo. Ábrelo en la app. 🙏"},
	"fr": {"Paroles de Louange", "Le verset du jour est prêt. Ouvrez l'app pour le lire. 🙏"},
	"ht": {"Pawòl Lwanj", "Vèsè jodi a prèt. Ouvri app la pou li li. 🙏"},
}

func localizedPayload(lang string) []byte {
	strings, ok := localizedBody[lang]
	if !ok {
		strings = localizedBody["en"]
	}
	payload, err := json.Marshal(map[string]interface{}{
		"title": strings[0],
		"body":  strings[1],
		"url":   "/daily",
		"icon":  "/logo192.png",
		"badge": "/logo48.png",
	})
	if err != nil {
		// Fallback to a minimal safe payload — json.Marshal can only fail on
		// types we don't use here (channels, funcs), so this branch is unreachable.
		return []byte(`{"title":"Words of Praise","body":"Your daily verse is ready.","url":"/daily"}`)
	}
	return payload
}

// SendRemindersForHour checks every active subscription and sends a push
// notification to users whose preferred reminder time (in their local timezone)
// matches the current UTC hour. Designed to be called every hour on the hour.
// Safe no-op when push is not configured.
func (s *PushService) SendRemindersForHour() {
	if !s.IsEnabled() {
		return
	}

	nowUTC := time.Now().UTC()

	// Load all active subscriptions with user settings and streak data in one query.
	var rows []subRow
	if err := s.db.Table("push_subscriptions").
		Joins("JOIN user_settings ON user_settings.user_id = push_subscriptions.user_id AND user_settings.deleted_at IS NULL").
		Joins("LEFT JOIN user_streaks ON user_streaks.user_id = push_subscriptions.user_id").
		Where("push_subscriptions.deleted_at IS NULL").
		Select(`push_subscriptions.*,
			COALESCE(user_settings.preferred_timezone, 'UTC') AS preferred_timezone,
			COALESCE(user_settings.preferred_language, 'en')  AS preferred_language,
			COALESCE(user_settings.push_reminder_time, '08:00') AS push_reminder_time,
			user_streaks.last_active_date AS last_active_date`).
		Find(&rows).Error; err != nil {
		log.Printf("push: failed to load subscriptions: %v", err)
		return
	}
	if len(rows) == 0 {
		return
	}

	sent, pruned, skipped, engaged := 0, 0, 0, 0
	for _, row := range rows {
		if !s.shouldSendNow(row.PreferredTimezone, row.PushReminderTime, nowUTC) {
			skipped++
			continue
		}
		// Skip users who already read the verse today — no need to remind them.
		if row.LastActiveDate != nil {
			loc, err := time.LoadLocation(row.PreferredTimezone)
			if err != nil {
				loc = time.UTC
			}
			todayLocal := nowUTC.In(loc).Format("2006-01-02")
			if *row.LastActiveDate == todayLocal {
				engaged++
				continue
			}
		}
		payload := localizedPayload(row.PreferredLanguage)
		gone := s.send(row.PushSubscription, payload)
		if gone {
			pruned++
		} else {
			sent++
		}
	}
	log.Printf("push: hourly check — sent=%d pruned=%d skipped=%d engaged=%d", sent, pruned, skipped, engaged)
}

// shouldSendNow returns true when the user's local hour (derived from their
// timezone) matches the hour in their push_reminder_time setting.
func (s *PushService) shouldSendNow(tzName, reminderTime string, nowUTC time.Time) bool {
	loc, err := time.LoadLocation(tzName)
	if err != nil {
		loc = time.UTC
	}
	localNow := nowUTC.In(loc)

	var reminderHour int
	if _, err := fmt.Sscanf(reminderTime, "%d:", &reminderHour); err != nil {
		reminderHour = 8 // default: 8 AM
	}

	return localNow.Hour() == reminderHour
}

// send delivers a push message to one subscription.
// Returns true if the subscription was expired (410 Gone) and was pruned.
func (s *PushService) send(sub models.PushSubscription, payload []byte) (gone bool) {
	wpSub := &webpush.Subscription{
		Endpoint: sub.Endpoint,
		Keys: webpush.Keys{
			P256dh: sub.P256DH,
			Auth:   sub.Auth,
		},
	}

	resp, err := webpush.SendNotification(payload, wpSub, &webpush.Options{
		Subscriber:      s.subscriber,
		VAPIDPublicKey:  s.vapidPub,
		VAPIDPrivateKey: s.vapidPriv,
		TTL:             43200, // 12 hours — expire if device is offline
	})
	if err != nil {
		log.Printf("push: send failed (endpoint prefix=%s): %v", sub.Endpoint[:min(40, len(sub.Endpoint))], err)
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusGone {
		// Subscription expired/unregistered by the browser — hard-delete to free the slot.
		if err := s.db.Unscoped().Delete(&sub).Error; err != nil {
			log.Printf("push: failed to delete expired subscription id=%d: %v", sub.ID, err)
		}
		return true
	}
	return false
}
