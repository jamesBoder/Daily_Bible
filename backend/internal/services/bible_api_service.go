package services


import (
    "encoding/json"
    "fmt"
    "net/http"
    "regexp"
    "strings"
    "time"
)


// BibleAPIVerse interface represents a verse fetched from the Bible API
type BibleAPIService interface {
	GetVerse(reference string) (*BibleAPIVerse, error)
    SearchVerses(query string, limit int) ([]BibleAPIVerse, error)
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

// BibleAPIResponse represents the API response for passage search
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


// GetVerse fetches a verse by reference
func (s *bibleApiService) GetVerse(reference string) (*BibleAPIVerse, error) {
	url := fmt.Sprintf("%s/bibles/%s/search?query=%s", s.baseURL, s.versionID, reference)
	if reference == "" {
		return nil, fmt.Errorf("reference cannot be empty")
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
		return nil, fmt.Errorf("failed to fetch verse: status %d", resp.StatusCode)
	}

	// parse response
	var apiResp BibleAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, err
	}

	// ensure we have at least one verse
	if len(apiResp.Data.Passages) == 0 {
		return nil, fmt.Errorf("no verses found for reference: %s", reference)
	}

	// map to BibleAPIVerse
	verseData := apiResp.Data.Passages[0]
	verse := &BibleAPIVerse{
		ID:        verseData.ID,
		Reference: verseData.Reference,
		Content:   verseData.Content,
		Text:      stripHTML(verseData.Content),
		BookID:    verseData.BookID,
		ChapterID: verseData.ChapterID,
	}

	return verse, nil
}


// SearchVerses searches for verses
func (s *bibleApiService) SearchVerses(query string, limit int) ([]BibleAPIVerse, error) {
	url := fmt.Sprintf("%s/bibles/%s/search?query=%s&limit=%d", s.baseURL, s.versionID, query, limit)
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
