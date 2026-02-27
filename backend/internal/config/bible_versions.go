package config

// BibleVersion represents a Bible version with its metadata
type BibleVersion struct {
    ID          string
    Name        string
    Language    string
    LanguageCode string
    Abbreviation string
}

// BibleVersions maps language codes to Bible version IDs
var BibleVersions = map[string]BibleVersion{
    "en": {
        ID:           "de4e12af7f28f599-02",
        Name:         "King James (Authorised) Version",
        Language:     "English",
        LanguageCode: "en",
        Abbreviation: "KJV",
    },
    "es": {
        ID:           "592420522e16049f-01",
        Name:         "Reina Valera 1909",
        Language:     "Spanish",
        LanguageCode: "es",
        Abbreviation: "RVR09",
    },
    "fr": {
        // Using Darby Bible as it's the only French version available
        ID:           "a93a92589195411f-01",
        Name:         "Bible J.N. Darby",
        Language:     "French",
        LanguageCode: "fr",
        Abbreviation: "JND",
    },
    "ht": {
        // Using the Haitian Bible (hatbsa)
        ID:           "496cafdffc23197b-01",
        Name:         "Haitian Bible",
        Language:     "Haitian Creole",
        LanguageCode: "ht",
        Abbreviation: "hatbsa",
    },
}

// GetBibleVersionID returns the Bible version ID for a given language code
func GetBibleVersionID(languageCode string) string {
    if version, exists := BibleVersions[languageCode]; exists {
        return version.ID
    }
    // Default to English KJV if language not found
    return BibleVersions["en"].ID
}

// GetBibleVersion returns the full BibleVersion struct for a given language code
func GetBibleVersion(languageCode string) BibleVersion {
    if version, exists := BibleVersions[languageCode]; exists {
        return version
    }
    // Default to English KJV if language not found
    return BibleVersions["en"]
}

// GetSupportedLanguages returns a list of supported language codes
func GetSupportedLanguages() []string {
    languages := make([]string, 0, len(BibleVersions))
    for lang := range BibleVersions {
        languages = append(languages, lang)
    }
    return languages
}

// IsLanguageSupported checks if a language code is supported
func IsLanguageSupported(languageCode string) bool {
    _, exists := BibleVersions[languageCode]
    return exists
}