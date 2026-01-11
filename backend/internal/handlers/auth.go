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
}

// Placeholder handlers - will implement later
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
		},
		Token: token,
	}

	// return 201 created with JSON response
	c.JSON(http.StatusCreated, resp)

}

func Login(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Login endpoint - to be implemented"))
}

func Logout(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("Logout endpoint - to be implemented"))
}

func GetMe(c *gin.Context) {
	c.Writer.WriteHeader(http.StatusNotImplemented)
	c.Writer.Write([]byte("GetMe endpoint - to be implemented"))
}
