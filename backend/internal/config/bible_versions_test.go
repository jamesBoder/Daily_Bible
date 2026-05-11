package config

import "testing"

// TestGetDefaultFreeVersion verifies that each supported language maps to the
// correct default free translation, and that an unsupported language falls back
// to KJV (English default).
func TestGetDefaultFreeVersion(t *testing.T) {
	tests := []struct {
		langCode string
		expected string
	}{
		{"en", "kjv"},
		{"es", "rvr1960"},
		{"fr", "jnd"},
		{"ht", "hatbsa"},
		// Unsupported languages should fall back to KJV
		{"de", "kjv"},
		{"pt", "kjv"},
		{"", "kjv"},
	}

	for _, tt := range tests {
		t.Run("lang="+tt.langCode, func(t *testing.T) {
			got := GetDefaultFreeVersion(tt.langCode)
			if got != tt.expected {
				t.Errorf("GetDefaultFreeVersion(%q) = %q; want %q", tt.langCode, got, tt.expected)
			}
		})
	}
}

// TestGetDefaultFreeVersionExistsInMap verifies that every default returned by
// GetDefaultFreeVersion is actually a key in BibleVersions.
func TestGetDefaultFreeVersionExistsInMap(t *testing.T) {
	for _, langCode := range []string{"en", "es", "fr", "ht", "de"} {
		key := GetDefaultFreeVersion(langCode)
		if _, ok := BibleVersions[key]; !ok {
			t.Errorf("GetDefaultFreeVersion(%q) returned %q which is not in BibleVersions", langCode, key)
		}
	}
}

// TestGetVersionsForLanguageReturnsCorrectLanguage verifies that only versions
// matching the requested language code are returned.
func TestGetVersionsForLanguageReturnsCorrectLanguage(t *testing.T) {
	for _, langCode := range []string{"en", "es", "fr", "ht"} {
		t.Run("lang="+langCode, func(t *testing.T) {
			versions := GetVersionsForLanguage(langCode)
			if len(versions) == 0 {
				t.Errorf("GetVersionsForLanguage(%q) returned empty slice", langCode)
				return
			}
			for _, v := range versions {
				if v.LanguageCode != langCode {
					t.Errorf("version %q has LanguageCode=%q; expected %q",
						v.Abbreviation, v.LanguageCode, langCode)
				}
			}
		})
	}
}

// TestGetVersionsForLanguageUnsupported verifies that an unsupported language
// returns an empty slice (not an error and not a panic).
func TestGetVersionsForLanguageUnsupported(t *testing.T) {
	versions := GetVersionsForLanguage("de")
	if len(versions) != 0 {
		t.Errorf("GetVersionsForLanguage(\"de\") expected empty slice, got %d entries", len(versions))
	}
}

// TestGetVersionsForLanguageFreeFirst verifies that free translations are
// ordered before premium translations in the result.
func TestGetVersionsForLanguageFreeFirst(t *testing.T) {
	// English has both free and premium translations — best language to test ordering.
	versions := GetVersionsForLanguage("en")
	if len(versions) == 0 {
		t.Fatal("GetVersionsForLanguage(\"en\") returned empty slice")
	}

	seenPremium := false
	for _, v := range versions {
		if v.RequiresPremium {
			seenPremium = true
		} else if seenPremium {
			// Found a free version AFTER a premium one — ordering is wrong
			t.Errorf("free version %q appears after a premium version in GetVersionsForLanguage(\"en\")",
				v.Abbreviation)
		}
	}
}

// TestGetVersionsForLanguageContainsExpectedVersions spot-checks that known
// versions appear in the results for each supported language.
func TestGetVersionsForLanguageContainsExpectedVersions(t *testing.T) {
	tests := []struct {
		langCode string
		key      string // expected key in BibleVersions
	}{
		{"en", "kjv"},
		{"en", "web"},
		{"en", "asv"},
		{"en", "niv"}, // premium
		{"es", "rvr1960"},
		{"es", "rvr09"},
		{"fr", "jnd"},
		{"ht", "hatbsa"},
	}

	for _, tt := range tests {
		t.Run(tt.langCode+"/"+tt.key, func(t *testing.T) {
			versions := GetVersionsForLanguage(tt.langCode)
			found := false
			for _, v := range versions {
				if v.Abbreviation == BibleVersions[tt.key].Abbreviation {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("expected version key %q to appear in GetVersionsForLanguage(%q)", tt.key, tt.langCode)
			}
		})
	}
}

// TestBibleVersionsDefaultsAreFree verifies that every version returned by
// GetDefaultFreeVersion is not a premium translation.
func TestBibleVersionsDefaultsAreFree(t *testing.T) {
	for _, langCode := range []string{"en", "es", "fr", "ht"} {
		key := GetDefaultFreeVersion(langCode)
		v, ok := BibleVersions[key]
		if !ok {
			t.Errorf("default version key %q for lang %q not found in BibleVersions", key, langCode)
			continue
		}
		if v.RequiresPremium {
			t.Errorf("default version %q for lang %q is marked RequiresPremium — defaults must be free", key, langCode)
		}
	}
}

// TestBibleVersionsFreeVersionsHaveIDs verifies that all non-premium (free)
// versions have a non-empty API.Bible ID. Premium versions are allowed to have
// an empty ID (license not yet signed).
func TestBibleVersionsFreeVersionsHaveIDs(t *testing.T) {
	for key, v := range BibleVersions {
		if !v.RequiresPremium && v.ID == "" {
			t.Errorf("free version %q (key=%q) has an empty ID — free versions must have a valid API.Bible ID", v.Abbreviation, key)
		}
	}
}
