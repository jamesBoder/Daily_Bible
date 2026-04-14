package repository

import (
    "errors"
    "time"

    "gorm.io/gorm"
    "dailybible/internal/models"
)

// UserRepository handles CRUD operations for User model
type UserRepository interface {
    Create(user *models.User) error
    GetByID(id uint) (*models.User, error)
    GetByEmail(email string) (*models.User, error)
    GetByUsername(username string) (*models.User, error)
    Update(user *models.User) error
    Delete(id uint) error
    List(limit, offset int) ([]models.User, error)
    GetByGoogleID(googleID string) (*models.User, error)
    UpdateGoogleInfo(userID uint, googleID, email, picture string) error
    RemoveGoogleLink(userID uint) error

    // Email verification
    UpdateVerificationToken(userID uint, token string, expiresAt time.Time) error
    GetByVerificationToken(token string) (*models.User, error)
    ClearVerificationToken(userID uint) error

    // Pending email change
    SetPendingEmail(userID uint, pendingEmail, token string, expiresAt time.Time) error
    GetByPendingEmailToken(token string) (*models.User, error)
    ApplyPendingEmail(userID uint) error
    CancelPendingEmail(userID uint) error

    // Password reset
    UpdateResetToken(userID uint, token string, expiresAt time.Time) error
    GetByResetToken(token string) (*models.User, error)
    ClearResetToken(userID uint) error

    // Onboarding email sequence
    MarkOnboardingScheduled(userID uint) error
}

// define the struct that implements UserRepository
type userRepository struct {
    db *gorm.DB
}

// Constructor
func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}


func (r *userRepository) Create(user *models.User) error {
    return r.db.Create(user).Error
}


func (r *userRepository) GetByID(id uint) (*models.User, error) {
    var user models.User
    err := r.db.First(&user, id).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}


func (r *userRepository) GetByEmail(email string) (*models.User, error) {
    var user models.User
    err := r.db.Where("email = ?", email).First(&user).Error
    if err == gorm.ErrRecordNotFound {
        return nil, errors.New("user not found")
    }
    return &user, nil
}

func (r *userRepository) GetByUsername(username string) (*models.User, error) {
    var user models.User
    err := r.db.Where("username = ?", username).First(&user).Error
    if err == gorm.ErrRecordNotFound {
        return nil, errors.New("user not found")
    }
    return &user, nil
}


func (r *userRepository) Update(user *models.User) error {
    return r.db.Save(user).Error
}


func (r *userRepository) Delete(id uint) error {
    return r.db.Delete(&models.User{}, id).Error
}

func (r *userRepository) List(limit, offset int) ([]models.User, error) {
    var users []models.User
    err := r.db.Limit(limit).Offset(offset).Find(&users).Error
    if err != nil {
        return nil, err
    }
    return users, nil
}

// GetByGoogleID retrieves a user by their Google ID
func (r *userRepository) GetByGoogleID(googleID string) (*models.User, error) {
    var user models.User
    err := r.db.Where("google_id = ?", googleID).First(&user).Error
    if err == gorm.ErrRecordNotFound {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// UpdateGoogleInfo updates the Google-related information for a user
func (r *userRepository) UpdateGoogleInfo(userID uint, googleID, email, picture string) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
        "google_id":        &googleID,
        "google_email":     &email,
        "google_picture":   &picture,
        "is_google_linked": true,
    }).Error
}

// RemoveGoogleLink removes the Google link from a user's account
func (r *userRepository) RemoveGoogleLink(userID uint) error {
    // Use UpdateColumns instead of Updates to bypass hooks and update nil values
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "google_id":       nil,
        "google_email":    nil,
        "google_picture":  nil,
        "is_google_linked": false,
    }).Error
}

// UpdateVerificationToken sets a new email verification token and expiry for a user
func (r *userRepository) UpdateVerificationToken(userID uint, token string, expiresAt time.Time) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "verification_token":            token,
        "verification_token_expires_at": expiresAt,
        "email_verified":                false,
    }).Error
}

// GetByVerificationToken retrieves a user by their email verification token
func (r *userRepository) GetByVerificationToken(token string) (*models.User, error) {
    var user models.User
    err := r.db.Where("verification_token = ?", token).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// ClearVerificationToken marks the user as email-verified and clears the token fields
func (r *userRepository) ClearVerificationToken(userID uint) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "verification_token":            nil,
        "verification_token_expires_at": nil,
        "email_verified":                true,
    }).Error
}

// SetPendingEmail stores a pending email change with a verification token.
// The user's current email is unchanged until ApplyPendingEmail is called.
func (r *userRepository) SetPendingEmail(userID uint, pendingEmail, token string, expiresAt time.Time) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "pending_email":                pendingEmail,
        "pending_email_token":          token,
        "pending_email_token_expires_at": expiresAt,
    }).Error
}

// GetByPendingEmailToken retrieves a user by their pending-email verification token.
func (r *userRepository) GetByPendingEmailToken(token string) (*models.User, error) {
    var user models.User
    err := r.db.Where("pending_email_token = ?", token).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// ApplyPendingEmail promotes pending_email to the live email field and marks the address verified.
func (r *userRepository) ApplyPendingEmail(userID uint) error {
    return r.db.Exec(
        `UPDATE users SET email = pending_email, email_verified = true,
         pending_email = NULL, pending_email_token = NULL, pending_email_token_expires_at = NULL
         WHERE id = ?`, userID,
    ).Error
}

// CancelPendingEmail clears a pending email change without applying it.
func (r *userRepository) CancelPendingEmail(userID uint) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "pending_email":                  nil,
        "pending_email_token":            nil,
        "pending_email_token_expires_at": nil,
    }).Error
}

// UpdateResetToken sets a new password reset token and expiry for a user
func (r *userRepository) UpdateResetToken(userID uint, token string, expiresAt time.Time) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "reset_token":            token,
        "reset_token_expires_at": expiresAt,
    }).Error
}

// GetByResetToken retrieves a user by their password reset token
func (r *userRepository) GetByResetToken(token string) (*models.User, error) {
    var user models.User
    err := r.db.Where("reset_token = ?", token).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// MarkOnboardingScheduled records that the onboarding email sequence has been
// scheduled for this user. Idempotent: safe to call more than once, but callers
// should check OnboardingEmailSentAt == nil before doing so.
func (r *userRepository) MarkOnboardingScheduled(userID uint) error {
    now := time.Now()
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "onboarding_email_sent_at": now,
    }).Error
}

// ClearResetToken invalidates the password reset token after use
func (r *userRepository) ClearResetToken(userID uint) error {
    return r.db.Model(&models.User{}).Where("id = ?", userID).UpdateColumns(map[string]interface{}{
        "reset_token":            nil,
        "reset_token_expires_at": nil,
    }).Error
}
