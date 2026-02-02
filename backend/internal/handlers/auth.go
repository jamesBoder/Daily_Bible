package handlers

import (
	"net/http"
	"time"

	"dailybible/internal/repository"
	"dailybible/internal/services"
	"dailybible/internal/models"
	"dailybible/internal/password"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	
)

// init AuthHanlder struct
type AuthHandler struct {
	userRepo repository.UserRepository
	tokenService *services.TokenService
	validator *validator.Validate
	
}

// Constructor
func NewAuthHandler(userRepo repository.UserRepository, tokenService *services.TokenService) *AuthHandler {
	return &AuthHandler{
		userRepo:     userRepo,
		tokenService: tokenService,
		validator:    validator.New(),
	}
}

// create request struct for registration
type RegisterRequest struct {
	// add json tags
	Email    string `json:"email" validate:"required,email"`	
	Username string `json:"username" validate:"required,alphanum"`
	Password string `json:"password" validate:"required,min=8"`
}

// create response struct for registration
type RegisterResponse struct {
	User    UserResponse `json:"user"`
	Token   string `json:"token"`
}
	
// create user response struct
type UserResponse struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	CreatedAt time.Time `json:"created_at"`
	GoogleID       string    `json:"google_id,omitempty"`
    GoogleEmail    string    `json:"google_email,omitempty"`
    GooglePicture  string    `json:"google_picture,omitempty"`
    IsGoogleLinked bool      `json:"is_google_linked"`
}

// Register handler
func (h *AuthHandler) Register(c *gin.Context) {
	// Parse request body
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req);  err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// validate using validator
	if err := h.validator.Struct(req); err != nil {
		var errors []string
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, err.Field()+" is "+err.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errors})
		return
	}


	// validate input password.ValidatePasswordStrength(req.Password)
	validPassword, err := password.ValidatePasswordStrength(req.Password)
	if !validPassword {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password does not meet strength requirements: " + err.Error()})
		return
	}

	// check if user with email or username already exists
	existingUserByEmail, _ := h.userRepo.GetByEmail(req.Email)
	if existingUserByEmail != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	
	// check username uniqueness
	existingUserByUsername, _ := h.userRepo.GetByUsername(req.Username)
	if existingUserByUsername != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this username already exists"})
		return
	}

	// create new user
	newUser := &models.User{
		Email:    req.Email,
		Username: req.Username,
		Password: req.Password, // will be hashed in BeforeCreate hook
	}

	// save user to database
	if err := h.userRepo.Create(newUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
		return
	}

	// generate JWT token
	token, err := h.tokenService.GenerateToken(newUser.ID, newUser.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	// prepare response
	resp := RegisterResponse{
		User: UserResponse{
			ID:        newUser.ID,
			Email:     newUser.Email,
			Username:  newUser.Username,
			CreatedAt: newUser.CreatedAt,
			GoogleID:       getStringValue(newUser.GoogleID),
			GoogleEmail:    getStringValue(newUser.GoogleEmail),
			GooglePicture:  getStringValue(newUser.GooglePicture),
			IsGoogleLinked: newUser.IsGoogleLinked,
		},
		Token: token,
	}

	// return 201 created with JSON response
	c.JSON(http.StatusCreated, resp)

}


// init LoginRequest struct
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// init LoginResponse struct
type LoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`

}

func (h *AuthHandler) Login(c *gin.Context) {
	// parse and bind JSON req body
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// validate using validator
	if err := h.validator.Struct(req); err != nil {
		var errors []string
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, err.Field()+" is "+err.Tag())
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed", "details": errors})
		return
	}

	// look up user by email
	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// verify password
	if !password.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	
	// generate JWT token
	token, err := h.tokenService.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token: " + err.Error()})
		return
	}

	// return 200 ok with user data and token
	resp := LoginResponse{
		User: UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			CreatedAt: user.CreatedAt,
			GoogleID:       getStringValue(user.GoogleID),
			GoogleEmail:    getStringValue(user.GoogleEmail),
			GooglePicture:  getStringValue(user.GooglePicture),
			IsGoogleLinked: user.IsGoogleLinked,
		},
		Token: token,
	}

	c.JSON(http.StatusOK, resp)
}

// Logout handler - since JWT is stateless, we just return success
// The client will remove the token from localStorage
func (h *AuthHandler) Logout(c *gin.Context) {
	// In a stateless JWT system, logout is handled client-side by removing the token
	// If you want to implement token blacklisting, you would add the token to a blacklist here
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}

//init GetMe struct
type GetMeResponse struct {
	User  UserResponse `json:"user"`
}

// GetMe handler
func (h *AuthHandler) GetMe(c *gin.Context) {
	// retrieve userID from context
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// fetch user from database
	user, err := h.userRepo.GetByID(userID.(uint))
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// prepare response
	resp := GetMeResponse{
		User: UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Username:  user.Username,
			CreatedAt: user.CreatedAt,
			GoogleID:       getStringValue(user.GoogleID),
			GoogleEmail:    getStringValue(user.GoogleEmail),
			GooglePicture:  getStringValue(user.GooglePicture),
			IsGoogleLinked: user.IsGoogleLinked,
		},
	}

	// return 200 ok with user data
	c.JSON(http.StatusOK, resp)
}

// Helper function to safely get string value from pointer
func getStringValue(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
