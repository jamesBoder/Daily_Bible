package handlers

import (
	"net/http"
	"time"

	"dailybible/internal/models"
	"dailybible/internal/password"
	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// AuthHandler handles authentication-related requests
type AuthHandler struct {
	userRepo     repository.UserRepository
	tokenService *services.TokenService
	validator    *validator.Validate
}

// NewAuthHandler creates a new AuthHandler with required dependencies
func NewAuthHandler(
	userRepo repository.UserRepository,
	tokenService *services.TokenService,
) *AuthHandler {
	return &AuthHandler{
		userRepo:     userRepo,
		tokenService: tokenService,
		validator:    validator.New(),
	}
}

// UserResponse is the standard user object returned in API responses
type UserResponse struct {
	ID        uint      `json:"id"`
	Email     string    `json:"email"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

// buildUserResponse constructs a UserResponse from a User model
func buildUserResponse(user *models.User) UserResponse {
	return UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Username:  user.Username,
		CreatedAt: user.CreatedAt,
	}
}

// ── Register ──────────────────────────────────────────────────────────────────

type RegisterRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Username string `json:"username" validate:"required,alphanum"`
	Password string `json:"password" validate:"required,min=8"`
}

type RegisterResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// Register creates a new user account and logs them in immediately (no email verification)
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		var errs []string
		for _, e := range err.(validator.ValidationErrors) {
			errs = append(errs, e.Field()+" is "+e.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errs})
		return
	}

	// Validate password strength
	if valid, err := password.ValidatePasswordStrength(req.Password); !valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Password validation failed",
			"details": err.Error(),
			"field":   "password",
		})
		return
	}

	// Check email uniqueness
	if existing, _ := h.userRepo.GetByEmail(req.Email); existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Check username uniqueness
	if existing, _ := h.userRepo.GetByUsername(req.Username); existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this username already exists"})
		return
	}

	// Create user (BeforeCreate hook hashes password)
	newUser := &models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: req.Password,
	}
	if err := h.userRepo.Create(newUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	// Generate JWT token for immediate login
	jwtToken, err := h.tokenService.GenerateToken(newUser.ID, newUser.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, RegisterResponse{
		User:  buildUserResponse(newUser),
		Token: jwtToken,
	})
}

// ── Login ─────────────────────────────────────────────────────────────────────

type LoginRequest struct {
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// Login authenticates a user with email and password
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := h.validator.Struct(req); err != nil {
		var errs []string
		for _, e := range err.(validator.ValidationErrors) {
			errs = append(errs, e.Field()+" is "+e.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errs})
		return
	}

	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if !password.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	jwtToken, err := h.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, LoginResponse{
		User:  buildUserResponse(user),
		Token: jwtToken,
	})
}

// ── Logout ────────────────────────────────────────────────────────────────────

// Logout is a no-op for stateless JWT — the client removes the token
func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// ── GetMe ─────────────────────────────────────────────────────────────────────

type GetMeResponse struct {
	User UserResponse `json:"user"`
}

// GetMe returns the currently authenticated user's profile
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, GetMeResponse{User: buildUserResponse(user)})
}