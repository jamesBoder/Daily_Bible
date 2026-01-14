package services

import (
    "errors"
    "fmt"
    
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type FavoriteService struct {
    favoriteRepo repository.FavoriteRepository
    verseRepo    repository.VerseRepository
}

func NewFavoriteService(
    favoriteRepo repository.FavoriteRepository,
    verseRepo repository.VerseRepository,
) *FavoriteService {
    return &FavoriteService{
        favoriteRepo: favoriteRepo,
        verseRepo:    verseRepo,
    }
}

// GetUserFavorites retrieves all favorites for a user
func (s *FavoriteService) GetUserFavorites(userID uint) ([]models.Favorite, error) {
    return s.favoriteRepo.GetByUserID(userID)
}

// GetUserFavoritesPaginated retrieves favorites with pagination
func (s *FavoriteService) GetUserFavoritesPaginated(userID uint, page, pageSize int) ([]models.Favorite, int64, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20 // Default page size
    }
    
    offset := (page - 1) * pageSize
    return s.favoriteRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

// AddFavorite adds a verse to user's favorites
func (s *FavoriteService) AddFavorite(userID, verseID uint) error {
    // Check if verse exists
    verse, err := s.verseRepo.GetByID(verseID)
    if err != nil {
        return fmt.Errorf("verse not found: %w", err)
    }
    if verse == nil {
        return errors.New("verse not found")
    }
    
    // Check if already favorited
    exists, err := s.favoriteRepo.Exists(userID, verseID)
    if err != nil {
        return fmt.Errorf("failed to check favorite: %w", err)
    }
    if exists {
        return errors.New("verse already in favorites")
    }
    
    // Create favorite
    favorite := &models.Favorite{
        UserID:  userID,
        VerseID: verseID,
    }
    
    return s.favoriteRepo.Create(favorite)
}

// RemoveFavorite removes a verse from user's favorites
func (s *FavoriteService) RemoveFavorite(userID, favoriteID uint) error {
    // Get favorite to verify ownership
    favorite, err := s.favoriteRepo.GetByID(favoriteID)
    if err != nil {
        return fmt.Errorf("favorite not found: %w", err)
    }
    
    // Verify user owns this favorite
    if favorite.UserID != userID {
        return errors.New("unauthorized: favorite belongs to another user")
    }
    
    return s.favoriteRepo.Delete(favoriteID)
}

// RemoveFavoriteByVerse removes a favorite by verse ID
func (s *FavoriteService) RemoveFavoriteByVerse(userID, verseID uint) error {
    return s.favoriteRepo.DeleteByUserAndVerse(userID, verseID)
}

// IsFavorited checks if a verse is favorited by user
func (s *FavoriteService) IsFavorited(userID, verseID uint) (bool, error) {
    return s.favoriteRepo.Exists(userID, verseID)
}