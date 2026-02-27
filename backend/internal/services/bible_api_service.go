package services


import (
    "encoding/json"
    "fmt"
    "net/http"
    "regexp"
    "strings"
    "time"
    "dailybible/internal/config"
)

// bookNameToID maps English book names (lowercase) to Bible API book IDs
var bookNameToID = map[string]string{
    // Old Testament
    "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM",
    "deuteronomy": "DEU", "joshua": "JOS", "judges": "JDG", "ruth": "RUT",
    "1 samuel": "1SA", "2 samuel": "2SA", "1 kings": "1KI", "2 kings": "2KI",
    "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR", "nehemiah": "NEH",
    "esther": "EST", "job": "JOB", "psalm": "PSA", "psalms": "PSA",
    "proverbs": "PRO", "ecclesiastes": "ECC", "song of solomon": "SNG",
    "isaiah": "ISA", "jeremiah": "JER", "lamentations": "LAM", "ezekiel": "EZK",
    "daniel": "DAN", "hosea": "HOS", "joel": "JOL", "amos": "AMO",
    "obadiah": "OBA", "jonah": "JON", "micah": "MIC", "nahum": "NAH",
    "habakkuk": "HAB", "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC",
    "malachi": "MAL",
    // New Testament
    "matthew": "MAT", "mark": "MRK", "luke": "LUK", "john": "JHN",
    "acts": "ACT", "romans": "ROM", "1 corinthians": "1CO", "2 corinthians": "2CO",
    "galatians": "GAL", "ephesians": "EPH", "philippians": "PHP", "colossians": "COL",
    "1 thessalonians": "1TH", "2 thessalonians": "2TH", "1 timothy": "1TI",
    "2 timothy": "2TI", "titus": "TIT", "philemon": "PHM", "hebrews": "HEB",
    "james": "JAS", "1 peter": "1PE", "2 peter": "2PE", "1 john": "1JN",
    "2 john": "2JN", "3 john": "3JN", "jude": "JUD", "revelation": "REV",
}

// referenceToPassageID converts an English reference like "John 3:16" to
// the Bible API passage ID format "JHN.3.16" (or "JHN.3.16-JHN.3.17" for ranges).
func referenceToPassageID(reference string) (string, error) {
    parts := strings.Fields(reference)
    if len(parts) < 2 {
        return "", fmt.Errorf("invalid reference: %s", reference)
    }

    // Last token is the chapter:verse part (e.g. "3:16" or "3:16-17")
    chapterVerse := parts[len(parts)-1]
    bookName := strings.ToLower(strings.Join(parts[:len(parts)-1], " "))

    bookID, ok := bookNameToID[bookName]
    if !ok {
        return "", fmt.Errorf("unknown book: %s", bookName)
    }

    if strings.Contains(chapterVerse, ":") {
        cv := strings.SplitN(chapterVerse, ":", 2)
        chapter := cv[0]
        verseRange := cv[1]

        if strings.Contains(verseRange, "-") {
            vp := strings.SplitN(verseRange, "-", 2)
            return fmt.Sprintf("%s.%s.%s-%s.%s.%s", bookID, chapter, vp[0], bookID, chapter, vp[1]), nil
        }
        return fmt.Sprintf("%s.%s.%s", bookID, chapter, verseRange), nil
    }

    // Chapter only (no verse)
    return fmt.Sprintf("%s.%s", bookID, chapterVerse), nil
}


// BibleAPIVerse interface represents a verse fetched from the Bible API
type BibleAPIService interface {
	GetVerse(reference string) (*BibleAPIVerse, error)
	GetVerseWithLanguage(reference string, languageCode string) (*BibleAPIVerse, error)
    SearchVerses(query string, limit int) ([]BibleAPIVerse, error)
    SearchVersesWithLanguage(query string, limit int, languageCode string) ([]BibleAPIVerse, error)
}

type bibleApiService struct {
	apiKey     string
	baseURL    string
	versionID  string
	httpClient *http.Client
}

// NewBibleAPIService creates a new instance of BibleAPIService
func NewBibleAPIService(apiKey, baseURL, versionID string) BibleAPIService {
	return &bibleApiService{
		apiKey:    apiKey,
		baseURL:   baseURL,
		versionID: versionID,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// BibleAPIVerse represents a verse fetched from the Bible API
type BibleAPIVerse struct {
	ID        string `json:"id"`
    Reference string `json:"reference"`
    Text      string `json:"text"`
	Content	  string `json:"content"`
    BookID    string `json:"bookId"`
    ChapterID string `json:"chapterId"`
}

// stripHTML removes HTML tags from a string
func stripHTML(html string) string {
    // Remove HTML tags
    re := regexp.MustCompile(`<[^>]*>`)
    text := re.ReplaceAllString(html, "")

	// Remove verse numbers at the beginning of text
    // Matches: "1", "1 ", "12", "123 " at start (with or without space)
    text = regexp.MustCompile(`^\d+\s*`).ReplaceAllString(text, "")

	// Remove verse numbers in the middle of text (after punctuation)
    // Matches patterns like ". 2 ", "; 3", ": 9Not" etc.
    text = regexp.MustCompile(`([.;!?:])\s*\d+\s*`).ReplaceAllString(text, "$1 ")
    
    // Clean up extra whitespace
    text = strings.TrimSpace(text)
    text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
    
    return text
}

// BibleAPIPassageResponse represents the API response for a single passage
// GET /v1/bibles/{bibleId}/passages/{passageId}?content-type=text
type BibleAPIPassageResponse struct {
    Data struct {
        ID        string `json:"id"`
        BibleID   string `json:"bibleId"`
        OrgID     string `json:"orgId"`
        Content   string `json:"content"`
        Reference string `json:"reference"`
        VerseCount int   `json:"verseCount"`
        Copyright string `json:"copyright"`
    } `json:"data"`
}

// BibleAPIResponse represents the API response for passage search (kept for SearchVersesWithLanguage)
type BibleAPIResponse struct {
    Data struct {
        Query      string `json:"query"`
        Limit      int    `json:"limit"`
        Offset     int    `json:"offset"`
        Total      int    `json:"total"`
        VerseCount int    `json:"verseCount"`
        Passages []struct {
            ID        string `json:"id"`
            OrgID     string `json:"orgId"`
            BibleID   string `json:"bibleId"`
            BookID    string `json:"bookId"`
            ChapterID string `json:"chapterId"`
            Content   string `json:"content"`
            Reference string `json:"reference"`
        } `json:"passages"`
    } `json:"data"`
}

// BibleAPISearchResponse represents the API response for verse search
type BibleAPISearchResponse struct {
    Data struct {
        Query      string `json:"query"`
        Limit      int    `json:"limit"`
        Offset     int    `json:"offset"`
        Total      int    `json:"total"`
        VerseCount int    `json:"verseCount"`
        Verses []struct {
            ID        string `json:"id"`
            OrgID     string `json:"orgId"`
            BookID    string `json:"bookId"`
            BibleID   string `json:"bibleId"`
            ChapterID string `json:"chapterId"`
            Reference string `json:"reference"`
            Text      string `json:"text"`
        } `json:"verses"`
    } `json:"data"`
}


// GetVerse fetches a verse by reference using the default version
func (s *bibleApiService) GetVerse(reference string) (*BibleAPIVerse, error) {
	return s.GetVerseWithLanguage(reference, "en")
}

// GetVerseWithLanguage fetches a verse by reference in a specific language
// Uses the passages endpoint: GET /v1/bibles/{bibleId}/passages/{passageId}?content-type=text
func (s *bibleApiService) GetVerseWithLanguage(reference string, languageCode string) (*BibleAPIVerse, error) {
	if reference == "" {
		return nil, fmt.Errorf("reference cannot be empty")
	}

	// Convert English reference (e.g. "John 3:16") to passage ID (e.g. "JHN.3.16")
	passageID, err := referenceToPassageID(reference)
	if err != nil {
		return nil, fmt.Errorf("failed to convert reference: %w", err)
	}

	// Get the appropriate Bible version ID for the language
	versionID := config.GetBibleVersionID(languageCode)

	// Use the passages endpoint with plain-text content type
	url := fmt.Sprintf(
		"%s/bibles/%s/passages/%s?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=false",
		s.baseURL, versionID, passageID,
	)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("api-key", s.apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 429 {
		return nil, fmt.Errorf("API rate limit exceeded")
	}
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error: %d", resp.StatusCode)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch verse: status %d", resp.StatusCode)
	}

	var apiResp BibleAPIPassageResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	if apiResp.Data.Content == "" {
		return nil, fmt.Errorf("no content found for passage: %s", passageID)
	}

	verse := &BibleAPIVerse{
		ID:        apiResp.Data.ID,
		Reference: apiResp.Data.Reference,
		Content:   apiResp.Data.Content,
		Text:      strings.TrimSpace(apiResp.Data.Content), // content-type=text returns plain text
	}

	return verse, nil
}


// SearchVerses searches for verses using the default version
func (s *bibleApiService) SearchVerses(query string, limit int) ([]BibleAPIVerse, error) {
	return s.SearchVersesWithLanguage(query, limit, "en")
}

// SearchVersesWithLanguage searches for verses in a specific language
func (s *bibleApiService) SearchVersesWithLanguage(query string, limit int, languageCode string) ([]BibleAPIVerse, error) {
	// Get the appropriate Bible version ID for the language
	versionID := config.GetBibleVersionID(languageCode)
	
	url := fmt.Sprintf("%s/bibles/%s/search?query=%s&limit=%d", s.baseURL, versionID, query, limit)
	if query == "" {
		return nil, fmt.Errorf("query cannot be empty")
	}

	// make HTTP request
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	// set headers
	req.Header.Set("api-key", s.apiKey)
	req.Header.Set("Accept", "application/json")

	// execute request
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	// defer closing response body
	defer resp.Body.Close()

	// handle non-200 responses
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error: %d", resp.StatusCode)
	}
	if resp.StatusCode == 429 {
		return nil, fmt.Errorf("API rate limit exceeded")
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to search verses: status %d", resp.StatusCode)
	}

	// parse response
	var apiResp BibleAPISearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	// map to slice of BibleAPIVerse
	verses := make([]BibleAPIVerse, 0, len(apiResp.Data.Verses))
    for _, v := range apiResp.Data.Verses {
        verses = append(verses, BibleAPIVerse{
            ID:        v.ID,
            Reference: v.Reference,
            Text:      v.Text,
            BookID:    v.BookID,
            ChapterID: v.ChapterID,
		})
    }

	return verses, nil
}
