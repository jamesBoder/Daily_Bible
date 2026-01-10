package services

import (

	"fmt"
	"errors"


	"dailybible/internal/models"
	"dailybible/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

const (
	// Define any password policy constants here
	MinPasswordLength = 8
	BcryptCost       = 12
)

// password hashing function
func HashPassword(password string) (string, error) {
	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), BcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashedBytes), nil
}

// password comparison function
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// password validation function
func ValidatePasswordStrength(password string) bool {
	// checks for minimum length
	if len(password) < MinPasswordLength {
		errors.New(fmt.Sprintf("Password must be at least %d characters long", MinPasswordLength))
		return false
	}

	// checks for uppercase, lowercase, digit, special character
	var hasUpper, hasLower, hasDigit, hasSpecial bool
	for _, char := range password {
		switch {
		case 'A' <= char && char <= 'Z':
			hasUpper = true
		case 'a' <= char && char <= 'z':
			hasLower = true
		case '0' <= char && char <= '9':
			hasDigit = true
		case (char >= 33 && char <= 47) || (char >= 58 && char <= 64) ||
			(char >= 91 && char <= 96) || (char >= 123 && char <= 126):
			hasSpecial = true
		}
	}
	return hasUpper && hasLower && hasDigit && hasSpecial


}

