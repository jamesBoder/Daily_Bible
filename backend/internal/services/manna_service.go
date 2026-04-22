package services

import (
	"errors"
	"fmt"
	"math/rand"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"dailybible/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const maxMannaGuesses = 6
const guestMannaGuesses = 3
const maxMannaHints = 3
const hintCost = 15

// mannaEffectiveNow returns the current time adjusted to UTC-10, aligning Manna's
// daily boundary with the daily verse rollover (both reset at UTC-10 midnight = 10 AM UTC).
func mannaEffectiveNow() time.Time {
	return time.Now().UTC().Add(-10 * time.Hour)
}

// mannaEffectiveToday returns the start of the current UTC-10 "day" as a UTC time.
func mannaEffectiveToday() time.Time {
	return mannaEffectiveNow().Truncate(24 * time.Hour)
}

// wordCache caches today's selected MannaWord and yesterday's, avoiding the
// full-table scan of manna_words on every GET /api/manna/today request.
// Both entries are keyed by "YYYYMMDD" date string and invalidate automatically
// when the date changes. Thread-safe via sync.RWMutex.
type wordCache struct {
	mu      sync.RWMutex
	entries map[string]*models.MannaWord // key: "YYYYMMDD"
}

// MannaService manages the daily Manna word puzzle.
type MannaService struct {
	db               *gorm.DB
	blessingsService *BlessingsService
	wordCache        wordCache
}

// NewMannaService creates a MannaService.
func NewMannaService(db *gorm.DB, blessingsService *BlessingsService) *MannaService {
	return &MannaService{
		db:               db,
		blessingsService: blessingsService,
		wordCache:        wordCache{entries: make(map[string]*models.MannaWord)},
	}
}

// ─── Response types ───────────────────────────────────────────────────────────

// HintLetter represents a revealed letter at a specific board position.
type HintLetter struct {
	Position int    `json:"position"` // 0-indexed
	Letter   string `json:"letter"`
}

// HintResponse is what POST /api/manna/hint returns.
type HintResponse struct {
	Position           int          `json:"position"`
	Letter             string       `json:"letter"`
	HintsUsed          int          `json:"hints_used"`
	HintLetters        []HintLetter `json:"hint_letters"`
	BlessingsRemaining int          `json:"blessings_remaining"`
}

// GuessEntry is one submitted guess as returned to the frontend.
type GuessEntry struct {
	Word   string   `json:"word"`
	Result []string `json:"result"`
}

// MannaGameResponse is what GET /api/manna/today returns when unlocked.
type MannaGameResponse struct {
	Locked     bool         `json:"locked"`
	GameID     uint         `json:"game_id"`
	Status     string       `json:"status"`
	GuessCount int          `json:"guess_count"`
	MaxGuesses int          `json:"max_guesses"`
	Guesses    []GuessEntry `json:"guesses"`
	WordLength int          `json:"word_length"`

	// Scripture clue — shown at the start with the target word blanked out.
	// This is the key differentiator from Wordle: the player sees context first.
	ScriptureReference string `json:"scripture_reference"`
	ScriptureClue      string `json:"scripture_clue"` // text with word → _____
	Testament          string `json:"testament"`       // "Old Testament" | "New Testament"

	// Free play indicator — true for free (non-premium) users
	IsFreePlay bool `json:"is_free_play"`

	// Hints
	HintsUsed   int          `json:"hints_used"`
	HintLetters []HintLetter `json:"hint_letters,omitempty"`

	// Revealed only on solved/failed:
	Answer         *string `json:"answer,omitempty"`
	ScriptureText  *string `json:"scripture_text,omitempty"`
	// ConnectionNote explains how the answer word connects to the scripture when
	// the relationship is not obvious (e.g. the word is the author or book name).
	// Only populated when a note exists; omitted otherwise.
	ConnectionNote *string `json:"connection_note,omitempty"`
}

// GuessResult is what POST /api/manna/guess returns.
type GuessResult struct {
	Result             []string `json:"result"`
	Status             string   `json:"status"`
	GuessCount         int      `json:"guess_count"`
	Answer             *string  `json:"answer,omitempty"`
	ScriptureReference *string  `json:"scripture_reference,omitempty"`
	ScriptureText      *string  `json:"scripture_text,omitempty"`
	BlessingsAwarded   *int     `json:"blessings_awarded,omitempty"`
	StreakBonus        *int     `json:"streak_bonus,omitempty"`  // extra blessings awarded for win streak
	WinStreak          *int     `json:"win_streak,omitempty"`   // current consecutive-solve streak
}

// YesterdayResult is returned from GET /api/manna/yesterday.
type YesterdayResult struct {
	Word               string `json:"word"`
	ScriptureReference string `json:"scripture_reference"`
	ScriptureText      string `json:"scripture_text"`
}

// MannaGameSummary is one row in GET /api/manna/history.
type MannaGameSummary struct {
	GameDate   string `json:"game_date"`
	Status     string `json:"status"`
	GuessCount int    `json:"guess_count"`
	MaxGuesses int    `json:"max_guesses"`
	Word       string `json:"word,omitempty"` // revealed after game is over
}

// ─── Word selection ───────────────────────────────────────────────────────────

// GetTodayWord returns the word for today using a date-seeded PRNG.
// Deterministic: same UTC date always returns the same word across all instances.
func (s *MannaService) GetTodayWord() (*models.MannaWord, error) {
	return s.getWordForDate(mannaEffectiveNow())
}

// GetYesterdayWord returns the word for yesterday.
func (s *MannaService) GetYesterdayWord() (*models.MannaWord, error) {
	return s.getWordForDate(mannaEffectiveNow().AddDate(0, 0, -1))
}

func (s *MannaService) getWordForDate(t time.Time) (*models.MannaWord, error) {
	dateStr := t.Format("20060102")

	// Cache hit: return without touching the DB.
	s.wordCache.mu.RLock()
	if w, ok := s.wordCache.entries[dateStr]; ok {
		s.wordCache.mu.RUnlock()
		return w, nil
	}
	s.wordCache.mu.RUnlock()

	// Cache miss: fetch the full word bank and pick deterministically.
	var words []models.MannaWord
	if err := s.db.Where("LENGTH(word) = 5").Order("id asc").Find(&words).Error; err != nil {
		return nil, err
	}
	if len(words) == 0 {
		return nil, errors.New("word bank is empty")
	}
	// Seed format: YYYYMMDD as int64. Same seed = same word across all server instances.
	seed, _ := strconv.ParseInt(dateStr, 10, 64)
	rng := rand.New(rand.NewSource(seed))
	word := &words[rng.Intn(len(words))]

	// Populate cache. Evict stale keys (yesterday and older) to keep memory bounded.
	today := mannaEffectiveNow().Format("20060102")
	yesterday := mannaEffectiveNow().AddDate(0, 0, -1).Format("20060102")
	s.wordCache.mu.Lock()
	for k := range s.wordCache.entries {
		if k != today && k != yesterday {
			delete(s.wordCache.entries, k)
		}
	}
	s.wordCache.entries[dateStr] = word
	s.wordCache.mu.Unlock()

	return word, nil
}

// ─── Game management ──────────────────────────────────────────────────────────

// getOrCreateGameForDate returns the user's game for the given date, creating one if absent.
// All signed-in users (free and premium alike) get the full daily game: 6 guesses + scripture clue.
// Premium-only features (hints, history, archive) are gated in the handler layer.
func (s *MannaService) getOrCreateGameForDate(userID uint, date time.Time) (*MannaGameResponse, error) {
	prngWord, err := s.getWordForDate(date)
	if err != nil {
		return nil, fmt.Errorf("getWordForDate: %w", err)
	}

	var game models.MannaGame
	newGame := models.MannaGame{
		UserID:     userID,
		GameDate:   date,
		WordID:     prngWord.ID,
		Status:     "in_progress",
		MaxGuesses: maxMannaGuesses,
	}
	ins := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&newGame)
	if ins.Error != nil {
		return nil, fmt.Errorf("create game: %w", ins.Error)
	}

	// word is the authoritative answer for this game. For new games it matches the
	// PRNG selection. For existing games we must re-fetch by game.WordID because the
	// word bank may have grown since the game was created, which shifts the PRNG index
	// and causes getWordForDate to return a different word than the one stored in the game.
	word := prngWord
	if ins.RowsAffected > 0 {
		game = newGame
	} else {
		if err := s.db.Where("user_id = ? AND game_date = ?", userID, date).First(&game).Error; err != nil {
			return nil, fmt.Errorf("refetch game: %w", err)
		}
		if game.WordID != prngWord.ID {
			var storedWord models.MannaWord
			if err := s.db.First(&storedWord, game.WordID).Error; err != nil {
				return nil, fmt.Errorf("load stored word: %w", err)
			}
			word = &storedWord
		}
	}

	guesses, err := s.loadGuesses(game.ID)
	if err != nil {
		return nil, err
	}

	// Effective max: use stored value if present (handles rows created before this migration).
	effectiveMax := game.MaxGuesses
	if effectiveMax == 0 {
		effectiveMax = maxMannaGuesses
	}

	resp := &MannaGameResponse{
		Locked:             false,
		GameID:             game.ID,
		Status:             game.Status,
		GuessCount:         game.GuessCount,
		MaxGuesses:         effectiveMax,
		Guesses:            guesses,
		WordLength:         5,
		IsFreePlay:         false, // all signed-in users get the full game
		HintsUsed:          game.HintsUsed,
		HintLetters:        parseHintLetters(game.HintLetters),
		ScriptureReference: word.ScriptureReference,
		ScriptureClue:      buildScriptureClue(word.ScriptureText, word.Word),
		Testament:          getTestament(word.ScriptureReference),
	}

	if game.Status == "solved" || game.Status == "failed" {
		resp.Answer = &word.Word
		resp.ScriptureText = &word.ScriptureText
		if word.ConnectionNote != "" {
			resp.ConnectionNote = &word.ConnectionNote
		}
	}

	return resp, nil
}

// GetOrCreateGame returns the user's game for today, creating one if absent.
// All authenticated users (free and premium) get the full game.
func (s *MannaService) GetOrCreateGame(userID uint) (*MannaGameResponse, error) {
	return s.getOrCreateGameForDate(userID, mannaEffectiveToday())
}

// GetOrCreateArchiveGame returns a game for a past date, creating one if absent (premium-gated in handler).
func (s *MannaService) GetOrCreateArchiveGame(userID uint, date time.Time) (*MannaGameResponse, error) {
	return s.getOrCreateGameForDate(userID, date)
}

// submitGuessForDate validates a guess and advances the game state for the given date.
func (s *MannaService) submitGuessForDate(userID uint, guessWord string, isPremium bool, date time.Time) (*GuessResult, error) {
	guessWord = strings.ToUpper(strings.TrimSpace(guessWord))
	if len(guessWord) != 5 {
		return nil, errors.New("guess_length: Guesses must be exactly 5 letters")
	}
	for _, ch := range guessWord {
		if ch < 'A' || ch > 'Z' {
			return nil, errors.New("guess_chars: Guesses must contain only letters A–Z")
		}
	}

	var game models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date = ?", userID, date).First(&game).Error; err != nil {
		return nil, fmt.Errorf("game not found: %w", err)
	}

	if game.Status != "in_progress" {
		return nil, errors.New("game_over: This game is already complete")
	}

	var word models.MannaWord
	if err := s.db.First(&word, game.WordID).Error; err != nil {
		return nil, fmt.Errorf("load word: %w", err)
	}

	tileParts := evaluateGuess(word.Word, guessWord)
	resultStr := strings.Join(tileParts, ",")

	guess := models.MannaGuess{
		GameID:    game.ID,
		GuessWord: guessWord,
		Result:    resultStr,
	}
	if err := s.db.Create(&guess).Error; err != nil {
		return nil, fmt.Errorf("save guess: %w", err)
	}

	game.GuessCount++

	solved := guessWord == word.Word
	effectiveMax := game.MaxGuesses
	if effectiveMax == 0 {
		effectiveMax = maxMannaGuesses
	}
	failed := !solved && game.GuessCount >= effectiveMax

	if solved {
		game.Status = "solved"
	} else if failed {
		game.Status = "failed"
	}

	if err := s.db.Save(&game).Error; err != nil {
		return nil, fmt.Errorf("update game: %w", err)
	}

	resp := &GuessResult{
		Result:     tileParts,
		Status:     game.Status,
		GuessCount: game.GuessCount,
	}

	if (game.Status == "solved" || game.Status == "failed") && !game.BlessingsAwarded {
		// Atomic test-and-set: only the request that flips blessings_awarded false→true
		// will get RowsAffected == 1. Concurrent duplicate requests see 0 and skip.
		award := s.db.Model(&game).
			Where("blessings_awarded = ?", false).
			Update("blessings_awarded", true)

		if award.RowsAffected > 0 {
			var base int
			var reason string
			if game.Status == "solved" {
				base, reason = 20, "manna_solved"
			} else {
				base, reason = 10, "manna_played"
			}
			multiplier := 1.0
			if isPremium {
				multiplier = 1.5
			}

			go func() {
				defer func() { recover() }()
				s.blessingsService.Credit(userID, base, reason, multiplier)
			}()

			blessings := int(float64(base) * multiplier)
			resp.BlessingsAwarded = &blessings

			// Streak bonus: only for today's solved game (not archive plays).
			today := mannaEffectiveToday()
			if game.Status == "solved" && date.Equal(today) {
				winStreak := s.computeMannaWinStreak(userID, date)
				bonusBase := mannaStreakBonusBase(winStreak)
				if bonusBase > 0 {
					bonus := int(float64(bonusBase) * multiplier)
					go func() {
						defer func() { recover() }()
						s.blessingsService.Credit(userID, bonusBase, "manna_streak_bonus", multiplier)
					}()
					resp.StreakBonus = &bonus
					resp.WinStreak = &winStreak
				}
			}
		}
	}

	if game.Status == "solved" || game.Status == "failed" {
		resp.Answer = &word.Word
		resp.ScriptureReference = &word.ScriptureReference
		resp.ScriptureText = &word.ScriptureText
	}

	return resp, nil
}

// SubmitGuess validates a guess and advances today's game state.
func (s *MannaService) SubmitGuess(userID uint, guessWord string, isPremium bool) (*GuessResult, error) {
	return s.submitGuessForDate(userID, guessWord, isPremium, mannaEffectiveToday())
}

// SubmitArchiveGuess validates a guess for an archive (past) game.
func (s *MannaService) SubmitArchiveGuess(userID uint, guessWord string, date time.Time) (*GuessResult, error) {
	return s.submitGuessForDate(userID, guessWord, true, date)
}

// forfeitGameForDate marks an in-progress game as failed and returns the full game state
// with the answer revealed. Hint blessings are not refunded. Participation blessings
// (10 base) are awarded the same as a natural failure, preventing double-credit.
func (s *MannaService) forfeitGameForDate(userID uint, date time.Time, isPremium bool) (*MannaGameResponse, error) {
	var game models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date = ?", userID, date).First(&game).Error; err != nil {
		return nil, errors.New("forfeit_no_game: no active game found")
	}
	if game.Status != "in_progress" {
		return nil, errors.New("forfeit_over: this game is already complete")
	}

	var word models.MannaWord
	if err := s.db.First(&word, game.WordID).Error; err != nil {
		return nil, fmt.Errorf("load word: %w", err)
	}

	game.Status = "failed"
	if err := s.db.Save(&game).Error; err != nil {
		return nil, fmt.Errorf("update game: %w", err)
	}

	// Award participation blessings once (same as natural failure).
	if !game.BlessingsAwarded {
		award := s.db.Model(&game).
			Where("blessings_awarded = ?", false).
			Update("blessings_awarded", true)
		if award.RowsAffected > 0 {
			multiplier := 1.0
			if isPremium {
				multiplier = 1.5
			}
			go func() {
				defer func() { recover() }()
				s.blessingsService.Credit(userID, 10, "manna_played", multiplier)
			}()
		}
	}

	guesses, err := s.loadGuesses(game.ID)
	if err != nil {
		return nil, err
	}

	effectiveMax := game.MaxGuesses
	if effectiveMax == 0 {
		effectiveMax = maxMannaGuesses
	}

	resp := &MannaGameResponse{
		Locked:             false,
		GameID:             game.ID,
		Status:             "failed",
		GuessCount:         game.GuessCount,
		MaxGuesses:         effectiveMax,
		Guesses:            guesses,
		WordLength:         5,
		IsFreePlay:         false,
		HintsUsed:          game.HintsUsed,
		HintLetters:        parseHintLetters(game.HintLetters),
		ScriptureReference: word.ScriptureReference,
		ScriptureClue:      buildScriptureClue(word.ScriptureText, word.Word),
		Testament:          getTestament(word.ScriptureReference),
		Answer:             &word.Word,
		ScriptureText:      &word.ScriptureText,
	}
	if word.ConnectionNote != "" {
		resp.ConnectionNote = &word.ConnectionNote
	}

	return resp, nil
}

// ForfeitToday forfeits the current in-progress game for today.
func (s *MannaService) ForfeitToday(userID uint, isPremium bool) (*MannaGameResponse, error) {
	return s.forfeitGameForDate(userID, mannaEffectiveToday(), isPremium)
}

// ForfeitArchiveGame forfeits an in-progress archive game for the given date.
func (s *MannaService) ForfeitArchiveGame(userID uint, date time.Time) (*MannaGameResponse, error) {
	return s.forfeitGameForDate(userID, date, true)
}

// getHintForDate reveals one unrevealed letter position for a game on the given date,
// costing hintCost Blessings.
// Returns an error if: game is over, max hints reached, or insufficient blessings.
func (s *MannaService) getHintForDate(userID uint, date time.Time) (*HintResponse, error) {
	var game models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date = ?", userID, date).First(&game).Error; err != nil {
		return nil, errors.New("hint_no_game: No active game for today")
	}
	if game.Status != "in_progress" {
		return nil, errors.New("hint_game_over: The game is already complete")
	}
	if game.HintsUsed >= maxMannaHints {
		return nil, errors.New("hint_max: No hints remaining")
	}

	var word models.MannaWord
	if err := s.db.First(&word, game.WordID).Error; err != nil {
		return nil, fmt.Errorf("load word: %w", err)
	}

	// Find positions already revealed by correct guesses or prior hints
	revealed := make(map[int]bool)
	for _, h := range parseHintLetters(game.HintLetters) {
		revealed[h.Position] = true
	}
	guesses, _ := s.loadGuesses(game.ID)
	for _, g := range guesses {
		for i, r := range g.Result {
			if r == "correct" {
				revealed[i] = true
			}
		}
	}

	unrevealed := []int{}
	for i := 0; i < 5; i++ {
		if !revealed[i] {
			unrevealed = append(unrevealed, i)
		}
	}
	if len(unrevealed) == 0 {
		return nil, errors.New("hint_none_left: All positions already revealed")
	}

	// Determine which position to reveal before the transaction
	pos := unrevealed[rand.Intn(len(unrevealed))]
	letter := string(word.Word[pos])
	existing := parseHintLetters(game.HintLetters)
	existing = append(existing, HintLetter{Position: pos, Letter: letter})

	// Debit blessings and persist the hint atomically — if either fails, both roll back.
	// This prevents losing Blessings without receiving a hint.
	var remaining int
	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := s.blessingsService.DebitTx(tx, userID, hintCost, "manna_hint"); err != nil {
			return fmt.Errorf("hint_blessings: %w", err)
		}
		game.HintLetters = formatHintLetters(existing)
		game.HintsUsed++
		return tx.Save(&game).Error
	}); err != nil {
		return nil, err
	}
	remaining, _ = s.blessingsService.GetBalance(userID)

	return &HintResponse{
		Position:           pos,
		Letter:             letter,
		HintsUsed:          game.HintsUsed,
		HintLetters:        existing,
		BlessingsRemaining: remaining,
	}, nil
}

// GetHint reveals one unrevealed letter position for today's game.
func (s *MannaService) GetHint(userID uint) (*HintResponse, error) {
	return s.getHintForDate(userID, mannaEffectiveToday())
}

// GetArchiveHint reveals one unrevealed letter position for an archive game.
func (s *MannaService) GetArchiveHint(userID uint, date time.Time) (*HintResponse, error) {
	return s.getHintForDate(userID, date)
}

// ─── Guest game (unauthenticated play) ───────────────────────────────────────

// GuestGameInfo is returned by GET /api/manna/guest/today.
// No word is included — the frontend only learns the word when the game ends.
type GuestGameInfo struct {
	WordLength         int    `json:"word_length"`
	MaxGuesses         int    `json:"max_guesses"`
	ScriptureReference string `json:"scripture_reference"`
	ScriptureClue      string `json:"scripture_clue"`
	Testament          string `json:"testament"`
}

// GuestGuessResult is returned by POST /api/manna/guest/guess.
type GuestGuessResult struct {
	Result             []string `json:"result"`
	Answer             *string  `json:"answer,omitempty"`              // only on correct guess or last guess
	ScriptureReference *string  `json:"scripture_reference,omitempty"` // only on game end
	ScriptureText      *string  `json:"scripture_text,omitempty"`      // full verse revealed on game end
}

// GetGuestGameInfo returns the guest game configuration with today's scripture clue.
func (s *MannaService) GetGuestGameInfo() *GuestGameInfo {
	info := &GuestGameInfo{WordLength: 5, MaxGuesses: guestMannaGuesses}
	word, err := s.GetTodayWord()
	if err != nil {
		return info
	}
	info.ScriptureReference = word.ScriptureReference
	info.ScriptureClue = buildScriptureClue(word.ScriptureText, word.Word)
	info.Testament = getTestament(word.ScriptureReference)
	return info
}

// EvaluateGuestGuess validates and scores a guest guess against today's word.
// isLastGuess should be true when the client has used its final allowed guess (so the
// answer can be revealed on a wrong final guess).
// No game state is stored — guest state lives entirely in the browser (localStorage).
func (s *MannaService) EvaluateGuestGuess(guess string, isLastGuess bool) (*GuestGuessResult, error) {
	guess = strings.ToUpper(strings.TrimSpace(guess))
	if len(guess) != 5 {
		return nil, errors.New("guess_length: Guesses must be exactly 5 letters")
	}
	for _, ch := range guess {
		if ch < 'A' || ch > 'Z' {
			return nil, errors.New("guess_chars: Guesses must contain only letters A–Z")
		}
	}

	word, err := s.GetTodayWord()
	if err != nil {
		return nil, fmt.Errorf("get today word: %w", err)
	}

	result := evaluateGuess(word.Word, guess)
	isSolved := guess == word.Word

	resp := &GuestGuessResult{Result: result}
	if isSolved || isLastGuess {
		resp.Answer = &word.Word
		resp.ScriptureReference = &word.ScriptureReference
		resp.ScriptureText = &word.ScriptureText
	}
	return resp, nil
}

// GetYesterdayResult returns yesterday's word + scripture. Public — no auth needed.
func (s *MannaService) GetYesterdayResult() (*YesterdayResult, error) {
	word, err := s.GetYesterdayWord()
	if err != nil {
		return nil, err
	}
	return &YesterdayResult{
		Word:               word.Word,
		ScriptureReference: word.ScriptureReference,
		ScriptureText:      word.ScriptureText,
	}, nil
}

// GetHistory returns all past game summaries for a premium user.
func (s *MannaService) GetHistory(userID uint) ([]MannaGameSummary, error) {
	today := mannaEffectiveToday()

	var games []models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date < ?", userID, today).
		Order("game_date desc").
		Limit(90).
		Find(&games).Error; err != nil {
		return nil, err
	}

	wordIDs := make([]uint, 0, len(games))
	for _, g := range games {
		wordIDs = append(wordIDs, g.WordID)
	}
	var words []models.MannaWord
	wordMap := map[uint]string{}
	if len(wordIDs) > 0 {
		if err := s.db.Where("id IN ?", wordIDs).Find(&words).Error; err == nil {
			for _, w := range words {
				wordMap[w.ID] = w.Word
			}
		}
	}

	summaries := make([]MannaGameSummary, 0, len(games))
	for _, g := range games {
		mg := g.MaxGuesses
		if mg == 0 {
			mg = maxMannaGuesses // backward compat for pre-migration rows
		}
		summaries = append(summaries, MannaGameSummary{
			GameDate:   g.GameDate.Format("2006-01-02"),
			Status:     g.Status,
			GuessCount: g.GuessCount,
			MaxGuesses: mg,
			Word:       wordMap[g.WordID],
		})
	}
	return summaries, nil
}

// ─── Scripture clue helpers ───────────────────────────────────────────────────

// buildScriptureClue replaces every whole-word occurrence of the target word
// in the scripture text with underscores, giving players a contextual clue
// without revealing the answer outright.
//
// Uses (^|[^A-Za-z]) boundary anchors instead of \b so that apostrophes,
// hyphens, and other punctuation adjacent to the word are handled correctly.
// Capture groups preserve the surrounding non-letter characters in the output.
func buildScriptureClue(text, word string) string {
	blank := strings.Repeat("_", len(word))
	// Pattern: optional non-letter before, word (case-insensitive), optional non-letter after.
	// Capture groups $1/$2 restore the surrounding chars so they are not swallowed.
	re := regexp.MustCompile(`(?i)(^|[^A-Za-z])` + regexp.QuoteMeta(word) + `([^A-Za-z]|$)`)
	return re.ReplaceAllString(text, "${1}"+blank+"${2}")
}

// ntBooks is the set of New Testament book name prefixes (lowercase).
var ntBooks = map[string]bool{
	"matthew": true, "mark": true, "luke": true, "john": true,
	"acts": true, "romans": true, "corinthians": true, "galatians": true,
	"ephesians": true, "philippians": true, "colossians": true,
	"thessalonians": true, "timothy": true, "titus": true, "philemon": true,
	"hebrews": true, "james": true, "peter": true, "revelation": true,
	"jude": true,
}

// getTestament derives "Old Testament" or "New Testament" from a scripture
// reference string such as "John 3:16" or "1 Corinthians 13:4".
func getTestament(ref string) string {
	lower := strings.ToLower(strings.TrimSpace(ref))
	// Strip leading numeral — e.g. "1 corinthians 13:4" → "corinthians 13:4"
	if len(lower) >= 2 && lower[0] >= '1' && lower[0] <= '3' && lower[1] == ' ' {
		lower = strings.TrimSpace(lower[2:])
	}
	parts := strings.Fields(lower)
	if len(parts) == 0 {
		return "Old Testament"
	}
	if ntBooks[parts[0]] {
		return "New Testament"
	}
	return "Old Testament"
}

// ─── Hint letter encoding ─────────────────────────────────────────────────────

// parseHintLetters decodes "0:G,2:A" → []HintLetter{{0,"G"},{2,"A"}}.
func parseHintLetters(s string) []HintLetter {
	if s == "" {
		return nil
	}
	var out []HintLetter
	for _, part := range strings.Split(s, ",") {
		kv := strings.SplitN(part, ":", 2)
		if len(kv) != 2 {
			continue
		}
		pos, err := strconv.Atoi(kv[0])
		if err != nil {
			continue
		}
		out = append(out, HintLetter{Position: pos, Letter: kv[1]})
	}
	return out
}

// formatHintLetters encodes []HintLetter → "0:G,2:A".
func formatHintLetters(hints []HintLetter) string {
	parts := make([]string, 0, len(hints))
	for _, h := range hints {
		parts = append(parts, fmt.Sprintf("%d:%s", h.Position, h.Letter))
	}
	return strings.Join(parts, ",")
}

// ─── Guess evaluation ─────────────────────────────────────────────────────────

// evaluateGuess returns a 5-element slice of "correct", "present", or "absent".
// Uses two-pass algorithm to correctly handle duplicate letters.
// Both answer and guess must be exactly 5 uppercase letters.
func evaluateGuess(answer, guess string) []string {
	if len(answer) != 5 || len(guess) != 5 {
		// Defensive: caller already validates; this guard prevents an OOB panic
		// if this function is ever called from a future path without validation.
		result := make([]string, len(guess))
		for i := range result {
			result[i] = "absent"
		}
		return result
	}
	result := make([]string, 5)
	answerCounts := map[rune]int{}

	for i, ch := range guess {
		if rune(answer[i]) == ch {
			result[i] = "correct"
		} else {
			answerCounts[rune(answer[i])]++
		}
	}

	for i, ch := range guess {
		if result[i] == "correct" {
			continue
		}
		if answerCounts[ch] > 0 {
			result[i] = "present"
			answerCounts[ch]--
		} else {
			result[i] = "absent"
		}
	}
	return result
}

// ─── Stats (M-06) ─────────────────────────────────────────────────────────────

// MannaStats holds aggregated gameplay statistics for a user.
type MannaStats struct {
	Played        int            `json:"played"`
	Won           int            `json:"won"`
	WinRate       float64        `json:"win_rate"`        // 0–100
	AvgGuesses    float64        `json:"avg_guesses"`     // for solved games only
	CurrentStreak int            `json:"current_streak"`  // consecutive days played (solved or failed)
	MaxStreak     int            `json:"max_streak"`      // all-time max consecutive days played
	GuessDist     map[string]int `json:"guess_distribution"` // "1"–"6" → solved-game count per guess number
}

// GetStats computes aggregated Manna statistics for the given user.
func (s *MannaService) GetStats(userID uint) (*MannaStats, error) {
	var games []models.MannaGame
	if err := s.db.
		Where("user_id = ? AND status IN ('solved','failed')", userID).
		Order("game_date asc").
		Find(&games).Error; err != nil {
		return nil, fmt.Errorf("GetStats query: %w", err)
	}

	stats := &MannaStats{GuessDist: map[string]int{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0}}

	var totalGuessesWon float64
	for _, g := range games {
		stats.Played++
		if g.Status == "solved" {
			stats.Won++
			totalGuessesWon += float64(g.GuessCount)
			key := strconv.Itoa(g.GuessCount)
			if _, ok := stats.GuessDist[key]; ok {
				stats.GuessDist[key]++
			}
		}
	}

	if stats.Played > 0 {
		stats.WinRate = float64(stats.Won) / float64(stats.Played) * 100
	}
	if stats.Won > 0 {
		stats.AvgGuesses = totalGuessesWon / float64(stats.Won)
	}

	// Streak calculation: consecutive UTC-10 calendar days with any completed game.
	// Walk backwards from today; a game on today counts even if still in_progress
	// (but we only fetched solved/failed above — that's intentional: streak breaks on missed days).
	today := mannaEffectiveToday()
	dateSet := map[string]bool{}
	for _, g := range games {
		dateSet[g.GameDate.UTC().Truncate(24*time.Hour).Format("2006-01-02")] = true
	}

	// current streak: walk back from today (or yesterday if not played yet today)
	checkDate := today
	if !dateSet[checkDate.Format("2006-01-02")] {
		checkDate = checkDate.AddDate(0, 0, -1)
	}
	for dateSet[checkDate.Format("2006-01-02")] {
		stats.CurrentStreak++
		checkDate = checkDate.AddDate(0, 0, -1)
	}

	// max streak: single pass through sorted date set
	sorted := make([]time.Time, 0, len(dateSet))
	for _, g := range games {
		sorted = append(sorted, g.GameDate.UTC().Truncate(24*time.Hour))
	}
	cur := 0
	for i, d := range sorted {
		if i == 0 {
			cur = 1
		} else {
			prev := sorted[i-1]
			if d.Sub(prev) == 24*time.Hour {
				cur++
			} else {
				cur = 1
			}
		}
		if cur > stats.MaxStreak {
			stats.MaxStreak = cur
		}
	}

	return stats, nil
}

// ─── Streak Bonus ──────────────────────────────────────────────────────────────

// mannaStreakBonusBase returns the base (pre-multiplier) bonus blessings for a
// given consecutive-solve streak length. Tiers: 3-day = 5, 7-day = 10, 14-day = 20.
func mannaStreakBonusBase(streak int) int {
	switch {
	case streak >= 14:
		return 20
	case streak >= 7:
		return 10
	case streak >= 3:
		return 5
	default:
		return 0
	}
}

// computeMannaWinStreak counts consecutive calendar days (UTC) ending on solvedDate
// where the user solved the Manna puzzle. solvedDate itself counts as day 1.
func (s *MannaService) computeMannaWinStreak(userID uint, solvedDate time.Time) int {
	streak := 1
	checkDate := solvedDate.AddDate(0, 0, -1)
	for i := 0; i < 30; i++ {
		var count int64
		s.db.Model(&models.MannaGame{}).
			Where("user_id = ? AND status = 'solved' AND game_date = ?", userID, checkDate).
			Count(&count)
		if count == 0 {
			break
		}
		streak++
		checkDate = checkDate.AddDate(0, 0, -1)
	}
	return streak
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func (s *MannaService) loadGuesses(gameID uint) ([]GuessEntry, error) {
	var guesses []models.MannaGuess
	if err := s.db.Where("game_id = ?", gameID).Order("created_at asc").Find(&guesses).Error; err != nil {
		return nil, err
	}
	entries := make([]GuessEntry, 0, len(guesses))
	for _, g := range guesses {
		entries = append(entries, GuessEntry{
			Word:   g.GuessWord,
			Result: strings.Split(g.Result, ","),
		})
	}
	return entries, nil
}

// SeedWordCount returns the number of words in the word bank.
func (s *MannaService) SeedWordCount() int64 {
	var count int64
	s.db.Model(&models.MannaWord{}).Count(&count)
	return count
}

// AddWord inserts a new word into the Manna word bank.
// Returns an error if the word is not exactly 5 alphabetic letters, if the
// scripture reference is empty, or if the word already exists.
func (s *MannaService) AddWord(word, scriptureReference, scriptureText string) (*models.MannaWord, error) {
	word = strings.ToUpper(strings.TrimSpace(word))
	if len(word) != 5 {
		return nil, errors.New("add_word_length: word must be exactly 5 letters")
	}
	if matched, _ := regexp.MatchString(`^[A-Z]{5}$`, word); !matched {
		return nil, errors.New("add_word_chars: word must contain only letters A–Z")
	}
	if strings.TrimSpace(scriptureReference) == "" {
		return nil, errors.New("add_word_ref: scripture reference is required")
	}

	m := &models.MannaWord{
		Word:               word,
		ScriptureReference: strings.TrimSpace(scriptureReference),
		ScriptureText:      strings.TrimSpace(scriptureText),
	}
	if err := s.db.Create(m).Error; err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, fmt.Errorf("add_word_duplicate: %q already exists in the word bank", word)
		}
		return nil, fmt.Errorf("add_word_db: %w", err)
	}
	return m, nil
}
