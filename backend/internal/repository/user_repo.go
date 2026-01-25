package repository

import (
    "errors"
    
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
    UpdateGoogleInfor (userId uint, googleID, email, picture string) error
    RemoveGoogleLink(userId uint) error
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
