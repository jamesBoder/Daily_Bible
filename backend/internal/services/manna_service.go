package services

import (
	"errors"
	"fmt"
	"math/rand"
	"regexp"
	"strconv"
	"strings"
	"time"

	"dailybible/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const maxMannaGuesses = 6
const maxMannaHints = 3
const hintCost = 15

// MannaService manages the daily Manna word puzzle.
type MannaService struct {
	db               *gorm.DB
	blessingsService *BlessingsService
}

// NewMannaService creates a MannaService.
func NewMannaService(db *gorm.DB, blessingsService *BlessingsService) *MannaService {
	return &MannaService{db: db, blessingsService: blessingsService}
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

	// Hints
	HintsUsed   int          `json:"hints_used"`
	HintLetters []HintLetter `json:"hint_letters,omitempty"`

	// Revealed only on solved/failed:
	Answer        *string `json:"answer,omitempty"`
	ScriptureText *string `json:"scripture_text,omitempty"`
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
	Word       string `json:"word,omitempty"` // revealed after game is over
}

// ─── Word selection ───────────────────────────────────────────────────────────

// GetTodayWord returns the word for today using a date-seeded PRNG.
// Deterministic: same UTC date always returns the same word across all instances.
func (s *MannaService) GetTodayWord() (*models.MannaWord, error) {
	return s.getWordForDate(time.Now().UTC())
}

// GetYesterdayWord returns the word for yesterday.
func (s *MannaService) GetYesterdayWord() (*models.MannaWord, error) {
	return s.getWordForDate(time.Now().UTC().AddDate(0, 0, -1))
}

func (s *MannaService) getWordForDate(t time.Time) (*models.MannaWord, error) {
	var words []models.MannaWord
	if err := s.db.Order("id asc").Find(&words).Error; err != nil {
		return nil, err
	}
	if len(words) == 0 {
		return nil, errors.New("word bank is empty")
	}
	dateStr := t.Format("20060102")
	seed, _ := strconv.ParseInt(dateStr, 10, 64)
	rng := rand.New(rand.NewSource(seed))
	return &words[rng.Intn(len(words))], nil
}

// ─── Game management ──────────────────────────────────────────────────────────

// GetOrCreateGame returns the user's game for today, creating one if absent.
func (s *MannaService) GetOrCreateGame(userID uint) (*MannaGameResponse, error) {
	todayWord, err := s.GetTodayWord()
	if err != nil {
		return nil, fmt.Errorf("GetTodayWord: %w", err)
	}

	today := time.Now().UTC().Truncate(24 * time.Hour)

	var game models.MannaGame
	newGame := models.MannaGame{
		UserID:   userID,
		GameDate: today,
		WordID:   todayWord.ID,
		Status:   "in_progress",
	}
	ins := s.db.Clauses(clause.OnConflict{DoNothing: true}).Create(&newGame)
	if ins.Error != nil {
		return nil, fmt.Errorf("create game: %w", ins.Error)
	}
	if ins.RowsAffected > 0 {
		game = newGame
	} else {
		if err := s.db.Where("user_id = ? AND game_date = ?", userID, today).First(&game).Error; err != nil {
			return nil, fmt.Errorf("refetch game: %w", err)
		}
	}

	guesses, err := s.loadGuesses(game.ID)
	if err != nil {
		return nil, err
	}

	resp := &MannaGameResponse{
		Locked:             false,
		GameID:             game.ID,
		Status:             game.Status,
		GuessCount:         game.GuessCount,
		MaxGuesses:         maxMannaGuesses,
		Guesses:            guesses,
		WordLength:         5,
		ScriptureReference: todayWord.ScriptureReference,
		ScriptureClue:      buildScriptureClue(todayWord.ScriptureText, todayWord.Word),
		Testament:          getTestament(todayWord.ScriptureReference),
		HintsUsed:          game.HintsUsed,
		HintLetters:        parseHintLetters(game.HintLetters),
	}

	if game.Status == "solved" || game.Status == "failed" {
		resp.Answer = &todayWord.Word
		resp.ScriptureText = &todayWord.ScriptureText
	}

	return resp, nil
}

// SubmitGuess validates a guess and advances the game state.
func (s *MannaService) SubmitGuess(userID uint, guessWord string, isPremium bool) (*GuessResult, error) {
	guessWord = strings.ToUpper(strings.TrimSpace(guessWord))
	if len(guessWord) != 5 {
		return nil, errors.New("guess_length: Guesses must be exactly 5 letters")
	}
	for _, ch := range guessWord {
		if ch < 'A' || ch > 'Z' {
			return nil, errors.New("guess_chars: Guesses must contain only letters A–Z")
		}
	}

	today := time.Now().UTC().Truncate(24 * time.Hour)

	var game models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date = ?", userID, today).First(&game).Error; err != nil {
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
	failed := !solved && game.GuessCount >= maxMannaGuesses

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
		s.db.Model(&game).Update("blessings_awarded", true)

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
	}

	if game.Status == "solved" || game.Status == "failed" {
		resp.Answer = &word.Word
		resp.ScriptureReference = &word.ScriptureReference
		resp.ScriptureText = &word.ScriptureText
	}

	return resp, nil
}

// GetHint reveals one unrevealed letter position, costing hintCost Blessings.
// Returns an error if: game is over, max hints reached, or insufficient blessings.
func (s *MannaService) GetHint(userID uint) (*HintResponse, error) {
	today := time.Now().UTC().Truncate(24 * time.Hour)

	var game models.MannaGame
	if err := s.db.Where("user_id = ? AND game_date = ?", userID, today).First(&game).Error; err != nil {
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
	today := time.Now().UTC().Truncate(24 * time.Hour)

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
		summaries = append(summaries, MannaGameSummary{
			GameDate:   g.GameDate.Format("2006-01-02"),
			Status:     g.Status,
			GuessCount: g.GuessCount,
			Word:       wordMap[g.WordID],
		})
	}
	return summaries, nil
}

// ─── Scripture clue helpers ───────────────────────────────────────────────────

// buildScriptureClue replaces every whole-word occurrence of the target word
// in the scripture text with underscores, giving players a contextual clue
// without revealing the answer outright.
func buildScriptureClue(text, word string) string {
	blank := strings.Repeat("_", len(word))
	re := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(word) + `\b`)
	return re.ReplaceAllString(text, blank)
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
func evaluateGuess(answer, guess string) []string {
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
