package services

// TokenService handles token generation and validation

import (
	"fmt"
	"time"

	"dailybible/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

// define TokenClaims struct
type TokenClaims struct {
	UserID uint
	Email  string
	jwt.RegisteredClaims
}

// define TokenService interface
type TokenService struct {
	config *config.Config
}

// create NewTokenService constructor
func NewTokenService(cfg *config.Config) *TokenService {
	return &TokenService{config: cfg}
}

// create GenerateToken method
func (tc *TokenService) GenerateToken(userid uint, email string) (string, error) {

	// Set the token expiration time
	expirationTime := time.Now().Add(168 * time.Hour)

	// Create the JWT claims, which includes the user ID and expiry time
	claims := &TokenClaims{
		UserID: userid,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	// Declare the token with the algorithm used for signing, and the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Create the JWT string
	tokenString, err := token.SignedString([]byte(tc.config.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// create ValidateToken method
func (tc *TokenService) ValidateToken(tokenString string) (*TokenClaims, error) {
	// Parse the JWT string and store the result in `claims`.
	claims := &TokenClaims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(tc.config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// UnsubClaims is used exclusively for email unsubscribe tokens.
// The Type field prevents these tokens from being accepted as auth tokens.
type UnsubClaims struct {
	UserID uint   `json:"uid"`
	Type   string `json:"type"` // always "unsub"
	jwt.RegisteredClaims
}

// GenerateUnsubscribeToken creates a JWT valid for 90 days that can only be
// used to unsubscribe the given user from daily reminder emails.
func (tc *TokenService) GenerateUnsubscribeToken(userID uint) (string, error) {
	claims := &UnsubClaims{
		UserID: userID,
		Type:   "unsub",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(90 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(tc.config.JWTSecret))
}

// VerifyUnsubscribeToken validates an unsubscribe token and returns the UserID.
// Returns an error if the token is invalid, expired, or not of type "unsub".
func (tc *TokenService) VerifyUnsubscribeToken(tokenStr string) (uint, error) {
	claims := &UnsubClaims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(tc.config.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		return 0, fmt.Errorf("invalid or expired unsubscribe token")
	}
	if claims.Type != "unsub" {
		return 0, fmt.Errorf("wrong token type")
	}
	return claims.UserID, nil
}

// RefreshToken Method
func (tc *TokenService) RefreshToken(tokenString string) (string, error) {
	claims, err := tc.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	// Create a new token for the user with a renewed expiration time
	return tc.GenerateToken(claims.UserID, claims.Email)
}
