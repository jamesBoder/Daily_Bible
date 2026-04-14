package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"github.com/resend/resend-go/v2"
)

// EmailService handles sending transactional emails via Resend
type EmailService struct {
	client      *resend.Client
	fromEmail   string
	frontendURL string
}

// NewEmailService creates a new EmailService with the given Resend API key and config.
// Logs the resolved configuration on startup so misconfiguration is immediately
// visible in `docker-compose logs backend` or `fly logs`.
func NewEmailService(apiKey, fromEmail, frontendURL string) *EmailService {
	if apiKey == "" {
		log.Println("WARNING: RESEND_API_KEY is not set — all email sending will fail silently")
	} else {
		log.Printf("EmailService: RESEND_API_KEY is set (length=%d)", len(apiKey))
	}
	log.Printf("EmailService: from=%q  frontendURL=%q", fromEmail, frontendURL)

	return &EmailService{
		client:      resend.NewClient(apiKey),
		fromEmail:   fromEmail,
		frontendURL: frontendURL,
	}
}

// GenerateToken generates a cryptographically secure 64-character hex token (32 random bytes)
func GenerateToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// SendVerificationEmail sends an email verification link to the user
func (s *EmailService) SendVerificationEmail(toEmail, username, token string) error {
	url := fmt.Sprintf("%s/verify-email?token=%s", s.frontendURL, token)
	html := fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1a56db;">Verify Your Email — Words of Praise</h2>
  <p>Hi <strong>%s</strong>, thank you for joining! Please verify your email address to activate your account:</p>
  <a href="%s" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">Verify Email Address</a>
  <p style="color:#6b7280;font-size:14px;">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
  <p style="color:#6b7280;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br>%s</p>
</div>`, username, url, url)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Verify your email — Words of Praise",
		Html:    html,
	})
	return err
}

var reminderSubjects = map[string]string{
	"en": "Your Word for Today — %s",
	"es": "Tu Palabra de Hoy — %s",
	"fr": "Votre Parole du Jour — %s",
	"ht": "Mo Pawòl Jodi a — %s",
}

const reminderHTMLTemplate = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:16px;color:#374151;">Good morning, <strong>%s</strong>!</p>
    <p style="margin:0 0 24px;font-size:16px;color:#374151;">Here is your verse for today:</p>
    <blockquote style="margin:0 0 24px;padding:20px 24px;background:#fff;border-left:4px solid #f59e0b;border-radius:4px;">
      <p style="margin:0 0 12px;font-size:18px;color:#1f2937;font-style:italic;">"%s"</p>
      <p style="margin:0;font-size:14px;color:#6b7280;">— %s</p>
    </blockquote>
    <a href="%s" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Read Today's Verse →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">You're receiving this because you enabled Daily Verse Reminders.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      <a href="%s" style="color:#6b7280;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="%s" style="color:#6b7280;">Manage Settings</a>
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`

// SendDailyReminder sends the daily verse reminder email to an opted-in user.
func (s *EmailService) SendDailyReminder(
	toEmail string,
	username string,
	verseText string,
	reference string,
	lang string,
	unsubURL string,
	settingsURL string,
) error {
	subjectFmt, ok := reminderSubjects[lang]
	if !ok {
		subjectFmt = reminderSubjects["en"]
	}
	subject := fmt.Sprintf(subjectFmt, reference)
	html := fmt.Sprintf(reminderHTMLTemplate,
		username, verseText, reference,
		s.frontendURL+"/daily",
		unsubURL, settingsURL,
	)
	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: subject,
		Html:    html,
		Headers: map[string]string{
			"List-Unsubscribe":      "<" + unsubURL + ">",
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
		},
	})
	return err
}

// SendPendingEmailVerification sends a confirmation link to the new address the user wants to switch to.
// The link must be clicked before the change takes effect.
func (s *EmailService) SendPendingEmailVerification(pendingEmail, username, token string) error {
	url := fmt.Sprintf("%s/verify-email?token=%s&type=pending", s.frontendURL, token)
	html := fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1a56db;">Confirm Your New Email — Words of Praise</h2>
  <p>Hi <strong>%s</strong>,</p>
  <p>You requested to change the email address on your Words of Praise account to <strong>%s</strong>.</p>
  <p>Click the button below to confirm this change. <strong>Your current email remains active until you do.</strong></p>
  <a href="%s" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">Confirm New Email</a>
  <p style="color:#6b7280;font-size:14px;">This link expires in <strong>24 hours</strong>. If you did not request this change, you can safely ignore this email — nothing will change.</p>
  <p style="color:#6b7280;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br>%s</p>
</div>`, username, pendingEmail, url, url)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{pendingEmail},
		Subject: "Confirm your new email address — Words of Praise",
		Html:    html,
	})
	return err
}

// SendEmailChangeNotification alerts the old email address that the account email was changed.
// This lets the real owner detect unauthorized changes and contact support.
func (s *EmailService) SendEmailChangeNotification(oldEmail, username, newEmail string) error {
	html := fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#dc2626;">Security Notice — Email Address Changed</h2>
  <p>Hi <strong>%s</strong>,</p>
  <p>The email address for your Words of Praise account was just changed to <strong>%s</strong>.</p>
  <p>If you made this change, no action is needed.</p>
  <p style="color:#dc2626;font-weight:bold;">If you did NOT make this change, your account may be compromised. Please contact our support team immediately.</p>
  <p style="color:#6b7280;font-size:12px;">This notification was sent to your previous email address as a security measure.</p>
</div>`, username, newEmail)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{oldEmail},
		Subject: "Security notice: your email address was changed — Words of Praise",
		Html:    html,
	})
	return err
}

// SendSubscriberWelcome sends a one-time welcome email to a new landing-page subscriber.
// unsubURL is a token-based link that lets the user opt out without logging in.
func (s *EmailService) SendSubscriberWelcome(toEmail, unsubURL string) error {
	html := fmt.Sprintf(`<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="margin:0 0 16px;font-size:22px;color:#1f2937;">You're on the list!</h2>
    <p style="margin:0 0 16px;font-size:16px;color:#374151;">
      Thank you for signing up. You'll receive today's verse in your inbox each morning —
      a simple, daily moment with Scripture.
    </p>
    <p style="margin:0 0 24px;font-size:16px;color:#374151;">
      Want to do more? Create a free account to track your streak, play the Manna puzzle,
      and journal your reflections.
    </p>
    <a href="%s/signup" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Create a Free Account →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      <a href="%s" style="color:#6b7280;">Unsubscribe</a>
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`, s.frontendURL, unsubURL)

	req := &resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Your daily verse is on its way — Words of Praise",
		Html:    html,
	}
	if unsubURL != "" {
		req.Headers = map[string]string{
			"List-Unsubscribe":      "<" + unsubURL + ">",
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
		}
	}
	_, err := s.client.Emails.Send(req)
	return err
}

const subscriberDailyVerseHTMLTemplate = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 24px;font-size:16px;color:#374151;">Good morning! Here is your verse for today:</p>
    <blockquote style="margin:0 0 24px;padding:20px 24px;background:#fff;border-left:4px solid #f59e0b;border-radius:4px;">
      <p style="margin:0 0 12px;font-size:18px;color:#1f2937;font-style:italic;">"%s"</p>
      <p style="margin:0;font-size:14px;color:#6b7280;">— %s</p>
    </blockquote>
    <a href="%s/daily" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;margin-bottom:16px;">Read Today's Verse →</a>
    <p style="margin:16px 0 8px;font-size:14px;color:#6b7280;">Want to go deeper? Create a free account to track your streak, play the Manna puzzle, and keep a prayer journal.</p>
    <a href="%s/signup" style="font-size:14px;color:#f59e0b;text-decoration:underline;">Create a free account →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;">You're receiving this because you subscribed to daily verse emails.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      <a href="%s" style="color:#6b7280;">Unsubscribe</a>
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`

// SendSubscriberDailyVerse sends the daily verse email to a landing-page subscriber.
// Unlike SendDailyReminder, there is no username or per-user language preference.
func (s *EmailService) SendSubscriberDailyVerse(toEmail, verseText, reference, unsubURL string) error {
	subject := fmt.Sprintf("Your verse for today — %s", reference)
	html := fmt.Sprintf(subscriberDailyVerseHTMLTemplate,
		verseText, reference,
		s.frontendURL, // Read Today's Verse → /daily
		s.frontendURL, // Create a free account → /signup
		unsubURL,
	)
	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: subject,
		Html:    html,
		Headers: map[string]string{
			"List-Unsubscribe":      "<" + unsubURL + ">",
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
		},
	})
	return err
}

// ── Streak-break reminder ─────────────────────────────────────────────────────

// SendStreakReminder sends a late-evening nudge to a user whose streak is at risk.
// Called at ~9 pm local time when no daily_engagement has been recorded for today.
// streakDays is the current streak count — shown in the email to raise the stakes.
func (s *EmailService) SendStreakReminder(toEmail, username string, streakDays int, unsubURL string) error {
	// Subject: "1-day streak" is grammatically awkward; simplify for day 1.
	var subject string
	if streakDays == 1 {
		subject = fmt.Sprintf("Your streak ends at midnight, %s", username)
	} else {
		subject = fmt.Sprintf("Your %d-day streak ends at midnight, %s", streakDays, username)
	}

	// Body label: always show the count — "🔥 1-day streak" is clear; "🔥 streak" alone is not.
	streakLabel := fmt.Sprintf("%d-day streak", streakDays)

	html := fmt.Sprintf(`<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi <strong>%s</strong>,</p>
    <p style="margin:0 0 8px;font-size:28px;font-weight:bold;color:#f59e0b;">🔥 %s</p>
    <p style="margin:0 0 24px;font-size:16px;color:#374151;">Today hasn't been recorded yet. Read today's verse and your streak is safe — it takes 60 seconds.</p>
    <a href="%s/daily" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Keep my streak →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">You're receiving this because you have daily verse reminders enabled.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      <a href="%s" style="color:#6b7280;">Unsubscribe</a>
      &nbsp;·&nbsp;
      <a href="%s/settings" style="color:#6b7280;">Manage preferences</a>
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`, username, streakLabel, s.frontendURL, unsubURL, s.frontendURL)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: subject,
		Html:    html,
		Headers: map[string]string{
			"List-Unsubscribe":      "<" + unsubURL + ">",
			"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
		},
	})
	return err
}

// ── Onboarding sequence ───────────────────────────────────────────────────────

// Day 1 — immediate: welcome + what to do first
// %s = username, %s = frontendURL
const onboardingDay1HTML = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <h2 style="margin:0 0 16px;font-size:22px;color:#1f2937;">Welcome, <strong>%s</strong>!</h2>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">Your account is ready. Here's how to get the most out of your first day:</p>
    <table style="width:100%%;border-collapse:collapse;margin:0 0 24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;width:32px;font-size:20px;">📖</td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f3f4f6;">
          <strong style="color:#1f2937;">Read today's verse</strong><br>
          <span style="font-size:14px;color:#6b7280;">A new verse appears every day. Take 60 seconds to sit with it.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;font-size:20px;">🟨</td>
        <td style="padding:12px 0 12px 12px;border-bottom:1px solid #f3f4f6;">
          <strong style="color:#1f2937;">Play Manna</strong><br>
          <span style="font-size:14px;color:#6b7280;">Guess the hidden biblical word in 6 tries — one puzzle per day, just like Wordle.</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;vertical-align:top;font-size:20px;">🔥</td>
        <td style="padding:12px 0 12px 12px;">
          <strong style="color:#1f2937;">Start your streak</strong><br>
          <span style="font-size:14px;color:#6b7280;">Read the verse and play Manna to earn your first streak day. Come back tomorrow to keep it going.</span>
        </td>
      </tr>
    </table>
    <a href="%s/daily" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Start with today's verse →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">You're receiving this because you created an account on Words of Praise.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;"><a href="%s/settings" style="color:#6b7280;">Manage email preferences</a></p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`

// Day 3 — scheduled +2 days: feature discovery, forward-looking
// %s = username, %s = frontendURL, %s = frontendURL (settings)
const onboardingDay3HTML = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi <strong>%s</strong>,</p>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">It's day three. The hardest part of any habit is staying consistent through the first week — here's what's waiting for you when you open the app today:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#374151;font-size:15px;line-height:1.8;">
      <li><strong>Journal</strong> — write a short reflection on today's verse. It takes 2 minutes and compounds over time.</li>
      <li><strong>Community board</strong> — see how others are engaging with the same verse you're reading.</li>
      <li><strong>Favorites</strong> — save the verses that land on you. They're easy to find later.</li>
    </ul>
    <a href="%s/daily" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;">Open today's verse →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">You're receiving this as part of your Words of Praise welcome series.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;"><a href="%s/settings" style="color:#6b7280;">Manage email preferences</a></p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`

// Day 7 — scheduled +6 days: "you made it a week" + soft premium mention
// %s = username, %s = frontendURL (/daily), %s = frontendURL (/shop)
const onboardingDay7HTML = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:0;background:#faf8f3;">
  <div style="background:#f59e0b;padding:20px 24px;text-align:center;">
    <span style="font-size:24px;color:#fff;font-weight:bold;">🕯 Words of Praise</span>
  </div>
  <div style="padding:32px 24px;">
    <p style="margin:0 0 8px;font-size:16px;color:#374151;">Hi <strong>%s</strong>,</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:bold;color:#1f2937;">One week. You showed up.</p>
    <p style="margin:0 0 20px;font-size:16px;color:#374151;">Seven days of returning to Scripture is not nothing. Most apps get one session. You've given this seven.</p>
    <p style="margin:0 0 24px;font-size:16px;color:#374151;">If you want to go deeper, there's a one-time Premium upgrade that unlocks everything — reading plans, guided prayer, hard mode Manna, verse annotations, and streak protection (Grace Days) so a busy day doesn't break what you've built.</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">Launch price: <strong style="color:#1f2937;">$9.99 once</strong>, no subscription, no renewal.</p>
    <a href="%s/daily" style="display:inline-block;background:#f59e0b;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;font-size:15px;margin-bottom:12px;">Continue to day 8 →</a>
    <br>
    <a href="%s/shop" style="font-size:14px;color:#f59e0b;text-decoration:underline;">See what's included in Premium →</a>
  </div>
  <div style="padding:20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">You're receiving this as part of your Words of Praise welcome series.</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;"><a href="%s/settings" style="color:#6b7280;">Manage email preferences</a></p>
    <p style="margin:8px 0 0;font-size:11px;color:#d1d5db;">Words of Praise · wordsofpraise.app</p>
  </div>
</div>`

// ScheduleOnboardingSequence schedules 3 onboarding emails for a newly activated
// user using Resend's ScheduledAt field. Day 1 is sent immediately; Day 3 and Day 7
// are scheduled via Resend so no background goroutine or DB scheduler is needed.
// All three sends are attempted independently — a failure on one does not cancel
// the others. The caller is responsible for calling MarkOnboardingScheduled on
// the user record to prevent a second scheduling if VerifyEmail is somehow called
// twice.
func (s *EmailService) ScheduleOnboardingSequence(toEmail, username string) error {
	now := time.Now()

	type emailJob struct {
		subject     string
		html        string
		scheduledAt string // empty = send immediately
	}

	jobs := []emailJob{
		{
			// Day 1: username, frontendURL (/daily CTA), frontendURL (/settings footer)
			subject: fmt.Sprintf("You're in, %s — start here", username),
			html:    fmt.Sprintf(onboardingDay1HTML, username, s.frontendURL, s.frontendURL),
		},
		{
			// Day 3: username, frontendURL (/daily CTA), frontendURL (/settings footer)
			subject:     fmt.Sprintf("3 days in, %s — here's what to try next", username),
			html:        fmt.Sprintf(onboardingDay3HTML, username, s.frontendURL, s.frontendURL),
			scheduledAt: now.Add(2 * 24 * time.Hour).UTC().Format(time.RFC3339),
		},
		{
			// Day 7: username, frontendURL (/daily CTA), frontendURL (/shop link), frontendURL (/settings footer)
			subject:     fmt.Sprintf("One week, %s — you showed up", username),
			html:        fmt.Sprintf(onboardingDay7HTML, username, s.frontendURL, s.frontendURL, s.frontendURL),
			scheduledAt: now.Add(6 * 24 * time.Hour).UTC().Format(time.RFC3339),
		},
	}

	var firstErr error
	for _, job := range jobs {
		req := &resend.SendEmailRequest{
			From:    s.fromEmail,
			To:      []string{toEmail},
			Subject: job.subject,
			Html:    job.html,
		}
		if job.scheduledAt != "" {
			req.ScheduledAt = job.scheduledAt
		}
		if _, err := s.client.Emails.Send(req); err != nil {
			log.Printf("ScheduleOnboardingSequence: failed to send %q to %s: %v", job.subject, toEmail, err)
			if firstErr == nil {
				firstErr = err
			}
		}
	}
	return firstErr
}

// SendPasswordResetEmail sends a password reset link to the user
func (s *EmailService) SendPasswordResetEmail(toEmail, username, token string) error {
	url := fmt.Sprintf("%s/reset-password?token=%s", s.frontendURL, token)
	html := fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1a56db;">Reset Your Password — Words of Praise</h2>
  <p>Hi <strong>%s</strong>, we received a request to reset your password. Click the button below to choose a new password:</p>
  <a href="%s" style="display:inline-block;background:#1a56db;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-weight:bold;margin:16px 0;">Reset Password</a>
  <p style="color:#6b7280;font-size:14px;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
  <p style="color:#6b7280;font-size:12px;">If the button doesn't work, copy and paste this link into your browser:<br>%s</p>
</div>`, username, url, url)

	_, err := s.client.Emails.Send(&resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: "Reset your password — Words of Praise",
		Html:    html,
	})
	return err
}
