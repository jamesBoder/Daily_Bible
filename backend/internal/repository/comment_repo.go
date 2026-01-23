package repository

import (
    "dailybible/internal/models"
    "gorm.io/gorm"
)



type CommentRepository struct {
    db *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
    return &CommentRepository{db: db}
}

// Create a new comment
func (r *CommentRepository) Create(comment *models.Comment) error {
    return r.db.Create(comment).Error
}

// Get comment by user and verse reference
func (r *CommentRepository) GetByUserAndVerse(userID uint, verseReference string) (*models.Comment, error) {
    var comment models.Comment
    err := r.db.Where("user_id = ? AND verse_reference = ?", userID, verseReference).First(&comment).Error
    if err != nil {
        return nil, err
    }
    return &comment, nil
}

// Update comment
func (r *CommentRepository) Update(comment *models.Comment) error {
    return r.db.Save(comment).Error
}

// Delete comment
func (r *CommentRepository) Delete(id uint, userID uint) error {
    return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Comment{}).Error
}

// Get all comments by user
func (r *CommentRepository) GetByUser(userID uint) ([]models.Comment, error) {
    var comments []models.Comment
    err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&comments).Error
    return comments, err
}

// GetCountByUserID returns the total number of comments made by a user
func (r *CommentRepository) CountByUserID(userID uint) (int64, error) {
    var count int64
    err := r.db.Model(&models.Comment{}).Where("user_id = ?", userID).Count(&count).Error
    return count, err
}
