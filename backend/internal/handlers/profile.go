package handlers

// imports

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"dailybible/internal/models"
	"dailybible/internal/password"
	"dailybible/internal/repository"
	"github.com/go-playground/validator/v10"
)

// ProfileHandler struct

type ProfileHandler struct {
	userRepo            repository.UserRepository
	favoriteRepo        repository.FavoriteRepository
	historyRepo         repository.HistoryRepository
	commentRepo         *repository.CommentRepository
	passwordHistoryRepo repository.PasswordHistoryRepository
	validator           *validator.Validate
}

// constructor init handler with dependencies

func NewProfileHandler(
	userRepo repository.UserRepository,
	favoriteRepo repository.FavoriteRepository,
	historyRepo repository.HistoryRepository,
	commentRepo *repository.CommentRepository,
	passwordHistoryRepo repository.PasswordHistoryRepository,
	emailService interface{}, // Keep for compatibility but unused
	emailValidator interface{}, // Keep for compatibility but unused
	validator *validator.Validate,
) *ProfileHandler {
	return &ProfileHandler{
		userRepo:            userRepo,
		favoriteRepo:        favoriteRepo,
		historyRepo:         historyRepo,
		commentRepo:         commentRepo,
		passwordHistoryRepo: passwordHistoryRepo,
		validator:           validator,
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
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"created_at": user.CreatedAt,
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
		Username string `json:"username"`
		Email    string `json:"email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
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

	// update user fields if provided
	if req.Username != "" && req.Username != user.Username {
		// Check if username is already taken
		existingUser, _ := h.userRepo.GetByUsername(req.Username)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
			return
		}
		user.Username = req.Username
	}

	if req.Email != "" && req.Email != user.Email {
		// Check if email is already taken
		existingUser, _ := h.userRepo.GetByEmail(req.Email)
		if existingUser != nil && existingUser.ID != user.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})
			return
		}
		user.Email = req.Email
	}

	// save updated user
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// respond with updated user profile data
	c.JSON(http.StatusOK, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"created_at": user.CreatedAt,
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

	// get favorites count
	favoritesCount, err := h.favoriteRepo.CountByUserID(userID.(uint))
	if err != nil {
		log.Printf("Failed to get favorites count: %v", err)
		favoritesCount = 0
	}

	// get history count
	historyCount, err := h.historyRepo.CountByUserID(userID.(uint))
	if err != nil {
		log.Printf("Failed to get history count: %v", err)
		historyCount = 0
	}

	// get comments count
	commentsCount, err := h.commentRepo.CountByUserID(userID.(uint))
	if err != nil {
		log.Printf("Failed to get comments count: %v", err)
		commentsCount = 0
	}

	// respond with stats
	c.JSON(http.StatusOK, gin.H{
		"favorites_count": favoritesCount,
		"history_count":   historyCount,
		"comments_count":  commentsCount,
	})
}

// SetPassword handler - for users who don't have a password yet
func (h *ProfileHandler) SetPassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		Password string `json:"password" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// validate password strength
	if valid, err := password.ValidatePasswordStrength(req.Password); !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password does not meet requirements",
			"details": err.Error(),
		})
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

	// Check if user already has a password
	if user.Password != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password already set. Use update password instead."})
		return
	}

	// Set the password
	if err := user.SetPassword(req.Password); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set password"})
		return
	}

	// Save user
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password set successfully"})
}

// UpdatePassword handler
func (h *ProfileHandler) UpdatePassword(c *gin.Context) {
	// extract userID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// parse request body
	var req struct {
		CurrentPassword string `json:"current_password" validate:"required"`
		NewPassword     string `json:"new_password" validate:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// validate new password strength
	if valid, err := password.ValidatePasswordStrength(req.NewPassword); !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "New password does not meet requirements",
			"details": err.Error(),
		})
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

	// Verify current password
	if !user.CheckPassword(req.CurrentPassword) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Check if new password is same as current
	if user.CheckPassword(req.NewPassword) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password must be different from current password"})
		return
	}

	// Save current password to history
	if h.passwordHistoryRepo != nil {
		if err := h.passwordHistoryRepo.Create(&models.PasswordHistory{
			UserID:       user.ID,
			PasswordHash: user.Password,
		}); err != nil {
			log.Printf("Failed to save password history: %v", err)
		}
	}

	// Set new password
	if err := user.SetPassword(req.NewPassword); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set new password"})
		return
	}

	// Save user
	if err := h.userRepo.Update(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save new password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

