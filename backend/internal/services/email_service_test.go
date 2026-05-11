package services

// email_service_test.go — unit tests for the daily-reminder email template
// and subject-line logic.
//
// These tests are pure unit tests: no database, no network, no Resend calls.
// They operate directly on the unexported package-level variables
// reminderSubjects and reminderHTMLTemplate.
//
// Run from the backend/ directory:
//   go test ./internal/services/ -run TestReminder -v

import (
	"fmt"
	"strings"
	"testing"
)

// TestReminderSubjects_AllLanguagesPresent verifies that all four supported
// language codes have a subject-line format string.
func TestReminderSubjects_AllLanguagesPresent(t *testing.T) {
	for _, lang := range []string{"en", "es", "fr", "ht"} {
		if _, ok := reminderSubjects[lang]; !ok {
			t.Errorf("reminderSubjects missing language %q", lang)
		}
	}
	t.Logf("✅ reminderSubjects has entries for en, es, fr, ht")
}

// TestReminderSubjects_ContainReference verifies that each subject line, when
// formatted, includes the verse reference so recipients know which verse to expect.
func TestReminderSubjects_ContainReference(t *testing.T) {
	ref := "John 3:16"
	for lang, format := range reminderSubjects {
		subject := fmt.Sprintf(format, ref)
		if !strings.Contains(subject, ref) {
			t.Errorf("lang %q: subject %q does not contain reference %q", lang, subject, ref)
		}
	}
	t.Logf("✅ all 4 language subject lines include the verse reference")
}

// TestReminderSubjects_FallbackToEnglish verifies that the English key exists,
// which is the fallback used by SendDailyReminder for unknown language codes.
func TestReminderSubjects_FallbackToEnglish(t *testing.T) {
	if _, ok := reminderSubjects["en"]; !ok {
		t.Fatal("reminderSubjects missing fallback language 'en'")
	}
	t.Logf("✅ English fallback subject is present")
}

// TestReminderHTMLTemplate_HasCorrectPlaceholders verifies that the HTML
// template has exactly 6 %s placeholders, matching the arguments passed by
// SendDailyReminder: username, verseText, reference, dailyURL, unsubURL, settingsURL.
func TestReminderHTMLTemplate_HasCorrectPlaceholders(t *testing.T) {
	const want = 6
	got := strings.Count(reminderHTMLTemplate, "%s")
	if got != want {
		t.Fatalf("expected %d %%s placeholders in reminderHTMLTemplate, got %d", want, got)
	}
	t.Logf("✅ reminderHTMLTemplate has %d %%s placeholders", got)
}

// TestReminderHTMLTemplate_ContainsBrandElements verifies that the template
// includes the app name, brand colour, and key structural elements.
// Note: the List-Unsubscribe header is set on the Resend request in
// SendDailyReminder, not in the HTML body — so it is not checked here.
func TestReminderHTMLTemplate_ContainsBrandElements(t *testing.T) {
	for _, want := range []string{"Words of Praise", "#f59e0b", "Unsubscribe", "Manage Settings"} {
		if !strings.Contains(reminderHTMLTemplate, want) {
			t.Errorf("reminderHTMLTemplate missing expected string %q", want)
		}
	}
	t.Logf("✅ template contains brand name, amber colour, unsubscribe and settings links")
}
