package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/resend/resend-go/v2"
)

// EmailService handles sending transactional emails via Resend
type EmailService struct {
	client      *resend.Client
	fromEmail   string
	frontendURL string
}

// NewEmailService creates a new EmailService with the given Resend API key and config
func NewEmailService(apiKey, fromEmail, frontendURL string) *EmailService {
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
