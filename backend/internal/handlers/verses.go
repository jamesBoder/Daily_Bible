package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"dailybible/internal/config"
	"dailybible/internal/models"
	"dailybible/internal/services"
	"github.com/gin-gonic/gin"
)

// init VerseHandler Struct
type VerseHandler struct {
	dailyVerseService   *services.DailyVerseService
	bibleAPIService     services.BibleAPIService
	historyService      *services.HistoryService
	streakService       *services.StreakService
	blessingsService    *services.BlessingsService
	settingsService     *services.SettingsService
	rewardsService      *services.RewardsService
	subscriptionChecker services.SubscriptionChecker
	communityService    *services.CommunityService  // Phase 9: milestone auto-post
	disciplineService   *services.DisciplineService // Daily Disciplines
}

// NewVerseHandler creates a new VerseHandler
func NewVerseHandler(
	dailyVerseService *services.DailyVerseService,
	bibleAPIService services.BibleAPIService,
	historyService *services.HistoryService,
	streakService *services.StreakService,
	blessingsService *services.BlessingsService,
	settingsService *services.SettingsService,
	rewardsService *services.RewardsService,
	subscriptionChecker services.SubscriptionChecker,
) *VerseHandler {
	return &VerseHandler{
		dailyVerseService:   dailyVerseService,
		bibleAPIService:     bibleAPIService,
		historyService:      historyService,
		streakService:       streakService,
		blessingsService:    blessingsService,
		settingsService:     settingsService,
		rewardsService:      rewardsService,
		subscriptionChecker: subscriptionChecker,
	}
}

// SetCommunityService wires the community service for milestone auto-posts (Phase 9).
func (h *VerseHandler) SetCommunityService(cs *services.CommunityService) {
	h.communityService = cs
}

// SetDisciplineService wires the discipline service for read_verse and share_verse hooks.
func (h *VerseHandler) SetDisciplineService(s *services.DisciplineService) {
	h.disciplineService = s
}

// resolveVersion selects the API.Bible version to use for a request.
//
// Priority order:
//  1. ?version= query param (explicit per-request override)
//  2. User's preferred_bible_version from settings (if authenticated)
//  3. Default free version for the requested language
//
// Premium gate: if the resolved version requires premium and the user is not
// premium (or not authenticated), silently falls back to the free default.
// Unknown version keys are treated as missing and trigger the same fallback.
//
// preloadedSettings may be non-nil when the caller has already fetched user
// settings (e.g. GetDailyVerse fetches them for timezone), avoiding a second
// DB round-trip. Pass nil to have this function fetch them itself.
func (h *VerseHandler) resolveVersion(c *gin.Context, langCode string, preloadedSettings *models.UserSettings) config.BibleVersion {
	versionKey := c.DefaultQuery("version", "")

	// Read from user settings if not overridden by query param.
	// Only honour the stored preference when it belongs to the requested language.
	// A mismatch arises when the user changes their UI language without explicitly
	// picking a new Bible version (e.g. preferred_language was previously "fr" so
	// the backfill set preferred_bible_version = "jnd", then the user switched UI
	// to "en" — we must not serve the French verse for an English request).
	if versionKey == "" {
		if userID, ok := c.Get("userID"); ok {
			var settings *models.UserSettings
			if preloadedSettings != nil {
				settings = preloadedSettings
			} else {
				var err error
				settings, err = h.settingsService.GetUserSettings(userID.(uint))
				if err != nil {
					settings = nil
				}
			}
			if settings != nil && settings.PreferredBibleVersion != "" {
				if v, known := config.BibleVersions[settings.PreferredBibleVersion]; known && v.LanguageCode == langCode {
					versionKey = settings.PreferredBibleVersion
				}
			}
		}
	}

	// Fall back to the language default
	if versionKey == "" {
		versionKey = config.GetDefaultFreeVersion(langCode)
	}

	// Look up the version; fall back on unknown key
	version, known := config.BibleVersions[versionKey]
	if !known {
		log.Printf("unknown bible version key %q; using free default for lang %q", versionKey, langCode)
		versionKey = config.GetDefaultFreeVersion(langCode)
		version = config.BibleVersions[versionKey]
	}

	// Premium gate
	if version.RequiresPremium {
		userID, authenticated := c.Get("userID")
		if !authenticated || !h.subscriptionChecker.IsPremium(userID.(uint)) {
			versionKey = config.GetDefaultFreeVersion(langCode)
			version = config.BibleVersions[versionKey]
		}
	}

	return version
}

// GetDailyVerse returns the verse of the day.
// If a ?date=YYYY-MM-DD query param is provided and it's a past date, the verse
// for that date is returned without recording any engagement or streak credit.
func (h *VerseHandler) GetDailyVerse(c *gin.Context) {
	language := c.DefaultQuery("lang", "en")

	// Past-date lookup: serve without recording engagement/streak/history.
	if dateStr := c.Query("date"); dateStr != "" {
		if _, err := time.Parse("2006-01-02", dateStr); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format, use YYYY-MM-DD"})
			return
		}

		// Compute the effective "today" using the same UTC-10 offset the daily verse
		// service uses so that date comparisons are consistent.
		effectiveTodayStr := time.Now().UTC().Add(-10 * time.Hour).Format("2006-01-02")

		// Reject today or future dates — those must go through the normal path
		// so that engagement and streak recording are not bypassed.
		if dateStr >= effectiveTodayStr {
			c.JSON(http.StatusBadRequest, gin.H{"error": "date must be before today"})
			return
		}

		// Reject dates older than 365 days to prevent abuse (many Bible API calls).
		effectiveToday, _ := time.Parse("2006-01-02", effectiveTodayStr)
		requested, _ := time.Parse("2006-01-02", dateStr)
		if requested.Before(effectiveToday.AddDate(0, 0, -365)) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "cannot request dates more than 365 days in the past"})
			return
		}

		verse, err := h.dailyVerseService.GetDailyVerseForDate(dateStr)
		if err != nil {
			log.Printf("GetDailyVerseForDate(%q) failed: %v", dateStr, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get verse for date"})
			return
		}

		resolvedVersion := h.resolveVersion(c, language, nil)
		const kjvVersionID = "de4e12af7f28f599-02"
		verseText := verse.Text
		if resolvedVersion.ID != kjvVersionID && resolvedVersion.ID != "" {
			if translatedVerse, err := h.bibleAPIService.GetVerseWithVersionID(verse.Reference, resolvedVersion.ID); err == nil {
				verseText = translatedVerse.Text
			} else {
				log.Printf("GetVerseWithVersionID(%q, %q) failed for date %q: %v; serving KJV fallback",
					verse.Reference, resolvedVersion.ID, dateStr, err)
			}
		}

		// Past dates are immutable — cache aggressively.
		c.Header("Cache-Control", "public, max-age=86400, immutable")
		c.JSON(http.StatusOK, gin.H{
			"verse": gin.H{
				"id":         verse.ID,
				"reference":  verse.Reference,
				"text":       verseText,
				"book":       verse.Book,
				"chapter":    verse.Chapter,
				"verse":      verse.VerseNumber,
				"version":    resolvedVersion.Abbreviation,
				"language":   language,
				"daily_date": dateStr,
			},
		})
		return
	}

	// IMPORTANT: RecordDailyEngagement fires regardless of whether the Bible API succeeds.
	// The user's intent to engage is known the moment they hit this endpoint.
	// If API.Bible is down and we serve a fallback/cached verse, the streak still counts.
	// Never gate streak recording on the result of an external API call.

	// Kick off the verse fetch concurrently while auth/streak work runs below.
	// On a cache miss this hits the external Bible API (~200-500ms); overlapping it
	// with DB operations cuts the critical path roughly in half.
	type verseResult struct {
		verse *models.Verse
		err   error
	}
	verseCh := make(chan verseResult, 1)
	go func() {
		v, err := h.dailyVerseService.GetDailyVerse()
		verseCh <- verseResult{v, err}
	}()

	var blessingsCredited int
	var cachedSettings *models.UserSettings // reused by resolveVersion to avoid a second DB call
	if userID, authenticated := c.Get("userID"); authenticated {
		// Get user settings for timezone
		settings, err := h.settingsService.GetUserSettings(userID.(uint))
		if err != nil {
			settings = &models.UserSettings{PreferredTimezone: "UTC"}
		}
		cachedSettings = settings

		wasNew, err := h.streakService.RecordDailyEngagement(userID.(uint), settings.PreferredTimezone)
		if err != nil {
			log.Printf("RecordDailyEngagement failed for user %d: %v", userID, err)
			// Non-fatal: log and continue. The verse is served regardless.
		}
		if wasNew {
			// Phase 8: use real premium multiplier from Gin context (cached by auth middleware).
			blessingsMultiplier := 1.0
			if c.GetBool("isPremium") {
				blessingsMultiplier = 1.5
			}
			// Blessings credit is gated on wasNew to prevent double-credit on page refresh.
			// CreditWithDailyCap(1) is a secondary guard: even if wasNew somehow returns true
			// twice in the same day (race condition with FirstOrCreate), the UTC daily cap
			// ensures only one credit lands in the database.
			if credited, err := h.blessingsService.CreditWithDailyCap(userID.(uint), 5, "daily_view", blessingsMultiplier, 1); err != nil {
				log.Printf("Blessings credit failed: %v", err)
				// Do NOT add blessing_credited: true to the response if the write failed.
			} else {
				// Tell the frontend exactly how much was credited so the toast shows the right number.
				blessingsCredited = credited
			}

			// Milestone check runs synchronously so the record is committed before
			// this response returns. The frontend's GET /api/streak (triggered by
			// the blessings toast) will therefore always see the new milestone.
			// Only the community-post side-effects remain async — they are best-effort.
			if h.rewardsService != nil {
				uid := userID.(uint)
				tz := settings.PreferredTimezone

				func() {
					defer func() {
						if r := recover(); r != nil {
							log.Printf("CheckMilestones panic for user %d: %v", uid, r)
						}
					}()
					streakSummary, _, _ := h.streakService.GetStreakSummary(uid, tz)
					currentStreak := 0
					if streakSummary != nil {
						currentStreak = streakSummary.CurrentStreak
					}
					grantedKeys := h.rewardsService.CheckMilestones(uid, currentStreak)

					// Community posts stay async — best-effort, never blocks the response.
					cs := h.communityService
					if cs != nil && len(grantedKeys) > 0 {
						ss := h.settingsService
						go func() {
							defer func() {
								if r := recover(); r != nil {
									log.Printf("CreateMilestonePost panic user %d: %v", uid, r)
								}
							}()
							userSettings, err := ss.GetUserSettings(uid)
							if err != nil || !userSettings.MilestonePostsOptIn {
								return
							}
							username, _ := ss.GetUsernameByID(uid)
							for _, key := range grantedKeys {
								if err := cs.CreateMilestonePost(uid, username, key); err != nil {
									log.Printf("CreateMilestonePost error user %d key %s: %v", uid, key, err)
								}
							}
						}()
					}
				}()
			}

			// Daily Disciplines: credit read_verse on first daily view.
			if h.disciplineService != nil {
				if _, dcErr := h.disciplineService.TryComplete(userID.(uint), "read_verse", c.GetBool("isPremium")); dcErr != nil {
					log.Printf("discipline TryComplete read_verse failed user %d: %v", userID, dcErr)
				}
			}
		}
	}

	// Collect the verse result — by the time we get here, auth/streak DB work has
	// likely consumed most of the Bible API round-trip, so this receive is often instant.
	vr := <-verseCh
	if vr.err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily verse"})
		return
	}
	verse := vr.verse

	// Resolve which Bible translation to serve (Phase 4).
	// resolveVersion respects ?version= > user settings > language default > premium gate.
	// Pass cachedSettings to avoid a second GetUserSettings DB call.
	resolvedVersion := h.resolveVersion(c, language, cachedSettings)

	// If the resolved version differs from the cached KJV text, fetch the translation.
	// The daily verse service always caches KJV (ID: "de4e12af7f28f599-02"); any other
	// version requires an additional API call (served from in-memory cache on repeat hits).
	// IMPORTANT: never mutate verse.Text — it points into the in-process memory cache.
	// Mutating it would poison the cache for all subsequent requests.
	const kjvVersionID = "de4e12af7f28f599-02"
	verseText := verse.Text
	if resolvedVersion.ID != kjvVersionID && resolvedVersion.ID != "" {
		if translatedVerse, err := h.bibleAPIService.GetVerseWithVersionID(verse.Reference, resolvedVersion.ID); err == nil {
			verseText = translatedVerse.Text
		} else {
			log.Printf("GetVerseWithVersionID(%q, %q) failed: %v; serving KJV fallback", verse.Reference, resolvedVersion.ID, err)
		}
	}

	// Record verse view in history if user is authenticated.
	// Fire-and-forget: history is non-critical and should never delay the response.
	if userID, exists := c.Get("userID"); exists {
		uid := userID.(uint)
		vid := verse.ID
		go func() {
			if err := h.historyService.AddToHistory(uid, vid); err != nil {
				log.Printf("AddToHistory failed for user %d: %v", uid, err)
			}
		}()
	}

	// Do not cache today's verse in the browser HTTP cache. The response is
	// user-specific (preferred_bible_version affects which translation is served)
	// so a public or shared cache could serve the wrong-language verse to a
	// different user or after settings change. The service worker provides
	// offline support via its own cache (wop-api-v4).
	c.Header("Cache-Control", "no-store")

	dailyDate := ""
	if verse.DailyDate != nil {
		dailyDate = *verse.DailyDate
	}
	response := gin.H{
		"verse": gin.H{
			"id":         verse.ID,
			"reference":  verse.Reference,
			"text":       verseText,
			"book":       verse.Book,
			"chapter":    verse.Chapter,
			"verse":      verse.VerseNumber,
			"version":    resolvedVersion.Abbreviation,
			"language":   language,
			"daily_date": dailyDate,
		},
	}

	// Add blessings_credited to response if any were credited
	if blessingsCredited > 0 {
		response["blessings_credited"] = blessingsCredited
	}

	c.JSON(http.StatusOK, response)
}

// GetVerseByReference fetches a verse by its reference
func (h *VerseHandler) GetVerseByReference(c *gin.Context) {
	reference := strings.TrimSpace(c.Param("reference"))
	if reference == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "reference is required"})
		return
	}
	language := c.DefaultQuery("lang", "en")

	resolvedVersion := h.resolveVersion(c, language, nil)

	var verse *services.BibleAPIVerse
	var err error
	if resolvedVersion.ID != "" {
		verse, err = h.bibleAPIService.GetVerseWithVersionID(reference, resolvedVersion.ID)
	} else {
		// Version ID empty means the license hasn't been applied yet; fall back to free default.
		freeKey := config.GetDefaultFreeVersion(language)
		freeVersion := config.BibleVersions[freeKey]
		verse, err = h.bibleAPIService.GetVerseWithVersionID(reference, freeVersion.ID)
		resolvedVersion = freeVersion
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch verse"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"verse": gin.H{
			"id":        verse.ID,
			"reference": verse.Reference,
			"text":      verse.Text,
			"bookId":    verse.BookID,
			"chapterId": verse.ChapterID,
			"version":   resolvedVersion.Abbreviation,
			"language":  language,
		},
	})
}

// SearchVerses searches for verses based on a query parameter.
// Accepts optional ?book=<BookName> to filter results by Bible book (free for all users).
func (h *VerseHandler) SearchVerses(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	limitStr := c.DefaultQuery("limit", "10")
	language := c.DefaultQuery("lang", "en")
	bookFilter := strings.TrimSpace(c.Query("book"))

	// Return an empty result set immediately rather than hitting the Bible API
	// with an empty query string.
	if query == "" {
		c.JSON(http.StatusOK, gin.H{"results": []gin.H{}})
		return
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	// Clamp to a reasonable max to prevent abuse.
	if limit > 50 {
		limit = 50
	}

	verses, err := h.bibleAPIService.SearchVersesWithLanguage(query, limit, language)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search verses"})
		return
	}

	// Use a pre-allocated slice so the JSON encodes as [] not null when empty.
	results := make([]gin.H, 0, len(verses))
	bookFilterLower := strings.ToLower(bookFilter)
	for _, verse := range verses {
		// Apply optional book filter (client-side on the result set — the Bible API
		// doesn't support book-scoped search natively).
		if bookFilterLower != "" && !strings.HasPrefix(strings.ToLower(verse.Reference), bookFilterLower) {
			continue
		}
		results = append(results, gin.H{
			"id":        verse.ID,
			"reference": verse.Reference,
			"text":      verse.Text,
			"bookId":    verse.BookID,
			"chapterId": verse.ChapterID,
			"language":  language,
		})
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

// RecordShare credits Blessings when an authenticated user shares a verse.
// Capped at 2 shares per day (UTC) to prevent farming.
// Returns { blessings_credited: N } — N is 0 when the daily cap has been reached.
func (h *VerseHandler) RecordShare(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	blessingsMultiplier := 1.0
	if c.GetBool("isPremium") {
		blessingsMultiplier = 1.5
	}

	credited, err := h.blessingsService.CreditWithDailyCap(userID.(uint), 5, "verse_shared", blessingsMultiplier, 2)
	if err != nil {
		log.Printf("RecordShare: blessings credit failed for user %d: %v", userID, err)
	}

	resp := gin.H{"blessings_credited": credited}
	if h.disciplineService != nil {
		if dcCredits, dcErr := h.disciplineService.TryComplete(userID.(uint), "share_verse", c.GetBool("isPremium")); dcErr != nil {
			log.Printf("discipline TryComplete share_verse failed user %d: %v", userID, dcErr)
		} else if dcCredits > 0 {
			resp["discipline_completed"] = gin.H{"key": "share_verse", "blessings_credited": dcCredits}
		}
	}
	c.JSON(http.StatusOK, resp)
}
