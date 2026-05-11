package services_test

// Community service integration tests
//
// These tests connect to the Postgres container exposed by docker-compose.
// Every test wraps its fixtures in a transaction that is rolled back on exit —
// no permanent changes are made to the database.
//
// Prerequisites:
//   docker-compose up -d db
//
// Run (from the backend/ directory):
//
//   source ../.env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB \
//     go test ./internal/services/ -run TestCommunity -v
//
// Or from project root:
//   source .env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB \
//     go test ./backend/internal/services/ -run TestCommunity -v

import (
	"fmt"
	"os"
	"testing"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/database"
	"dailybible/internal/models"
	"dailybible/internal/services"

	"gorm.io/gorm"
)

// ─── helpers ────────────────────────────────────────────────────────────────

func setEnvDefault(key, val string) {
	if os.Getenv(key) == "" {
		os.Setenv(key, val)
	}
}

// openCommunityTestDB opens a test DB and skips the test if unavailable.
func openCommunityTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	setEnvDefault("DB_HOST", "localhost")
	setEnvDefault("DB_PORT", "5433")
	setEnvDefault("DB_USER", "dailybible_user")
	if os.Getenv("DB_NAME") == "" {
		if pg := os.Getenv("POSTGRES_DB"); pg != "" {
			os.Setenv("DB_NAME", pg)
		} else {
			os.Setenv("DB_NAME", "daily_bible_dev")
		}
	}
	setEnvDefault("DB_SSLMODE", "disable")

	if os.Getenv("DB_PASSWORD") == "" {
		t.Skip("DB_PASSWORD not set — run: source .env && DB_PASSWORD=$DB_PASSWORD DB_NAME=$POSTGRES_DB go test ./internal/services/ -run TestCommunity -v")
	}

	cfg, err := config.Load()
	if err != nil {
		t.Skipf("config.Load failed: %v", err)
	}
	db, err := database.Connect(cfg)
	if err != nil {
		t.Skipf("DB connect failed (DB not available): %v", err)
	}

	// Ensure community tables exist.
	if err := db.AutoMigrate(&models.CommunityPost{}, &models.CommunityReaction{}); err != nil {
		t.Fatalf("AutoMigrate community tables: %v", err)
	}
	return db
}

// beginTx starts a transaction and registers automatic rollback via t.Cleanup.
func beginTx(t *testing.T, db *gorm.DB) *gorm.DB {
	t.Helper()
	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("begin tx: %v", tx.Error)
	}
	t.Cleanup(func() { tx.Rollback() })
	return tx
}

// createTestUser inserts a minimal user row and returns its ID.
// Premium status is NOT stored in the DB here — it is controlled by stubChecker
// so pass the same bool to both createTestUser and newService for clarity.
// FK enforcement is relaxed by disabling triggers inside the same transaction.
func createTestUser(t *testing.T, tx *gorm.DB, username string, _ bool) uint {
	t.Helper()
	tx.Exec("SET session_replication_role = 'replica'")

	// Use a fake GoogleID to satisfy the BeforeCreate hook (OAuth path skips
	// password requirement) — same pattern as settings_test.go / subscription_test.go.
	nano := time.Now().UnixNano()
	googleID := fmt.Sprintf("community_test_google_%s_%d", username, nano)
	u := models.User{
		Username: fmt.Sprintf("%s_%d", username, nano),
		Email:    fmt.Sprintf("%s_%d@test.invalid", username, nano),
		GoogleID: &googleID,
	}
	if err := tx.Create(&u).Error; err != nil {
		t.Fatalf("createTestUser: %v", err)
	}
	return u.ID
}

// stubChecker is a SubscriptionChecker that returns a fixed premium value.
type stubChecker struct{ premium bool }

func (s *stubChecker) IsPremium(userID uint) bool { return s.premium }

// newService returns a CommunityService wired to tx with the given premium stub.
func newService(tx *gorm.DB, premium bool) *services.CommunityService {
	return services.NewCommunityService(tx, &stubChecker{premium: premium})
}

// ─── CreatePost tests ────────────────────────────────────────────────────────

// TestCommunity_CreatePost_UserType_RequiresPremium verifies that posting a
// "user" reflection returns an error for a non-premium user.
func TestCommunity_CreatePost_UserType_RequiresPremium(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "free_user", false)
	svc := newService(tx, false)

	_, err := svc.CreatePost(userID, "user", "This is my reflection", false)
	if err == nil {
		t.Fatal("expected error for non-premium user posting reflection, got nil")
	}
	if err.Error() != "premium subscription required to post reflections" {
		t.Errorf("unexpected error: %v", err)
	}
	t.Logf("✅ Non-premium user correctly rejected: %v", err)
}

// TestCommunity_CreatePost_UserType_PremiumSuccess verifies that a premium
// user can create a reflection post.
func TestCommunity_CreatePost_UserType_PremiumSuccess(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "premium_user", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "Blessed are the pure in heart.", false)
	if err != nil {
		t.Fatalf("premium user create post: %v", err)
	}
	if post.ID == 0 {
		t.Fatal("expected non-zero post ID")
	}
	if post.PostType != "user" {
		t.Errorf("post_type: got %q, want %q", post.PostType, "user")
	}
	if post.UserID == nil || *post.UserID != userID {
		t.Errorf("UserID mismatch: got %v, want %d", post.UserID, userID)
	}
	t.Logf("✅ Premium user created post ID=%d", post.ID)
}

// TestCommunity_CreatePost_PrayerType_AnyUser verifies that any authenticated
// user (premium=false) can submit a prayer request.
func TestCommunity_CreatePost_PrayerType_AnyUser(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "free_pray", false)
	svc := newService(tx, false)

	post, err := svc.CreatePost(userID, "prayer", "Please pray for my family.", false)
	if err != nil {
		t.Fatalf("free user prayer post: %v", err)
	}
	if post.PostType != "prayer" {
		t.Errorf("post_type: got %q, want %q", post.PostType, "prayer")
	}
	if post.ExpiresAt == nil {
		t.Error("prayer post should have ExpiresAt set")
	}
	if post.UserID == nil || *post.UserID != userID {
		t.Errorf("UserID mismatch: got %v, want %d", post.UserID, userID)
	}
	t.Logf("✅ Free user created prayer ID=%d, expires %v", post.ID, post.ExpiresAt)
}

// TestCommunity_CreatePost_PrayerType_Anonymous verifies that anonymous=true
// stores the post with UserID=nil (lose ownership) so username shows as "Anonymous".
func TestCommunity_CreatePost_PrayerType_Anonymous(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "anon_pray", false)
	svc := newService(tx, false)

	post, err := svc.CreatePost(userID, "prayer", "Lord, hear my prayer.", true)
	if err != nil {
		t.Fatalf("anonymous prayer post: %v", err)
	}
	if post.UserID != nil {
		t.Errorf("anonymous prayer should have UserID=nil, got %v", *post.UserID)
	}
	t.Logf("✅ Anonymous prayer ID=%d has UserID=nil", post.ID)
}

// TestCommunity_CreatePost_EmptyBody verifies that an empty body is rejected.
func TestCommunity_CreatePost_EmptyBody(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "empty_body", true)
	svc := newService(tx, true)

	_, err := svc.CreatePost(userID, "user", "   ", false)
	if err == nil {
		t.Fatal("expected error for empty body, got nil")
	}
	t.Logf("✅ Empty body rejected: %v", err)
}

// TestCommunity_CreatePost_BodyTooLong verifies that a body exceeding the limit is rejected.
func TestCommunity_CreatePost_BodyTooLong(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "long_body", true)
	svc := newService(tx, true)

	longBody := string(make([]byte, 501))
	for i := range longBody {
		longBody = longBody[:i] + "a" + longBody[i+1:]
		if i >= 500 {
			break
		}
	}
	longBody = fmt.Sprintf("%0501d", 0) // 501 chars

	_, err := svc.CreatePost(userID, "user", longBody, false)
	if err == nil {
		t.Fatal("expected error for body >500 chars, got nil")
	}
	t.Logf("✅ Overly long body rejected: %v", err)
}

// TestCommunity_CreatePost_InvalidPostType verifies unknown post_type is rejected.
func TestCommunity_CreatePost_InvalidPostType(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "bad_type", true)
	svc := newService(tx, true)

	_, err := svc.CreatePost(userID, "announcement", "trying to inject admin post", false)
	if err == nil {
		t.Fatal("expected error for invalid post_type")
	}
	t.Logf("✅ Invalid post_type rejected: %v", err)
}

// TestCommunity_CreatePost_RateLimit verifies that posting more than 5 times
// within 10 minutes returns a rate_limit error.
func TestCommunity_CreatePost_RateLimit(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "rate_limiter", false)
	svc := newService(tx, false)

	// Insert 5 prayer posts directly to simulate the rate window.
	for i := 0; i < 5; i++ {
		p := &models.CommunityPost{
			UserID:   &userID,
			PostType: "prayer",
			Body:     fmt.Sprintf("prayer %d", i),
		}
		if err := tx.Create(p).Error; err != nil {
			t.Fatalf("seed post %d: %v", i, err)
		}
	}

	_, err := svc.CreatePost(userID, "prayer", "one more prayer", false)
	if err == nil {
		t.Fatal("expected rate_limit error, got nil")
	}
	if err.Error() != "rate_limit" {
		t.Errorf("unexpected error: %q (want %q)", err.Error(), "rate_limit")
	}
	t.Logf("✅ Rate limit correctly enforced: %v", err)
}

// ─── GetFeed tests ───────────────────────────────────────────────────────────

// TestCommunity_GetFeed_AuthenticatedSeesAll verifies an authenticated user
// receives all post types including user and prayer.
func TestCommunity_GetFeed_AuthenticatedSeesAll(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "feed_auth", true)
	svc := newService(tx, true)

	// Create one user post and one prayer post.
	_, err := svc.CreatePost(userID, "user", "A reflection from a premium user.", false)
	if err != nil {
		t.Fatalf("create user post: %v", err)
	}
	_, err = svc.CreatePost(userID, "prayer", "Please pray for strength.", false)
	if err != nil {
		t.Fatalf("create prayer post: %v", err)
	}

	feed, err := svc.GetFeed(userID, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed: %v", err)
	}

	typeSet := map[string]bool{}
	for _, p := range feed {
		typeSet[p.PostType] = true
	}

	if !typeSet["user"] {
		t.Error("authenticated feed missing 'user' posts")
	}
	if !typeSet["prayer"] {
		t.Error("authenticated feed missing 'prayer' posts")
	}
	t.Logf("✅ Authenticated feed has %d posts, types: %v", len(feed), typeSet)
}

// TestCommunity_GetFeed_GuestSeesRestrictedTypes verifies guest (userID=0)
// only sees announcements, challenges, and milestones.
func TestCommunity_GetFeed_GuestSeesRestrictedTypes(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "feed_guest_poster", true)
	svc := newService(tx, true)

	// Create a user reflection that guests should NOT see.
	_, err := svc.CreatePost(userID, "user", "This reflection should be hidden from guests.", false)
	if err != nil {
		t.Fatalf("create user post: %v", err)
	}

	// Create an admin announcement that guests SHOULD see.
	if err := svc.CreateAdminPost("announcement", "Welcome to the community!", false, nil); err != nil {
		t.Fatalf("create admin post: %v", err)
	}

	guestFeed, err := svc.GetFeed(0, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed (guest): %v", err)
	}

	for _, p := range guestFeed {
		if p.PostType == "user" || p.PostType == "prayer" {
			t.Errorf("guest feed contains forbidden post_type %q (ID=%d)", p.PostType, p.ID)
		}
	}
	t.Logf("✅ Guest feed has %d posts, none are user/prayer", len(guestFeed))
}

// TestCommunity_GetFeed_PinnedPostsFirst verifies pinned posts appear at the
// top of the feed regardless of creation order.
func TestCommunity_GetFeed_PinnedPostsFirst(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "feed_pinned", true)
	svc := newService(tx, true)

	// Create a regular post first, then a pinned announcement.
	if _, err := svc.CreatePost(userID, "user", "Regular post", false); err != nil {
		t.Fatalf("create regular post: %v", err)
	}
	if err := svc.CreateAdminPost("announcement", "Pinned announcement!", true, nil); err != nil {
		t.Fatalf("create pinned post: %v", err)
	}

	feed, err := svc.GetFeed(userID, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed: %v", err)
	}
	if len(feed) < 2 {
		t.Fatalf("expected ≥2 posts, got %d", len(feed))
	}
	if !feed[0].IsPinned {
		t.Errorf("first post should be pinned, got post_type=%q is_pinned=%v", feed[0].PostType, feed[0].IsPinned)
	}
	t.Logf("✅ Pinned post is first: %q", feed[0].PostType)
}

// TestCommunity_GetFeed_IsSelfFlag verifies is_self=true only for own posts.
func TestCommunity_GetFeed_IsSelfFlag(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "self_flag", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "My own reflection.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	feed, err := svc.GetFeed(userID, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed: %v", err)
	}

	for _, p := range feed {
		if p.ID == post.ID && !p.IsSelf {
			t.Errorf("own post ID=%d should have is_self=true", post.ID)
		}
	}
	t.Logf("✅ is_self correctly set for own post ID=%d", post.ID)
}

// TestCommunity_GetFeed_ExpiredPrayerExcluded verifies prayer requests that
// have passed their expires_at are excluded from the feed.
func TestCommunity_GetFeed_ExpiredPrayerExcluded(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "expired_pray", false)

	// Insert an already-expired prayer post directly.
	pastExpiry := time.Now().Add(-1 * time.Hour)
	expired := &models.CommunityPost{
		UserID:    &userID,
		PostType:  "prayer",
		Body:      "This prayer expired an hour ago.",
		ExpiresAt: &pastExpiry,
	}
	if err := tx.Create(expired).Error; err != nil {
		t.Fatalf("create expired prayer: %v", err)
	}

	svc := newService(tx, false)
	feed, err := svc.GetFeed(userID, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed: %v", err)
	}

	for _, p := range feed {
		if p.ID == expired.ID {
			t.Errorf("expired prayer ID=%d should not appear in feed", expired.ID)
		}
	}
	t.Logf("✅ Expired prayer excluded from feed (checked %d posts)", len(feed))
}

// ─── DeletePost tests ────────────────────────────────────────────────────────

// TestCommunity_DeletePost_OwnPost verifies a user can soft-delete their own post.
func TestCommunity_DeletePost_OwnPost(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "deleter", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "I will delete this.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	if err := svc.DeletePost(post.ID, userID); err != nil {
		t.Fatalf("DeletePost: %v", err)
	}

	// Post should no longer appear in the feed.
	feed, _ := svc.GetFeed(userID, 0, 50)
	for _, p := range feed {
		if p.ID == post.ID {
			t.Errorf("deleted post ID=%d still visible in feed", post.ID)
		}
	}
	t.Logf("✅ Post ID=%d successfully soft-deleted", post.ID)
}

// TestCommunity_DeletePost_OtherUserPost verifies deleting another user's post
// returns gorm.ErrRecordNotFound (surfaces as 404, not 403).
func TestCommunity_DeletePost_OtherUserPost(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	ownerID := createTestUser(t, tx, "owner", true)
	otherID := createTestUser(t, tx, "other", true)

	svcOwner := newService(tx, true)
	post, err := svcOwner.CreatePost(ownerID, "user", "Owner's post.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	svcOther := newService(tx, true)
	err = svcOther.DeletePost(post.ID, otherID)
	if err == nil {
		t.Fatal("expected error when deleting another user's post, got nil")
	}
	if err != gorm.ErrRecordNotFound {
		t.Errorf("expected gorm.ErrRecordNotFound, got %v", err)
	}
	t.Logf("✅ Deleting another user's post correctly returns ErrRecordNotFound")
}

// ─── Reaction tests ──────────────────────────────────────────────────────────

// TestCommunity_AddReaction_Valid verifies adding a valid reaction succeeds.
func TestCommunity_AddReaction_Valid(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "reactor", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "A great verse.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	for _, rt := range []string{"amen", "pray", "heart", "join"} {
		if err := svc.AddReaction(post.ID, userID, rt); err != nil {
			t.Errorf("AddReaction(%q): %v", rt, err)
		}
	}

	pr, err := svc.GetPostByID(post.ID, userID)
	if err != nil {
		t.Fatalf("GetPostByID: %v", err)
	}
	for _, rt := range []string{"amen", "pray", "heart", "join"} {
		if pr.Reactions[rt] != 1 {
			t.Errorf("reaction %q: got %d, want 1", rt, pr.Reactions[rt])
		}
	}
	t.Logf("✅ All 4 reaction types added: %v", pr.Reactions)
}

// TestCommunity_AddReaction_Idempotent verifies adding the same reaction twice
// does not create a duplicate.
func TestCommunity_AddReaction_Idempotent(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "idempotent_reactor", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "Verse for reaction test.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	if err := svc.AddReaction(post.ID, userID, "amen"); err != nil {
		t.Fatalf("first AddReaction: %v", err)
	}
	if err := svc.AddReaction(post.ID, userID, "amen"); err != nil {
		t.Fatalf("second AddReaction (idempotent): %v", err)
	}

	pr, err := svc.GetPostByID(post.ID, userID)
	if err != nil {
		t.Fatalf("GetPostByID: %v", err)
	}
	if pr.Reactions["amen"] != 1 {
		t.Errorf("amen count: got %d, want 1 (idempotency broken)", pr.Reactions["amen"])
	}
	t.Logf("✅ Duplicate reaction correctly ignored, count = %d", pr.Reactions["amen"])
}

// TestCommunity_AddReaction_InvalidType verifies unknown reaction types are rejected.
func TestCommunity_AddReaction_InvalidType(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "bad_reactor", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "Target post.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	err = svc.AddReaction(post.ID, userID, "dislike")
	if err == nil {
		t.Fatal("expected error for invalid reaction type, got nil")
	}
	t.Logf("✅ Invalid reaction type rejected: %v", err)
}

// TestCommunity_RemoveReaction verifies removing a reaction decrements the count.
func TestCommunity_RemoveReaction(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "remove_reactor", true)
	svc := newService(tx, true)

	post, err := svc.CreatePost(userID, "user", "Post for reaction removal.", false)
	if err != nil {
		t.Fatalf("create post: %v", err)
	}

	if err := svc.AddReaction(post.ID, userID, "heart"); err != nil {
		t.Fatalf("AddReaction: %v", err)
	}

	pr, _ := svc.GetPostByID(post.ID, userID)
	if pr.Reactions["heart"] != 1 {
		t.Fatalf("expected heart=1 before remove, got %d", pr.Reactions["heart"])
	}

	if err := svc.RemoveReaction(post.ID, userID, "heart"); err != nil {
		t.Fatalf("RemoveReaction: %v", err)
	}

	pr, err = svc.GetPostByID(post.ID, userID)
	if err != nil {
		t.Fatalf("GetPostByID after remove: %v", err)
	}
	if pr.Reactions["heart"] != 0 {
		t.Errorf("heart count after remove: got %d, want 0", pr.Reactions["heart"])
	}
	t.Logf("✅ Reaction removed, heart count = %d", pr.Reactions["heart"])
}

// ─── Admin post tests ────────────────────────────────────────────────────────

// TestCommunity_CreateAdminPost_ValidTypes verifies both admin post types work.
func TestCommunity_CreateAdminPost_ValidTypes(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)
	svc := newService(tx, false)

	for _, pt := range []string{"announcement", "challenge"} {
		err := svc.CreateAdminPost(pt, "Admin body text", false, nil)
		if err != nil {
			t.Errorf("CreateAdminPost(%q): %v", pt, err)
		}
	}
	t.Log("✅ Both admin post types created successfully")
}

// TestCommunity_CreateAdminPost_InvalidType verifies user/prayer types are rejected.
func TestCommunity_CreateAdminPost_InvalidType(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)
	svc := newService(tx, false)

	for _, pt := range []string{"user", "prayer", "milestone", "hack"} {
		err := svc.CreateAdminPost(pt, "Bad admin post", false, nil)
		if err == nil {
			t.Errorf("CreateAdminPost(%q): expected error, got nil", pt)
		}
	}
	t.Log("✅ Invalid admin post types all rejected")
}

// TestCommunity_CreateAdminPost_EmptyBody verifies empty body is rejected.
func TestCommunity_CreateAdminPost_EmptyBody(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)
	svc := newService(tx, false)

	err := svc.CreateAdminPost("announcement", "  ", false, nil)
	if err == nil {
		t.Fatal("expected error for empty admin post body")
	}
	t.Logf("✅ Empty admin post body rejected: %v", err)
}

// TestCommunity_CreateAdminPost_DisplaysAsWordsOfPraise verifies admin posts
// have no UserID and show as "Words of Praise" in the feed.
func TestCommunity_CreateAdminPost_DisplaysAsWordsOfPraise(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)
	svc := newService(tx, false)

	if err := svc.CreateAdminPost("announcement", "A word from the admins.", false, nil); err != nil {
		t.Fatalf("CreateAdminPost: %v", err)
	}

	feed, err := svc.GetFeed(0, 0, 20)
	if err != nil {
		t.Fatalf("GetFeed: %v", err)
	}

	for _, p := range feed {
		if p.PostType == "announcement" {
			if p.Username != "Words of Praise" {
				t.Errorf("admin post username: got %q, want %q", p.Username, "Words of Praise")
			}
			if !p.IsAdmin {
				t.Error("admin post should have is_admin=true")
			}
			t.Logf("✅ Admin post displays as %q is_admin=%v", p.Username, p.IsAdmin)
			return
		}
	}
	t.Error("admin announcement not found in guest feed")
}

// ─── Milestone post tests ─────────────────────────────────────────────────────

// TestCommunity_CreateMilestonePost_WhitelistedKey verifies that a whitelisted
// milestone key creates a post.
func TestCommunity_CreateMilestonePost_WhitelistedKey(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "milestone_user", false)
	svc := newService(tx, false)

	err := svc.CreateMilestonePost(userID, "TestUser", "seven_day_faithful")
	if err != nil {
		t.Fatalf("CreateMilestonePost: %v", err)
	}

	// Verify the post is visible in the feed (milestone type).
	feed, _ := svc.GetFeed(userID, 0, 20)
	found := false
	for _, p := range feed {
		if p.PostType == "milestone" && p.ID != 0 {
			found = true
			break
		}
	}
	if !found {
		t.Error("milestone post not found in feed")
	}
	t.Log("✅ Milestone post created for seven_day_faithful")
}

// TestCommunity_CreateMilestonePost_UnwhitelistedKey verifies that an
// unknown milestone key does nothing (returns nil, no post created).
func TestCommunity_CreateMilestonePost_UnwhitelistedKey(t *testing.T) {
	db := openCommunityTestDB(t)
	tx := beginTx(t, db)

	userID := createTestUser(t, tx, "no_milestone", false)
	svc := newService(tx, false)

	// Count posts before.
	var before int64
	tx.Model(&models.CommunityPost{}).Where("user_id = ?", userID).Count(&before)

	err := svc.CreateMilestonePost(userID, "TestUser", "unknown_key")
	if err != nil {
		t.Fatalf("CreateMilestonePost with unknown key: %v", err)
	}

	var after int64
	tx.Model(&models.CommunityPost{}).Where("user_id = ?", userID).Count(&after)

	if after != before {
		t.Errorf("expected no new posts for unknown milestone key, got %d new", after-before)
	}
	t.Log("✅ Unknown milestone key produces no post")
}
