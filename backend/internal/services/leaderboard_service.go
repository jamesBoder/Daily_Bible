package services

import (
	"fmt"
	"sync"
	"time"

	"gorm.io/gorm"
)

// LeaderboardEntry is one row in the community leaderboard response.
type LeaderboardEntry struct {
	Rank          int    `json:"rank"`
	Username      string `json:"username"`
	CurrentStreak int    `json:"current_streak"`
	MilestoneKey  string `json:"milestone_key"`
	IsSelf        bool   `json:"is_self"`
	IsPremium     bool   `json:"is_premium"`
}

// cachedBoardRow holds base row data (including userID) for IsSelf resolution per request.
type cachedBoardRow struct {
	UserID        uint
	Username      string
	CurrentStreak int
	MilestoneKey  string
	IsPremium     bool
	Rank          int
}

// leaderboardCache holds TTL-cached community board data.
type leaderboardCache struct {
	mu       sync.Mutex
	rows     []cachedBoardRow
	cachedAt time.Time
}

const leaderboardTTL = 5 * time.Minute

// LeaderboardService fetches ranked streak data.
type LeaderboardService struct {
	db    *gorm.DB
	cache leaderboardCache
}

// NewLeaderboardService creates a new LeaderboardService.
func NewLeaderboardService(db *gorm.DB) *LeaderboardService {
	return &LeaderboardService{db: db}
}

// GetFriendsBoard returns the requesting user's accepted friends sorted by current_streak DESC,
// with the requesting user's own entry included and marked IsSelf=true.
func (s *LeaderboardService) GetFriendsBoard(userID uint) ([]LeaderboardEntry, error) {
	type queryRow struct {
		ID            uint
		Username      string
		CurrentStreak int
		MilestoneKey  string
	}

	// Friends
	var friendRows []queryRow
	if err := s.db.Table("user_friends uf").
		Select(`u.id,
			u.username,
			COALESCE(us.current_streak, 0) AS current_streak,
			COALESCE(
				(SELECT milestone_key FROM user_milestones
				 WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
			'') AS milestone_key`).
		Joins("JOIN users u ON u.id = uf.friend_id AND u.deleted_at IS NULL").
		Joins("LEFT JOIN user_streaks us ON us.user_id = u.id").
		Where("uf.user_id = ? AND uf.status = 'accepted'", userID).
		Order("current_streak DESC").
		Scan(&friendRows).Error; err != nil {
		return nil, err
	}

	// Self
	var self queryRow
	s.db.Table("users u").
		Select(`u.id,
			u.username,
			COALESCE(us.current_streak, 0) AS current_streak,
			COALESCE(
				(SELECT milestone_key FROM user_milestones
				 WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
			'') AS milestone_key`).
		Joins("LEFT JOIN user_streaks us ON us.user_id = u.id").
		Where("u.id = ? AND u.deleted_at IS NULL", userID).
		Scan(&self)

	entries := make([]LeaderboardEntry, 0, len(friendRows)+1)
	entries = append(entries, LeaderboardEntry{
		Username:      self.Username,
		CurrentStreak: self.CurrentStreak,
		MilestoneKey:  self.MilestoneKey,
		IsSelf:        true,
	})
	for _, r := range friendRows {
		entries = append(entries, LeaderboardEntry{
			Username:      r.Username,
			CurrentStreak: r.CurrentStreak,
			MilestoneKey:  r.MilestoneKey,
		})
	}
	return entries, nil
}

// GetCommunityBoard returns the top 100 users by current_streak who opted in.
// Result is cached for 5 minutes. requestingUserID==0 means unauthenticated guest.
// Guests see anonymized usernames. Authenticated users see real names and their own entry marked IsSelf.
func (s *LeaderboardService) GetCommunityBoard(requestingUserID uint) ([]LeaderboardEntry, error) {
	rows, err := s.getCachedRows()
	if err != nil {
		return nil, err
	}

	out := make([]LeaderboardEntry, 0, len(rows))
	for _, r := range rows {
		username := r.Username
		isSelf := r.UserID == requestingUserID

		if requestingUserID == 0 {
			// Guest: anonymize to "walker_XYZ" using last 3 digits of user ID
			username = fmt.Sprintf("walker_%03d", r.UserID%1000)
		}

		out = append(out, LeaderboardEntry{
			Rank:          r.Rank,
			Username:      username,
			CurrentStreak: r.CurrentStreak,
			MilestoneKey:  r.MilestoneKey,
			IsSelf:        isSelf,
			IsPremium:     r.IsPremium,
		})
	}
	return out, nil
}

// InvalidateCache clears the community board cache (called on leaderboard_visible toggle).
func (s *LeaderboardService) InvalidateCache() {
	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()
	s.cache.rows = nil
	s.cache.cachedAt = time.Time{}
}

// getCachedRows returns the cached board rows, refreshing if stale.
func (s *LeaderboardService) getCachedRows() ([]cachedBoardRow, error) {
	s.cache.mu.Lock()
	defer s.cache.mu.Unlock()

	if len(s.cache.rows) > 0 && time.Since(s.cache.cachedAt) < leaderboardTTL {
		return s.cache.rows, nil
	}

	type queryRow struct {
		UserID        uint
		Username      string
		CurrentStreak int
		MilestoneKey  string
		IsPremium     bool
	}
	var raw []queryRow
	if err := s.db.Table("users u").
		Select(`u.id AS user_id,
			u.username,
			COALESCE(us.current_streak, 0) AS current_streak,
			COALESCE(
				(SELECT milestone_key FROM user_milestones
				 WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1),
			'') AS milestone_key,
			EXISTS(
				SELECT 1 FROM user_subscriptions sub
				WHERE sub.user_id = u.id AND sub.status = 'active'
			) AS is_premium`).
		Joins("JOIN user_settings uset ON uset.user_id = u.id AND uset.leaderboard_visible = true").
		Joins("LEFT JOIN user_streaks us ON us.user_id = u.id").
		Where("u.deleted_at IS NULL").
		Order("current_streak DESC").
		Limit(100).
		Scan(&raw).Error; err != nil {
		return nil, err
	}

	rows := make([]cachedBoardRow, len(raw))
	for i, r := range raw {
		rows[i] = cachedBoardRow{
			UserID:        r.UserID,
			Username:      r.Username,
			CurrentStreak: r.CurrentStreak,
			MilestoneKey:  r.MilestoneKey,
			IsPremium:     r.IsPremium,
			Rank:          i + 1,
		}
	}
	s.cache.rows = rows
	s.cache.cachedAt = time.Now()
	return rows, nil
}
