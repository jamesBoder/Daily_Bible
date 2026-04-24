package services

import (
	"dailybible/internal/models"
	"errors"
	"strings"
	"time"

	"gorm.io/gorm"
)

const maxSavedSearches = 10

var ErrMaxSavedSearches  = errors.New("maximum saved searches reached")
var ErrSavedSearchNotFound = errors.New("saved search not found")

// ReflectionSearchResult is a single result from searching the user's reflections.
type ReflectionSearchResult struct {
	VerseReference string    `json:"verse_reference"`
	CommentText    string    `json:"comment_text"`
	MatchExcerpt   string    `json:"match_excerpt"`
	CreatedAt      time.Time `json:"created_at"`
}

// JournalSearchResult is a single result from searching the user's journal.
type JournalSearchResult struct {
	ID             uint      `json:"id"`
	ContentPreview string    `json:"content_preview"`
	LinkedVerse    string    `json:"linked_verse"`
	MatchExcerpt   string    `json:"match_excerpt"`
	CreatedAt      time.Time `json:"created_at"`
}

// SavedSearchResponse is the JSON shape for a saved search.
type SavedSearchResponse struct {
	ID        uint      `json:"id"`
	Query     string    `json:"query"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

// SearchService handles premium search features.
type SearchService struct {
	db *gorm.DB
}

// NewSearchService creates a new SearchService.
func NewSearchService(db *gorm.DB) *SearchService {
	return &SearchService{db: db}
}

// escapeLike escapes SQL LIKE wildcard characters in user-supplied query strings.
func escapeLike(q string) string {
	q = strings.ReplaceAll(q, `\`, `\\`)
	q = strings.ReplaceAll(q, "%", `\%`)
	q = strings.ReplaceAll(q, "_", `\_`)
	return q
}

// SearchReflections performs a case-insensitive keyword search on the user's reflections.
func (s *SearchService) SearchReflections(userID uint, query string) ([]ReflectionSearchResult, error) {
	type row struct {
		VerseReference string
		CommentText    string
		CreatedAt      time.Time
	}

	like := "%" + escapeLike(strings.ToLower(query)) + "%"
	var rows []row
	if err := s.db.Table("comments").
		Select("verse_reference, comment_text, created_at").
		Where("user_id = ? AND deleted_at IS NULL AND LOWER(comment_text) LIKE ?", userID, like).
		Order("created_at DESC").
		Limit(20).
		Scan(&rows).Error; err != nil {
		return nil, err
	}

	results := make([]ReflectionSearchResult, 0, len(rows))
	for _, r := range rows {
		results = append(results, ReflectionSearchResult{
			VerseReference: r.VerseReference,
			CommentText:    r.CommentText,
			MatchExcerpt:   buildExcerpt(r.CommentText, query, 120),
			CreatedAt:      r.CreatedAt,
		})
	}
	return results, nil
}

// SearchJournal performs a case-insensitive keyword search on the user's journal entries.
func (s *SearchService) SearchJournal(userID uint, query string) ([]JournalSearchResult, error) {
	like := "%" + escapeLike(strings.ToLower(query)) + "%"
	var entries []models.JournalEntry
	if err := s.db.Where("user_id = ? AND deleted_at IS NULL AND LOWER(content_plain) LIKE ?", userID, like).
		Order("created_at DESC").
		Limit(20).
		Find(&entries).Error; err != nil {
		return nil, err
	}

	results := make([]JournalSearchResult, 0, len(entries))
	for _, e := range entries {
		preview := e.ContentPlain
		if pr := []rune(preview); len(pr) > 200 {
			preview = string(pr[:200]) + "…"
		}
		results = append(results, JournalSearchResult{
			ID:             e.ID,
			ContentPreview: preview,
			LinkedVerse:    e.LinkedVerse,
			MatchExcerpt:   buildExcerpt(e.ContentPlain, query, 120),
			CreatedAt:      e.CreatedAt,
		})
	}
	return results, nil
}

// GetSavedSearches returns all saved searches for the user.
func (s *SearchService) GetSavedSearches(userID uint) ([]SavedSearchResponse, error) {
	var searches []models.SavedSearch
	if err := s.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&searches).Error; err != nil {
		return nil, err
	}

	out := make([]SavedSearchResponse, 0, len(searches))
	for _, ss := range searches {
		label := ss.Name
		if label == "" {
			label = ss.Query
		}
		out = append(out, SavedSearchResponse{
			ID:        ss.ID,
			Query:     ss.Query,
			Name:      label,
			CreatedAt: ss.CreatedAt,
		})
	}
	return out, nil
}

// SaveSearch creates a new saved search. Enforces the 10-search cap.
func (s *SearchService) SaveSearch(userID uint, query, name string) (*SavedSearchResponse, error) {
	var count int64
	if err := s.db.Model(&models.SavedSearch{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return nil, err
	}
	if int(count) >= maxSavedSearches {
		return nil, ErrMaxSavedSearches
	}

	ss := models.SavedSearch{
		UserID: userID,
		Query:  query,
		Name:   name,
	}
	if err := s.db.Create(&ss).Error; err != nil {
		return nil, err
	}
	label := ss.Name
	if label == "" {
		label = ss.Query
	}
	return &SavedSearchResponse{
		ID:        ss.ID,
		Query:     ss.Query,
		Name:      label,
		CreatedAt: ss.CreatedAt,
	}, nil
}

// DeleteSavedSearch deletes a saved search. Enforces ownership.
func (s *SearchService) DeleteSavedSearch(userID uint, searchID uint) error {
	result := s.db.Where("id = ? AND user_id = ?", searchID, userID).Delete(&models.SavedSearch{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return ErrSavedSearchNotFound
	}
	return nil
}

// buildExcerpt returns a snippet of text around the first occurrence of query.
// Operates on rune slices to avoid splitting multi-byte UTF-8 characters.
func buildExcerpt(text, query string, maxLen int) string {
	runes := []rune(text)
	lower := strings.ToLower(text)
	lq := strings.ToLower(query)
	byteIdx := strings.Index(lower, lq)
	if byteIdx == -1 {
		if len(runes) > maxLen {
			return string(runes[:maxLen]) + "…"
		}
		return text
	}
	// Convert byte index to rune index.
	runeIdx := len([]rune(text[:byteIdx]))
	start := runeIdx - 30
	if start < 0 {
		start = 0
	}
	end := start + maxLen
	if end > len(runes) {
		end = len(runes)
	}
	excerpt := string(runes[start:end])
	if start > 0 {
		excerpt = "…" + excerpt
	}
	if end < len(runes) {
		excerpt = excerpt + "…"
	}
	return excerpt
}
