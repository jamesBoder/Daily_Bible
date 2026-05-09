package services

import (
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"time"
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

// GetUserComments returns the user's reflections.
// hasFullAccess — true for subscribers or reflection_archive purchasers.
//
//	true:  all reflections, total = len(comments)
//	false: last 7 days only, total = full lifetime count (so the handler can
//	       surface an upgrade prompt when total > len(returned))
func (s *CommentService) GetUserComments(userID uint, hasFullAccess bool) (comments []models.Comment, total int64, err error) {
	if hasFullAccess {
		comments, err = s.commentRepo.GetByUser(userID)
		total = int64(len(comments))
		return
	}
	// Free tier: last 7 days only.
	since := time.Now().UTC().AddDate(0, 0, -7)
	comments, err = s.commentRepo.GetByUserSince(userID, since)
	if err != nil {
		return
	}
	total, err = s.commentRepo.CountByUser(userID)
	return
}
