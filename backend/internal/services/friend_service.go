package services

import (
	"errors"
	"fmt"

	"dailybible/internal/models"

	"gorm.io/gorm"
)

// FriendService manages friend connections between users.
type FriendService struct {
	db *gorm.DB
}

// NewFriendService creates a new FriendService.
func NewFriendService(db *gorm.DB) *FriendService {
	return &FriendService{db: db}
}

// FriendWithStreak contains a friend's identity and streak data.
type FriendWithStreak struct {
	FriendID       uint   `json:"friend_id"`
	Username       string `json:"username"`
	CurrentStreak  int    `json:"current_streak"`
	LongestStreak  int    `json:"longest_streak"`
	MilestoneKey   string `json:"milestone_key"`
	AvatarInitials string `json:"avatar_initials"`
}

// PendingRequest is an incoming friend request not yet accepted or rejected.
type PendingRequest struct {
	RequestID  uint   `json:"request_id"`
	FromUserID uint   `json:"from_user_id"`
	Username   string `json:"username"`
	CreatedAt  string `json:"created_at"`
}

// SendRequest creates a pending friend request from fromUserID to the user identified by toUsername.
// Returns error if already friends, a request already exists, user not found, or self-request.
func (s *FriendService) SendRequest(fromUserID uint, toUsername string) error {
	// Resolve username to user ID
	var toUser models.User
	if err := s.db.Where("username = ? AND deleted_at IS NULL", toUsername).First(&toUser).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("user not found")
		}
		return err
	}

	if toUser.ID == fromUserID {
		return fmt.Errorf("cannot add yourself as a friend")
	}

	// Check for an existing pending or accepted relationship in either direction
	var count int64
	s.db.Model(&models.UserFriend{}).
		Where(
			"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
			fromUserID, toUser.ID, toUser.ID, fromUserID,
		).Count(&count)
	if count > 0 {
		return fmt.Errorf("friendship or request already exists")
	}

	row := models.UserFriend{
		UserID:   fromUserID,
		FriendID: toUser.ID,
		Status:   "pending",
	}
	return s.db.Create(&row).Error
}

// AcceptRequest accepts a pending request by its UserFriend row ID.
// toUserID must match the FriendID on the row — prevents accepting someone else's request.
// Creates the reciprocal (B→A) row on acceptance.
func (s *FriendService) AcceptRequest(requestID uint, toUserID uint) error {
	var req models.UserFriend
	if err := s.db.Where("id = ? AND friend_id = ? AND status = 'pending'", requestID, toUserID).
		First(&req).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return fmt.Errorf("request not found")
		}
		return err
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Mark original request as accepted
		if err := tx.Model(&req).Update("status", "accepted").Error; err != nil {
			return err
		}
		// Create reciprocal row — uniqueIndex prevents duplicates if called twice
		reciprocal := models.UserFriend{
			UserID:   toUserID,
			FriendID: req.UserID,
			Status:   "accepted",
		}
		result := tx.Where("user_id = ? AND friend_id = ?", toUserID, req.UserID).
			FirstOrCreate(&reciprocal)
		return result.Error
	})
}

// RejectRequest deletes a pending friend request row.
// toUserID must match the FriendID on the row.
func (s *FriendService) RejectRequest(requestID uint, toUserID uint) error {
	result := s.db.Where("id = ? AND friend_id = ? AND status = 'pending'", requestID, toUserID).
		Delete(&models.UserFriend{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("request not found")
	}
	return nil
}

// RemoveFriend removes both rows of an accepted friendship.
// friendID is the other user's ID (not the UserFriend row ID).
func (s *FriendService) RemoveFriend(userID uint, friendID uint) error {
	result := s.db.Where(
		"(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
		userID, friendID, friendID, userID,
	).Delete(&models.UserFriend{})
	return result.Error
}

// GetFriends returns the list of accepted friends with their streak info.
func (s *FriendService) GetFriends(userID uint) ([]FriendWithStreak, error) {
	// Get accepted friend user IDs
	var rows []models.UserFriend
	if err := s.db.Where("user_id = ? AND status = 'accepted'", userID).Find(&rows).Error; err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []FriendWithStreak{}, nil
	}

	friendIDs := make([]uint, len(rows))
	for i, r := range rows {
		friendIDs[i] = r.FriendID
	}

	// Fetch username + streak in one query
	type row struct {
		ID            uint
		Username      string
		CurrentStreak int
		LongestStreak int
	}
	var data []row
	if err := s.db.Table("users").
		Select("users.id, users.username, COALESCE(us.current_streak,0) AS current_streak, COALESCE(us.longest_streak,0) AS longest_streak").
		Joins("LEFT JOIN user_streaks us ON us.user_id = users.id").
		Where("users.id IN ? AND users.deleted_at IS NULL", friendIDs).
		Scan(&data).Error; err != nil {
		return nil, err
	}

	// Build result, fetching latest milestone per friend
	result := make([]FriendWithStreak, 0, len(data))
	for _, d := range data {
		mk := s.latestMilestoneKey(d.ID)
		initials := ""
		if len(d.Username) > 0 {
			initials = string([]rune(d.Username)[0:1])
			initials = toUpper(initials)
		}
		result = append(result, FriendWithStreak{
			FriendID:       d.ID,
			Username:       d.Username,
			CurrentStreak:  d.CurrentStreak,
			LongestStreak:  d.LongestStreak,
			MilestoneKey:   mk,
			AvatarInitials: initials,
		})
	}
	return result, nil
}

// GetPendingRequests returns incoming friend requests not yet accepted or rejected.
func (s *FriendService) GetPendingRequests(userID uint) ([]PendingRequest, error) {
	type row struct {
		ID       uint
		UserID   uint
		Username string
		CreatedAt string
	}
	var rows []row
	if err := s.db.Table("user_friends").
		Select("user_friends.id, user_friends.user_id, users.username, user_friends.created_at::text AS created_at").
		Joins("JOIN users ON users.id = user_friends.user_id AND users.deleted_at IS NULL").
		Where("user_friends.friend_id = ? AND user_friends.status = 'pending'", userID).
		Scan(&rows).Error; err != nil {
		return nil, err
	}
	result := make([]PendingRequest, 0, len(rows))
	for _, r := range rows {
		result = append(result, PendingRequest{
			RequestID:  r.ID,
			FromUserID: r.UserID,
			Username:   r.Username,
			CreatedAt:  r.CreatedAt,
		})
	}
	return result, nil
}

// latestMilestoneKey returns the most recently earned milestone key for the user, or "".
func (s *FriendService) latestMilestoneKey(userID uint) string {
	var key string
	s.db.Table("user_milestones").
		Select("COALESCE(milestone_key, '')").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(1).
		Scan(&key)
	return key
}

// toUpper uppercases a single ASCII/Unicode letter string using strings package logic.
func toUpper(s string) string {
	if s == "" {
		return s
	}
	r := []rune(s)
	if r[0] >= 'a' && r[0] <= 'z' {
		r[0] -= 32
	}
	return string(r)
}
