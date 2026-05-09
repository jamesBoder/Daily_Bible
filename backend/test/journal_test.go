package journaltest

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"dailybible/internal/handlers"
	"dailybible/internal/models"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ── Constants ────────────────────────────────────────────────────────────────

// testUserID / testUserID2 are synthetic user IDs used across all tests.
// They do not correspond to real rows in the users table — the journal service
// only cares about user_id for ownership, not foreign-key integrity.
const testUserID uint = 99991
const testUserID2 uint = 99992

// ── Setup helpers ────────────────────────────────────────────────────────────

func setupTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	// DB is initialized once by TestMain (testmain_test.go) to avoid running
	// AutoMigrate concurrently across 60+ tests, which causes schema-lock deadlocks.
	return sharedDB
}

// injectUser replaces JWT middleware in tests. It sets the userID claim that
// all journal handlers read via c.MustGet("userID").(uint).
func injectUser(userID uint) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Set("userID", userID)
		c.Next()
	}
}

// setupRouter wires up a minimal Gin router with journal routes only.
// The caller chooses which userID is injected as the "authenticated" user.
func setupRouter(db *gorm.DB, userID uint) *gin.Engine {
	gin.SetMode(gin.TestMode)
	blessingsService := services.NewBlessingsService(db)
	journalService := services.NewJournalService(db, blessingsService)
	checker := services.NewStubSubscriptionChecker()
	h := handlers.NewJournalHandler(journalService, checker)

	r := gin.New()
	journal := r.Group("/api/journal")
	journal.Use(injectUser(userID))
	{
		journal.GET("", h.GetEntries)
		journal.POST("", h.CreateEntry)
		journal.GET("/prompt", h.GetWeeklyPrompt)
		journal.GET("/:id", h.GetEntry)
		journal.PUT("/:id", h.UpdateEntry)
		journal.DELETE("/:id", h.DeleteEntry)
	}
	return r
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────

func doPost(r *gin.Engine, path string, body any) *httptest.ResponseRecorder {
	b, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func doPut(r *gin.Engine, path string, body any) *httptest.ResponseRecorder {
	b, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPut, path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func doGet(r *gin.Engine, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func doDelete(r *gin.Engine, path string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodDelete, path, nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

// parseBody unmarshals the recorder body into a map for lightweight assertion.
func parseBody(t *testing.T, w *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &out); err != nil {
		t.Fatalf("parseBody: %v\nraw: %s", err, w.Body.String())
	}
	return out
}

// entryID extracts the numeric ID from a POST /api/journal response.
func entryID(t *testing.T, w *httptest.ResponseRecorder) uint {
	t.Helper()
	body := parseBody(t, w)
	raw, ok := body["id"]
	if !ok {
		t.Fatalf("response has no 'id' field: %s", w.Body.String())
	}
	// JSON numbers unmarshal to float64
	return uint(raw.(float64))
}

// cleanupEntries hard-deletes all journal entries created during tests so that
// each run starts from a clean slate.
func cleanupEntries(db *gorm.DB) {
	db.Unscoped().
		Where("user_id IN ?", []uint{testUserID, testUserID2}).
		Delete(&models.JournalEntry{})
}

// ── Create tests ─────────────────────────────────────────────────────────────

func TestJournalCreateEntry_Valid(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	w := doPost(r, "/api/journal", map[string]any{
		"content_plain": "This is my daily reflection.",
		"linked_verse":  "John 3:16",
	})

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)

	if body["content_plain"] != "This is my daily reflection." {
		t.Errorf("content_plain mismatch: %v", body["content_plain"])
	}
	if body["linked_verse"] != "John 3:16" {
		t.Errorf("linked_verse mismatch: %v", body["linked_verse"])
	}
	if body["id"] == nil || body["id"].(float64) == 0 {
		t.Error("expected non-zero id")
	}
	t.Logf("✅ Created entry ID %.0f", body["id"].(float64))
}

func TestJournalCreateEntry_EmptyContent(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	w := doPost(r, "/api/journal", map[string]any{"content_plain": ""})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty content, got %d", w.Code)
	}
	t.Log("✅ Empty content correctly rejected with 400")
}

func TestJournalCreateEntry_WhitespaceContent(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	w := doPost(r, "/api/journal", map[string]any{"content_plain": "   \t\n  "})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for whitespace-only content, got %d", w.Code)
	}
	t.Log("✅ Whitespace-only content correctly rejected with 400")
}

func TestJournalCreateEntry_TooLong(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	oversized := strings.Repeat("a", 50_001)
	w := doPost(r, "/api/journal", map[string]any{"content_plain": oversized})

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for content >50,000 chars, got %d", w.Code)
	}
	t.Log("✅ Oversized content correctly rejected with 400")
}

func TestJournalCreateEntry_AtMaxLength(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	exactMax := strings.Repeat("a", 50_000)
	w := doPost(r, "/api/journal", map[string]any{"content_plain": exactMax})

	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 for content at exactly 50,000 chars, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ Content at exactly 50,000 chars accepted")
}

// ── Get single entry tests ────────────────────────────────────────────────────

func TestJournalGetEntry_Found(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Testing GetEntry.",
		"linked_verse":  "Psalm 23:1",
	})
	id := entryID(t, created)

	w := doGet(r, fmt.Sprintf("/api/journal/%d", id))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["content_plain"] != "Testing GetEntry." {
		t.Errorf("content_plain mismatch: %v", body["content_plain"])
	}
	if body["linked_verse"] != "Psalm 23:1" {
		t.Errorf("linked_verse mismatch: %v", body["linked_verse"])
	}
	t.Logf("✅ GetEntry returned correct data for ID %d", id)
}

func TestJournalGetEntry_NotFound(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	w := doGet(r, "/api/journal/999999999")
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 for non-existent entry, got %d", w.Code)
	}
	t.Log("✅ Non-existent entry correctly returns 404")
}

func TestJournalGetEntry_WrongUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })

	// User 1 creates an entry
	r1 := setupRouter(db, testUserID)
	created := doPost(r1, "/api/journal", map[string]any{
		"content_plain": "User 1's private entry.",
	})
	id := entryID(t, created)

	// User 2 tries to fetch it
	r2 := setupRouter(db, testUserID2)
	w := doGet(r2, fmt.Sprintf("/api/journal/%d", id))
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when fetching another user's entry, got %d", w.Code)
	}
	t.Log("✅ Cross-user access correctly returns 404")
}

func TestJournalGetEntry_InvalidID(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	w := doGet(r, "/api/journal/not-a-number")
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for invalid ID, got %d", w.Code)
	}
	t.Log("✅ Non-numeric ID correctly returns 400")
}

// ── Update tests ─────────────────────────────────────────────────────────────

func TestJournalUpdateEntry_Content(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Original content.",
	})
	id := entryID(t, created)

	w := doPut(r, fmt.Sprintf("/api/journal/%d", id), map[string]any{
		"content_plain": "Updated content.",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["content_plain"] != "Updated content." {
		t.Errorf("content_plain not updated: %v", body["content_plain"])
	}
	t.Log("✅ UpdateEntry correctly changes content")
}

func TestJournalUpdateEntry_LinkedVerseStoredForFreeUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Reflection without verse.",
	})
	id := entryID(t, created)

	// Free user links a verse — should persist (not be silently dropped)
	w := doPut(r, fmt.Sprintf("/api/journal/%d", id), map[string]any{
		"content_plain": "Reflection without verse.",
		"linked_verse":  "Romans 8:28",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}

	// Verify via GetEntry that the verse was actually stored
	w2 := doGet(r, fmt.Sprintf("/api/journal/%d", id))
	body := parseBody(t, w2)
	if body["linked_verse"] != "Romans 8:28" {
		t.Errorf("linked_verse should be stored for free users, got: %v", body["linked_verse"])
	}
	t.Log("✅ linked_verse persists for free users")
}

func TestJournalUpdateEntry_WrongUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })

	r1 := setupRouter(db, testUserID)
	created := doPost(r1, "/api/journal", map[string]any{
		"content_plain": "User 1's private entry.",
	})
	id := entryID(t, created)

	r2 := setupRouter(db, testUserID2)
	w := doPut(r2, fmt.Sprintf("/api/journal/%d", id), map[string]any{
		"content_plain": "Hijacked content.",
	})
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when updating another user's entry, got %d", w.Code)
	}
	t.Log("✅ Cross-user update correctly returns 404")
}

func TestJournalUpdateEntry_EmptyContent(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Original.",
	})
	id := entryID(t, created)

	w := doPut(r, fmt.Sprintf("/api/journal/%d", id), map[string]any{
		"content_plain": "",
	})
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 for empty update, got %d", w.Code)
	}
	t.Log("✅ Empty update content correctly rejected with 400")
}

// ── Delete tests ─────────────────────────────────────────────────────────────

func TestJournalDeleteEntry(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "To be deleted.",
	})
	id := entryID(t, created)

	// Delete
	w := doDelete(r, fmt.Sprintf("/api/journal/%d", id))
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on delete, got %d: %s", w.Code, w.Body.String())
	}

	// Verify it's gone
	w2 := doGet(r, fmt.Sprintf("/api/journal/%d", id))
	if w2.Code != http.StatusNotFound {
		t.Fatalf("expected 404 after soft-delete, got %d", w2.Code)
	}
	t.Log("✅ DeleteEntry soft-deletes the entry; subsequent GET returns 404")
}

func TestJournalDeleteEntry_WrongUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })

	r1 := setupRouter(db, testUserID)
	created := doPost(r1, "/api/journal", map[string]any{
		"content_plain": "User 1's entry.",
	})
	id := entryID(t, created)

	r2 := setupRouter(db, testUserID2)
	w := doDelete(r2, fmt.Sprintf("/api/journal/%d", id))
	if w.Code != http.StatusNotFound {
		t.Fatalf("expected 404 when deleting another user's entry, got %d", w.Code)
	}

	// Original entry should still exist for user 1
	w2 := doGet(r1, fmt.Sprintf("/api/journal/%d", id))
	if w2.Code != http.StatusOK {
		t.Fatalf("original entry should still exist after failed cross-user delete, got %d", w2.Code)
	}
	t.Log("✅ Cross-user delete correctly returns 404; original entry untouched")
}

// ── List tests ────────────────────────────────────────────────────────────────

func TestJournalGetEntries_ReturnsList(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	// Create 3 entries
	for i := 1; i <= 3; i++ {
		doPost(r, "/api/journal", map[string]any{
			"content_plain": fmt.Sprintf("Entry number %d", i),
		})
	}

	w := doGet(r, "/api/journal")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)

	entries, ok := body["entries"].([]any)
	if !ok {
		t.Fatalf("expected 'entries' array in response, got: %v", body)
	}
	if len(entries) < 3 {
		t.Errorf("expected at least 3 entries, got %d", len(entries))
	}

	totalStored, ok := body["total_stored"].(float64)
	if !ok {
		t.Fatal("expected 'total_stored' in response")
	}
	if int(totalStored) < 3 {
		t.Errorf("total_stored should be >= 3, got %.0f", totalStored)
	}
	t.Logf("✅ GetEntries returned %d entries, total_stored=%.0f", len(entries), totalStored)
}

func TestJournalGetEntries_FreeUserCap(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	// Create 31 entries — one more than the free cap of 30
	for i := 1; i <= 31; i++ {
		doPost(r, "/api/journal", map[string]any{
			"content_plain": fmt.Sprintf("Filler entry %d for cap test", i),
		})
	}

	w := doGet(r, "/api/journal")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	body := parseBody(t, w)

	entries := body["entries"].([]any)
	if len(entries) > 30 {
		t.Errorf("free users should see at most 30 entries, got %d", len(entries))
	}

	totalStored := body["total_stored"].(float64)
	if int(totalStored) < 31 {
		t.Errorf("total_stored should reflect all 31 entries, got %.0f", totalStored)
	}

	viewLimit := body["view_limit"].(float64)
	if int(viewLimit) != 30 {
		t.Errorf("view_limit should be 30 for free users, got %.0f", viewLimit)
	}
	t.Logf("✅ Free-user cap: %d entries shown, total_stored=%.0f, view_limit=%.0f",
		len(entries), totalStored, viewLimit)
}

func TestJournalGetEntries_NewestFirst(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	doPost(r, "/api/journal", map[string]any{"content_plain": "First entry"})
	doPost(r, "/api/journal", map[string]any{"content_plain": "Second entry"})
	doPost(r, "/api/journal", map[string]any{"content_plain": "Third entry"})

	w := doGet(r, "/api/journal")
	body := parseBody(t, w)
	entries := body["entries"].([]any)

	// The most recently created entry should appear first
	first := entries[0].(map[string]any)
	if first["content_plain"] != "Third entry" {
		t.Errorf("expected newest entry first, got: %v", first["content_plain"])
	}
	t.Log("✅ GetEntries returns entries newest-first")
}

func TestJournalGetEntries_IsolatedByUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })

	r1 := setupRouter(db, testUserID)
	r2 := setupRouter(db, testUserID2)

	doPost(r1, "/api/journal", map[string]any{"content_plain": "User 1 entry A"})
	doPost(r1, "/api/journal", map[string]any{"content_plain": "User 1 entry B"})
	doPost(r2, "/api/journal", map[string]any{"content_plain": "User 2 entry"})

	// User 2 should only see their own single entry
	w := doGet(r2, "/api/journal")
	body := parseBody(t, w)
	entries := body["entries"].([]any)

	for _, raw := range entries {
		e := raw.(map[string]any)
		if content, ok := e["content_plain"].(string); ok {
			if content == "User 1 entry A" || content == "User 1 entry B" {
				t.Errorf("user 2 should not see user 1's entries, but found: %q", content)
			}
		}
	}
	t.Log("✅ GetEntries is isolated per user")
}

// ── Linked verse tests ────────────────────────────────────────────────────────

func TestJournalLinkedVerse_StoredOnCreate_FreeUser(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	w := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Reflecting on grace.",
		"linked_verse":  "Ephesians 2:8",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", w.Code)
	}
	body := parseBody(t, w)
	if body["linked_verse"] != "Ephesians 2:8" {
		t.Errorf("linked_verse should be stored for free users on create, got: %v", body["linked_verse"])
	}
	t.Log("✅ linked_verse stored on create for free users")
}

func TestJournalLinkedVerse_CanBeCleared(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	created := doPost(r, "/api/journal", map[string]any{
		"content_plain": "Verse linked entry.",
		"linked_verse":  "Genesis 1:1",
	})
	id := entryID(t, created)

	// Clear the verse by sending empty string
	w := doPut(r, fmt.Sprintf("/api/journal/%d", id), map[string]any{
		"content_plain": "Verse linked entry.",
		"linked_verse":  "",
	})
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", w.Code)
	}
	body := parseBody(t, w)
	if body["linked_verse"] != "" {
		t.Errorf("linked_verse should be cleared, got: %v", body["linked_verse"])
	}
	t.Log("✅ linked_verse can be cleared by sending empty string")
}

// ── Weekly prompt tests ───────────────────────────────────────────────────────

func TestJournalGetWeeklyPrompt_FreeUser_ReturnsNull(t *testing.T) {
	db := setupTestDB(t)
	r := setupRouter(db, testUserID)

	// All users are free (StubSubscriptionChecker always returns false),
	// so the prompt endpoint always returns null.
	w := doGet(r, "/api/journal/prompt")
	if w.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", w.Code, w.Body.String())
	}
	body := parseBody(t, w)
	if body["prompt"] != nil {
		t.Errorf("expected null prompt for free user, got: %v", body["prompt"])
	}
	t.Log("✅ Weekly prompt returns null for free users")
}

// ── Content validation edge cases ────────────────────────────────────────────

func TestJournalCreateEntry_ContentTrimmed(t *testing.T) {
	db := setupTestDB(t)
	t.Cleanup(func() { cleanupEntries(db) })
	r := setupRouter(db, testUserID)

	// Leading/trailing whitespace is trimmed before the empty check,
	// but a non-empty core should be accepted.
	w := doPost(r, "/api/journal", map[string]any{
		"content_plain": "  Valid content with padding.  ",
	})
	if w.Code != http.StatusCreated {
		t.Fatalf("expected 201 for content with leading/trailing spaces, got %d: %s", w.Code, w.Body.String())
	}
	t.Log("✅ Content with surrounding whitespace accepted (trimmed by handler)")
}
