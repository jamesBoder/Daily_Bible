package services

import (
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type CommentService struct {
    commentRepo *repository.CommentRepository
}

func NewCommentService(commentRepo *repository.CommentRepository) *CommentService {
    return &CommentService{
        commentRepo: commentRepo,
    }
}

// Add or update comment
func (s *CommentService) AddOrUpdateComment(userID uint, verseID int, verseReference string, commentText string) (*models.Comment, error) {
    // Check if comment already exists
    existingComment, err := s.commentRepo.GetByUserAndVerse(userID, verseReference)
    
    if err == nil && existingComment != nil {
        // Update existing comment
        existingComment.CommentText = commentText
        err = s.commentRepo.Update(existingComment)
        return existingComment, err
    }
    
    // Create new comment
    comment := &models.Comment{
        UserID:         userID,
        VerseID:        verseID,
        VerseReference: verseReference,
        CommentText:    commentText,
    }
    
    err = s.commentRepo.Create(comment)
    return comment, err
}

// Get comment for specific verse
func (s *CommentService) GetCommentForVerse(userID uint, verseReference string) (*models.Comment, error) {
    return s.commentRepo.GetByUserAndVerse(userID, verseReference)
}

// Delete comment
func (s *CommentService) DeleteComment(commentID uint, userID uint) error {
    return s.commentRepo.Delete(commentID, userID)
}

// Get all user comments
func (s *CommentService) GetUserComments(userID uint) ([]models.Comment, error) {
    return s.commentRepo.GetByUser(userID)
}
