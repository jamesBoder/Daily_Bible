package moderation_test

import (
	"testing"

	"dailybible/internal/moderation"
)

func TestContainsProfanity_Blocks(t *testing.T) {
	cases := []string{
		"fuck this",
		"sh1t",    // leet-speak (1→i)
		"a55hole", // leet-speak (5→s)
	}
	for _, text := range cases {
		if !moderation.ContainsProfanity(text) {
			t.Errorf("expected profanity detected in %q but was not", text)
		} else {
			t.Logf("✅ blocked: %q", text)
		}
	}
}

func TestContainsProfanity_Allows(t *testing.T) {
	cases := []string{
		"Blessed are the pure in heart",
		"Praise the Lord for His mercy",
		"Please pray for my family going through a hard time",
		"God is good, all the time!",
		"hell has no power over those who walk in faith", // "hell" is a false-positive exception
		"damn, that sermon was powerful",                 // "damn" is a false-positive exception
	}
	for _, text := range cases {
		if moderation.ContainsProfanity(text) {
			t.Errorf("expected clean text to pass: %q", text)
		} else {
			t.Logf("✅ allowed: %q", text)
		}
	}
}
