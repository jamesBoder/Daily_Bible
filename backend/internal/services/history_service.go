package services

import (
    "time"
    
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type HistoryService struct {
    historyRepo repository.HistoryRepository
}

func NewHistoryService(historyRepo repository.HistoryRepository) *HistoryService {
    return &HistoryService{
        historyRepo: historyRepo,
    }
}

// GetUserHistory retrieves all history for a user
func (s *HistoryService) GetUserHistory(userID uint) ([]models.History, error) {
    return s.historyRepo.GetByUserID(userID)
}

// GetUserHistoryPaginated retrieves history with pagination
func (s *HistoryService) GetUserHistoryPaginated(userID uint, page, pageSize int) ([]models.History, int64, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    
    offset := (page - 1) * pageSize
    return s.historyRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

// AddToHistory records a verse view (updates timestamp if already exists)
func (s *HistoryService) AddToHistory(userID, verseID uint) error {
    // Check if this verse is already in the user's history
    existingHistory, err := s.historyRepo.FindByUserAndVerse(userID, verseID)
    
    if err == nil && existingHistory != nil {
        // Entry exists, update the viewed_at timestamp
        return s.historyRepo.UpdateViewedAt(existingHistory.ID, time.Now())
    }
    
    // Entry doesn't exist, create a new one
    history := &models.History{
        UserID:   userID,
        VerseID:  verseID,
        ViewedAt: time.Now(),
    }
    
    return s.historyRepo.Create(history)
}

// ClearHistory removes all history for a user
func (s *HistoryService) ClearHistory(userID uint) error {
    return s.historyRepo.DeleteByUserID(userID)
}

// ClearOldHistory removes history older than specified days
func (s *HistoryService) ClearOldHistory(userID uint, days int) error {
    cutoffDate := time.Now().AddDate(0, 0, -days)
    return s.historyRepo.DeleteOlderThan(userID, cutoffDate)
}