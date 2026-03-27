package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"

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
