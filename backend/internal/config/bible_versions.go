package config

import "sort"

// BibleVersion represents a single Bible translation with its API.Bible metadata.
type BibleVersion struct {
	ID              string // API.Bible version ID (empty for unlicensed premium translations)
	Name            string
	Abbreviation    string
	Language        string
	LanguageCode    string
	RequiresPremium bool
}

// BibleVersions is keyed by lowercase abbreviation (e.g. "kjv", "niv", "rvr1960").
// Free translations have a populated ID; premium translations have ID = "" until
// the API.Bible license agreement is signed.
var BibleVersions = map[string]BibleVersion{
	// ── English — Free (public domain) ───────────────────────────────────────
	"kjv": {
		ID:              "de4e12af7f28f599-02",
		Name:            "King James Version",
		Abbreviation:    "KJV",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: false,
	},
	"web": {
		ID:              "9879dbb7cfe39e4d-04",
		Name:            "World English Bible",
		Abbreviation:    "WEB",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: false,
	},
	"asv": {
		ID:              "06125adad2d5898a-01",
		Name:            "American Standard Version",
		Abbreviation:    "ASV",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: false,
	},
	// ── English — Premium (licensed; IDs filled when license is signed) ───────
	"niv": {
		ID:              "",
		Name:            "New International Version",
		Abbreviation:    "NIV",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"esv": {
		ID:              "",
		Name:            "English Standard Version",
		Abbreviation:    "ESV",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"nlt": {
		ID:              "",
		Name:            "New Living Translation",
		Abbreviation:    "NLT",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"nkjv": {
		ID:              "",
		Name:            "New King James Version",
		Abbreviation:    "NKJV",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"csb": {
		ID:              "",
		Name:            "Christian Standard Bible",
		Abbreviation:    "CSB",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"nasb": {
		ID:              "",
		Name:            "New American Standard Bible",
		Abbreviation:    "NASB",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	"msg": {
		ID:              "",
		Name:            "The Message",
		Abbreviation:    "MSG",
		Language:        "English",
		LanguageCode:    "en",
		RequiresPremium: true,
	},
	// ── Spanish — Free ────────────────────────────────────────────────────────
	"rvr09": {
		ID:              "592420522e16049f-01",
		Name:            "Reina-Valera 1909",
		Abbreviation:    "RVR09",
		Language:        "Spanish",
		LanguageCode:    "es",
		RequiresPremium: false,
	},
	"rvr1960": {
		ID:              "b32b9d1b64b4ef29-01",
		Name:            "Reina-Valera 1960",
		Abbreviation:    "RVR1960",
		Language:        "Spanish",
		LanguageCode:    "es",
		RequiresPremium: false,
	},
	// ── Spanish — Premium ─────────────────────────────────────────────────────
	"nvi": {
		ID:              "",
		Name:            "Nueva Versión Internacional",
		Abbreviation:    "NVI",
		Language:        "Spanish",
		LanguageCode:    "es",
		RequiresPremium: true,
	},
	"ntv": {
		ID:              "",
		Name:            "Nueva Traducción Viviente",
		Abbreviation:    "NTV",
		Language:        "Spanish",
		LanguageCode:    "es",
		RequiresPremium: true,
	},
	"rvc": {
		ID:              "",
		Name:            "Reina-Valera Contemporánea",
		Abbreviation:    "RVC",
		Language:        "Spanish",
		LanguageCode:    "es",
		RequiresPremium: true,
	},
	// ── French — Free ─────────────────────────────────────────────────────────
	"jnd": {
		ID:              "a93a92589195411f-01",
		Name:            "Bible J.N. Darby",
		Abbreviation:    "JND",
		Language:        "French",
		LanguageCode:    "fr",
		RequiresPremium: false,
	},
	// ── Haitian Creole — Free ─────────────────────────────────────────────────
	"hatbsa": {
		ID:              "496cafdffc23197b-01",
		Name:            "Haitian Bible",
		Abbreviation:    "hatbsa",
		Language:        "Haitian Creole",
		LanguageCode:    "ht",
		RequiresPremium: false,
	},
}

// GetVersionsForLanguage returns all translations for a given language code,
// ordered free-first then premium, alphabetical within each group.
func GetVersionsForLanguage(langCode string) []BibleVersion {
	var versions []BibleVersion
	for _, v := range BibleVersions {
		if v.LanguageCode == langCode {
			versions = append(versions, v)
		}
	}
	sort.Slice(versions, func(i, j int) bool {
		if versions[i].RequiresPremium != versions[j].RequiresPremium {
			return !versions[i].RequiresPremium // free first
		}
		return versions[i].Abbreviation < versions[j].Abbreviation
	})
	return versions
}

// GetDefaultFreeVersion returns the default free translation abbreviation for a
// language code, falling back to "kjv" for any unsupported language.
func GetDefaultFreeVersion(langCode string) string {
	defaults := map[string]string{
		"en": "kjv",
		"es": "rvr1960",
		"fr": "jnd",
		"ht": "hatbsa",
	}
	if v, ok := defaults[langCode]; ok {
		return v
	}
	return "kjv"
}
