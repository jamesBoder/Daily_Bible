// Create oauth service 

package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"dailybible/internal/config"
	"dailybible/internal/models"
	"dailybible/internal/repository"
	"golang.org/x/oauth2"
	"io/ioutil"
)

// init OAuthService
type OAuthService struct {
	userRepo       repository.UserRepository
	tokenService    *TokenService
	oauthConfig   *oauth2.Config
}

// GetGoogleLoginURL generates URL to redirect user to Google OAuth consent page
func (s *OAuthService) GetGoogleLoginURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state)
}

// HandleGoogleCallback processes the OAuth callback from Google
func (s *OAuthService) HandleGoogleCallback(code string) (*models.User, error) {
	// Exchange code for token
	token, err := s.oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange token: %w", err)
	}

	// Fetch user info from Google
	client := s.oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user info response: %w", err)
	}

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Picture string `json:"picture"`
	}
	if err := json.Unmarshal(body, &googleUser); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	// Check if user already exists
	user, err := s.userRepo.GetByGoogleID(googleUser.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by Google ID: %w", err)
	}

	if user == nil {
		// Create new user
		user = &models.User{
			Email:         googleUser.Email,
			GoogleID:      googleUser.ID,
			GoogleEmail:   googleUser.Email,
			GooglePicture: googleUser.Picture,
			IsGoogleLinked: true,
		}
		if err := s.userRepo.Create(user); err != nil {
			return nil, fmt.Errorf("failed to create user: %w", err)
		}
	} else {
		// Update existing user info
		user.GoogleEmail = googleUser.Email
		user.GooglePicture = googleUser.Picture
		user.IsGoogleLinked = true
		if err := s.userRepo.Update(user); err != nil {
			return nil, fmt.Errorf("failed to update user: %w", err)
		}
	}

	return user, nil
}

// LinkGoogleAccount links a Google account to an existing user
func (s *OAuthService) LinkGoogleAccount(userID uint, googleID string) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	user.GoogleID = googleID
	user.IsGoogleLinked = true

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to link Google account: %w", err)
	}

	return nil
}

// UnlinkGoogleAccount remove google link from account 
func (s *OAuthService) UnlinkGoogleAccount(userID uint) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}
	if user == nil {
		return fmt.Errorf("user not found")
	}

	user.GoogleID = ""
	user.IsGoogleLinked = false

	if err := s.userRepo.Update(user); err != nil {
		return fmt.Errorf("failed to unlink Google account: %w", err)
	}

	return nil
}