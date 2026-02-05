package handlers

// imports 

import (
	"net/http"
	
	"time"

	"github.com/gin-gonic/gin"
	
	"dailybible/internal/repository"
	"dailybible/internal/password"
	"github.com/go-playground/validator/v10"



)

// ProfileHandler struct

type ProfileHandler struct {
	userRepo repository.UserRepository
	favoriteRepo repository.FavoriteRepository
	historyRepo repository.HistoryRepository
	commentRepo *repository.CommentRepository
	validator *validator.Validate
} 

// constructor init handler with dependencies

func NewProfileHandler(
	userRepo repository.UserRepository,
	favoriteRepo repository.FavoriteRepository,
	historyRepo repository.HistoryRepository,
	commentRepo *repository.CommentRepository,
	validator *validator.Validate,
) *ProfileHandler {
	return &ProfileHandler{
		userRepo:    userRepo,
		favoriteRepo: favoriteRepo,
		historyRepo: historyRepo,
		commentRepo: commentRepo,
		validator:   validator,
	}
}

// GetProfile handler 
func (h *ProfileHandler) GetProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID") 
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// fetch user from userRepo
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// respond with user profile data
	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"username":       user.Username,
		"email":          user.Email,
		"created_at":     user.CreatedAt,
		"google_id":      getStringValue(user.GoogleID),
		"google_email":   getStringValue(user.GoogleEmail),
		"google_picture": getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
	
}

// UpdateProfile handler
func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID") 
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		Username string `json:"username" validate:"required,min=3,max=50"`
		Email    string `json:"email" validate:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// check if user exists
	user, err := h.userRepo.GetByID(userID.(uint)) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if email is being changed and if it's already taken by another user
	if req.Email != user.Email {
		existingUser, _ := h.userRepo.GetByEmail(req.Email)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already in use"})
			return
		}
	}

	// Check if username is being changed and if it's already taken by another user
	if req.Username != user.Username {
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already in use"})
			return
		}
	}

	// update user via userRepo.Update()
	user.Username = req.Username
	user.Email = req.Email

	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	// respond with updated profile data
	c.JSON(http.StatusOK, gin.H{
		"id":             user.ID,
		"username":       user.Username,
		"email":          user.Email,
		"created_at":     user.CreatedAt,
		"google_id":      getStringValue(user.GoogleID),
		"google_email":   getStringValue(user.GoogleEmail),
		"google_picture": getStringValue(user.GooglePicture),
		"is_google_linked": user.IsGoogleLinked,
	})
}

// GetStats handler 
func (h *ProfileHandler) GetStats(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID") 
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// count favorite favoriteRepo.CountByUserID
	favCount, err := h.favoriteRepo.CountByUserID(userID.(uint))


	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite count"})
		return
	}

	// count history: historyRepo.CountByUserID
	histCount, err := h.historyRepo.CountByUserID(userID.(uint))


	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch history count"})
		return
	}

	// count comments: commentRepo.CountByUserID
	commentCount, err := h.commentRepo.CountByUserID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comment count"})
		return
	}

	// calculate account age: time.Since(user.CreatedAt)
	user, err := h.userRepo.GetByID(userID.(uint)) 
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	accountAge := int64((time.Since(user.CreatedAt)).Hours() / 24) // in days

	// respond with stats
	c.JSON(http.StatusOK, gin.H{
		"favorite_count": favCount,
		"history_count":  histCount,
		"comment_count":  commentCount,
		"account_age_days": accountAge,
	})
}

// UpdatePassword handler - allows users to change their password
func (h *ProfileHandler) UpdatePassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		CurrentPassword string `json:"currentPassword" validate:"required"`
		NewPassword     string `json:"newPassword" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// validate input
	if err := h.validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": err.Error()})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// check if user is OAuth-only (no password set)
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot change password for OAuth-only accounts",
			"details": "Please set a password first or continue using Google login",
		})
		return
	}

	// verify current password
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password is incorrect"})
		return
	}

	// validate new password strength
	validPassword, err := password.ValidatePasswordStrength(req.NewPassword)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "New password does not meet requirements",
			"details": err.Error(),
		})
		return
	}

	// check if new password is same as current password
	if req.CurrentPassword == req.NewPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be different from current password"})
		return
	}

	// update password (SetPassword will hash it)
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// save to database
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	// respond with success
	c.JSON(http.StatusOK, gin.H{
		"message": "Password updated successfully",
	})
}
