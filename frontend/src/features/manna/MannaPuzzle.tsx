import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { mannaApi, GuessEntry, HintLetter, MannaGameResponse, MannaLockedResponse, YesterdayResult } from '../../services/api/manna';
import { SoundService } from '../../services/SoundService';
import { useStreak } from '../../contexts/StreakContext';
import { useAuth } from '../../hooks/useAuth';
import { PHYSICAL_KEY_SOUND_KEY } from '../settings/MannaSettings';
import { MannaLockedCard } from './MannaLockedCard';
import { MannaTile, TileState } from './MannaTile';
import { MannaKeyboard } from './MannaKeyboard';
import { MannaHowToPlay, MANNA_TUTORIAL_KEY } from './MannaHowToPlay';
import { MannaStatsModal } from './MannaStatsModal';
import { MannaArchive } from './MannaArchive';
import EndOfDayModal from '../../components/EndOfDayModal';
import posthog from 'posthog-js';
import './manna.css';

const EOD_SESSION_KEY_PREFIX = 'eod-shown-';

const WORD_LENGTH = 5;

// Session key — confetti fires once per solved game per browser session
const CONFETTI_SESSION_KEY = `manna-confetti-${new Date().toISOString().slice(0, 10)}`;

type KeyState = 'unused' | 'correct' | 'present' | 'absent';

const KEY_PRIORITY: Record<KeyState, number> = {
  correct: 3,
  present: 2,
  absent: 1,
  unused: 0,
};

function buildKeyStates(guesses: GuessEntry[]): Record<string, KeyState> {
  const map: Record<string, KeyState> = {};
  for (const g of guesses) {
    g.result.forEach((r, i) => {
      const letter = g.word[i];
      const newState = r as KeyState;
      const existing = map[letter] ?? 'unused';
      if (KEY_PRIORITY[newState] > KEY_PRIORITY[existing]) {
        map[letter] = newState;
      }
    });
  }
  return map;
}

// Returns the tile positions that the user must type into (positions not locked by hints)
function getFreePositions(hintLetters: HintLetter[] | undefined): number[] {
  const hinted = new Set((hintLetters ?? []).map(h => h.position));
  return [0, 1, 2, 3, 4].filter(i => !hinted.has(i));
}

// M-11: hard mode — returns a violation message if the guess breaks a confirmed constraint,
// or null if the guess is valid. Rules:
//   • A letter confirmed CORRECT at position X must appear at position X in the new guess.
//   • A letter confirmed PRESENT (in-word but wrong position) must appear somewhere in the guess.
function checkHardModeViolation(pastGuesses: GuessEntry[], word: string): string | null {
  for (const g of pastGuesses) {
    for (let i = 0; i < g.result.length; i++) {
      if (g.result[i] === 'correct') {
        // Must reuse this letter at the same position
        if (word[i]?.toUpperCase() !== g.word[i]?.toUpperCase()) {
          return `Position ${i + 1} must be ${g.word[i].toUpperCase()} (hard mode)`;
        }
      } else if (g.result[i] === 'present') {
        // Must include the letter somewhere
        if (!word.toUpperCase().includes(g.word[i].toUpperCase())) {
          return `Guess must contain ${g.word[i].toUpperCase()} (hard mode)`;
        }
      }
    }
  }
  return null;
}

// Merges user-typed letters (for free positions) with hint letters into a full 5-letter word
function buildSubmittedWord(typedLetters: string, hintLetters: HintLetter[] | undefined): string {
  const hintMap: Record<number, string> = Object.fromEntries(
    (hintLetters ?? []).map(h => [h.position, h.letter])
  );
  const freePos = getFreePositions(hintLetters);
  return [0, 1, 2, 3, 4]
    .map(i => (i in hintMap ? hintMap[i] : typedLetters[freePos.indexOf(i)] ?? ''))
    .join('');
}

const GUEST_MAX_GUESSES = 3;
const guestStateKey = () => 'manna-guest-' + new Date().toISOString().slice(0, 10);

interface GuestState {
  guesses: GuessEntry[];
  status: 'in_progress' | 'solved' | 'failed';
  answer?: string;
  scripture_reference?: string;
}

function loadGuestState(): GuestState {
  try {
    const stored = localStorage.getItem(guestStateKey());
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { guesses: [], status: 'in_progress' };
}

function saveGuestState(state: GuestState) {
  try {
    localStorage.setItem(guestStateKey(), JSON.stringify(state));
  } catch { /* ignore */ }
}

function buildGuestGame(state: GuestState): MannaGameResponse {
  return {
    locked: false,
    game_id: 0,
    status: state.status,
    guess_count: state.guesses.length,
    max_guesses: GUEST_MAX_GUESSES,
    guesses: state.guesses,
    word_length: 5,
    is_free_play: true, // drives the guest banner and upgrade CTAs
    scripture_reference: '',
    scripture_clue: '',
    testament: '',
    hints_used: 0,
    answer: state.answer,
    scripture_text: undefined,
    connection_note: undefined,
  };
}

// ── HUD icon components ───────────────────────────────────────────────────────

const HelpCircleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/>
  </svg>
);

const BarChartIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const CalendarIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const HomeIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
);

const LightbulbIcon: React.FC = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5C17.4 10.7 18 9.4 18 8A6 6 0 0 0 6 8c0 1.4.6 2.7 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────

export const MannaPuzzle: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshStreak, subscription, streakData } = useStreak();
  const isPremium = subscription?.is_premium ?? false;
  // Guest mode: user is not logged in. State lives in localStorage; backend is stateless.
  const isGuestMode = !authLoading && !isAuthenticated;
  const isGuestModeRef = useRef(isGuestMode);
  useEffect(() => { isGuestModeRef.current = isGuestMode; }, [isGuestMode]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [locked, setLocked] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<YesterdayResult | null>(null);
  const [game, setGame] = useState<MannaGameResponse | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // Archive state
  const [archiveDate, setArchiveDate] = useState<string | null>(null); // "YYYY-MM-DD" or null for today
  const [showArchive, setShowArchive] = useState(false); // show archive browser

  // Tutorial — shown on first visit; re-openable via ? button
  const [showTutorial, setShowTutorial] = useState(false);
  const showTutorialRef = useRef(false);
  useEffect(() => { showTutorialRef.current = showTutorial; }, [showTutorial]);

  // Stats/history modal — opened via 📊 button
  const [showStats, setShowStats] = useState(false);

  // End-of-day modal — shown once after today's game is solved + verse read.
  // The effect below (not the solve handler) owns the trigger so that EOD fires
  // correctly regardless of whether the verse was read before or after solving.
  const [showEOD, setShowEOD] = useState(false);

  useEffect(() => {
    if (archiveDate) return;
    if (game?.status !== 'solved') return;
    if (isGuestMode) return; // guest users don't get the EOD modal
    const today = new Date().toISOString().slice(0, 10);
    if (sessionStorage.getItem(EOD_SESSION_KEY_PREFIX + today)) return;
    if (streakData?.last_active_date !== today) return;
    // Both conditions met: puzzle solved + verse read. Show after animations settle.
    const timer = setTimeout(() => setShowEOD(true), 3000);
    return () => clearTimeout(timer);
  }, [game?.status, isGuestMode, streakData?.last_active_date, archiveDate]);
  const showStatsRef = useRef(false);
  useEffect(() => { showStatsRef.current = showStats; }, [showStats]);

  // Letter entry pop — tracks which tile index just received a letter
  const [poppedTile, setPoppedTile] = useState<number | null>(null);

  // Win confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Current input: letters typed into free (non-hinted) positions only
  const [currentWord, setCurrentWord] = useState('');

  // M-22: merged to avoid one-frame glitch between two separate setState calls
  const [flipping, setFlipping] = useState<{ rowIdx: number; guess: GuessEntry } | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [winRow, setWinRow] = useState<number | null>(null);
  const [submittingUI, setSubmittingUI] = useState(false);

  // M-11: hard mode — snapshotted once when component mounts (i.e. when game loads).
  // Using a ref prevents mid-game toggling from retroactively applying hard-mode
  // constraints to guesses made before the toggle.
  const hardModeRef = useRef(localStorage.getItem('mannaHardMode') === 'true');
  const hardMode = () => hardModeRef.current;

  // M-13: fetch stats once when game ends to display streak in post-game panel
  const [postGameStreak, setPostGameStreak] = useState<number | null>(null);

  // M-14: blessings burst — number of blessings awarded (drives particle count)
  const [blessingsBurst, setBlessingsBurst] = useState<number | null>(null);

  // M-17: grid bloom cascade — applied after win flip completes
  const [bloomGrid, setBloomGrid] = useState(false);

  // M-10: aria-live announcement for screen readers
  const [announcement, setAnnouncement] = useState('');

  const submitting = useRef(false);
  const gameRef = useRef<MannaGameResponse | null>(null);
  const currentWordRef = useRef('');

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);

  // M-13: lazy-fetch Manna streak once when the game ends — shown in post-game panel.
  // Only premium users can fetch stats; archive games skip as well.
  useEffect(() => {
    if (!game || game.status === 'in_progress' || postGameStreak !== null) return;
    if (!isPremium || archiveDate) return;
    mannaApi.getStats()
      .then(s => setPostGameStreak(s.current_streak))
      .catch(() => {}); // non-critical — panel renders without streak on error
  }, [game?.status, isPremium, archiveDate]);

  // ─── Load today's game (or archive game) ──────────────────────────────────
  useEffect(() => {
    // Wait for auth to resolve before deciding which path to take.
    if (authLoading) return;

    let cancelled = false;

    // Guest path: load state from localStorage (no network call needed for setup).
    if (isGuestMode && !archiveDate) {
      const state = loadGuestState();
      setGame(buildGuestGame(state));
      if (!localStorage.getItem(MANNA_TUTORIAL_KEY)) {
        setShowTutorial(true);
      }
      setLoading(false);
      return () => { cancelled = true; };
    }

    const attemptFetch = () => {
      const fetchPromise = archiveDate
        ? mannaApi.getArchive(archiveDate)
        : mannaApi.getToday().then(resp => {
            if (resp.locked) {
              if (!cancelled) {
                setLocked(true);
                const lockedResp = resp as MannaLockedResponse;
                if (lockedResp.yesterday) setYesterdayData(lockedResp.yesterday);
              }
              return null;
            }
            return resp as MannaGameResponse;
          });

      return fetchPromise
        .then(gameResp => {
          if (cancelled) return;
          if (!gameResp) return; // locked path already handled
          setGame(gameResp);
          // Show confetti if already solved — once per session to avoid re-firing on reload
          if (gameResp.status === 'solved' && !archiveDate && !sessionStorage.getItem(CONFETTI_SESSION_KEY)) {
            setShowConfetti(true);
            sessionStorage.setItem(CONFETTI_SESSION_KEY, '1');
          }
          // Show tutorial on first ever visit (not seen before)
          if (!archiveDate && !localStorage.getItem(MANNA_TUTORIAL_KEY)) {
            setShowTutorial(true);
          }
        });
    };

    setLoading(true);
    setLoadError(false);

    // Attempt fetch — if it fails, wait 3 seconds and retry once automatically
    // before showing the error screen. Covers the backend restart window (~2–5s).
    attemptFetch()
      .catch(() => new Promise<void>(resolve => setTimeout(resolve, 3000)).then(attemptFetch))
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [archiveDate, fetchKey, isGuestMode, authLoading]);

  // ─── Hint handler ─────────────────────────────────────────────────────────
  const handleHint = useCallback(async () => {
    const g = gameRef.current;
    if (!g || hintLoading || g.status !== 'in_progress') return;
    if (g.hints_used >= 3) {
      toast(t('manna.hintMax', 'No hints remaining.'), { icon: '💡' });
      return;
    }

    setHintLoading(true);
    try {
      const result = await (archiveDate ? mannaApi.getArchiveHint(archiveDate) : mannaApi.getHint());
      setGame(prev => prev ? {
        ...prev,
        hints_used: result.hints_used,
        hint_letters: result.hint_letters,
      } : prev);
      // Clear current input — hinted positions may have shifted free slots
      setCurrentWord('');
      // Blessings were spent — refresh chip balance immediately
      refreshStreak().catch(() => {});
      const ref = gameRef.current?.scripture_reference;
      const refSuffix = ref ? ` · ${ref}` : '';
      toast.success(
        `${t('manna.hintRevealed', 'Position {{n}}: {{letter}}', {
          n: result.position + 1,
          letter: result.letter,
        })}${refSuffix}\n−15 ${t('blessings.label', 'Blessings')} · ${result.blessings_remaining} ${t('manna.hintBlessingsLeft', 'remaining')}`,
        { icon: '💡' }
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? '';
      if (err?.response?.status === 402) {
        toast.error(t('manna.hintNoBlessings', 'Not enough Blessings for a hint.'));
      } else if (msg.includes('complete')) {
        toast(t('manna.errorComplete', 'This game is already complete.'));
      } else if (msg.includes('remaining')) {
        toast(t('manna.hintMax', 'No hints remaining.'), { icon: '💡' });
      } else {
        toast.error(t('manna.hintError', 'Could not get hint. Try again.'));
      }
    } finally {
      setHintLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [archiveDate, hintLoading, t]);

  // ─── Submit guess ─────────────────────────────────────────────────────────
  const handleSubmitRef = useRef<(() => Promise<void>) | undefined>(undefined);
  handleSubmitRef.current = async () => {
    const game = gameRef.current;
    const typedLetters = currentWordRef.current;
    if (!game || submitting.current) return;

    const freePositions = getFreePositions(game.hint_letters);
    if (typedLetters.length !== freePositions.length) {
      const rowIdx = game.guesses.length;
      setShakeRow(rowIdx);
      setTimeout(() => setShakeRow(null), 400);
      SoundService.play('manna-invalid');
      // M-19: haptic feedback on invalid guess
      if (navigator.vibrate) navigator.vibrate(30);
      toast(t('manna.notEnoughLetters', 'Not enough letters'), { icon: '✏️' });
      return;
    }

    // Merge hint-locked letters with user-typed letters into the full submitted word
    const submittedWord = buildSubmittedWord(typedLetters, game.hint_letters);

    // M-11: hard mode validation — confirmed letters must appear in the next guess
    if (hardMode() && game.guesses.length > 0) {
      const violation = checkHardModeViolation(game.guesses, submittedWord);
      if (violation) {
        setShakeRow(game.guesses.length);
        setTimeout(() => setShakeRow(null), 400);
        SoundService.play('manna-invalid');
        if (navigator.vibrate) navigator.vibrate(30);
        toast(violation, { icon: '🔒' });
        return;
      }
    }

    submitting.current = true;
    setSubmittingUI(true);
    const rowIdx = game.guesses.length;

    try {
      let result;
      if (isGuestModeRef.current) {
        const isLastGuess = (game.guess_count + 1) >= GUEST_MAX_GUESSES;
        const guestResult = await mannaApi.submitGuestGuess(submittedWord, isLastGuess);
        const isSolved = guestResult.result.every(r => r === 'correct');
        const isFailed = !isSolved && isLastGuess;
        result = {
          result: guestResult.result,
          status: (isSolved ? 'solved' : isFailed ? 'failed' : 'in_progress') as 'solved' | 'failed' | 'in_progress',
          guess_count: game.guess_count + 1,
          answer: guestResult.answer,
          scripture_reference: guestResult.scripture_reference,
          scripture_text: undefined as string | undefined,
          blessings_awarded: undefined as number | undefined,
          streak_bonus: undefined as number | undefined,
          win_streak: undefined as number | undefined,
        };
      } else {
        result = await (archiveDate
          ? mannaApi.submitArchiveGuess(archiveDate, submittedWord)
          : mannaApi.submitGuess(submittedWord));
      }

      const newGuess: GuessEntry = { word: submittedWord, result: result.result };
      const updatedGuesses = [...game.guesses, newGuess];

      setFlipping({ rowIdx, guess: newGuess });
      setCurrentWord('');

      if (result.status === 'failed') {
        // M-15: on a failed final resolve, play a quiet descending arpeggio instead
        // of ascending per-tile tones — tonally congruent with losing.
        setTimeout(() => SoundService.play('manna-tile-fail-resolve'), 250);
      } else {
        newGuess.result.forEach((state, i) => {
          setTimeout(() => {
            const cue =
              state === 'correct' ? 'manna-tile-correct' :
              state === 'present' ? 'manna-tile-present' :
                                    'manna-tile-absent';
            SoundService.play(cue);
          }, i * 120 + 250);
        });
      }

      const flipDuration = (WORD_LENGTH - 1) * 120 + 500 + 100;
      setTimeout(() => {
        setFlipping(null);
        setGame(prev => {
          if (!prev) return prev;
          const updated: MannaGameResponse = {
            ...prev,
            guesses: updatedGuesses,
            status: result.status,
            guess_count: result.guess_count,
            answer: result.answer,
            scripture_text: result.scripture_text,
          };
          // Persist guest state to localStorage so it survives a page refresh.
          if (isGuestModeRef.current) {
            saveGuestState({
              guesses: updatedGuesses,
              status: result.status,
              answer: result.answer,
              scripture_reference: result.scripture_reference,
            });
          }
          return updated;
        });

        // M-10: announce guess result to screen readers
        const resultWords = newGuess.result.map(r =>
          r === 'correct'
            ? t('manna.ariaCorrect', 'correct')
            : r === 'present'
              ? t('manna.ariaPresent', 'present')
              : t('manna.ariaAbsent', 'absent')
        );
        setAnnouncement(
          `${submittedWord}: ${resultWords.join(', ')}.`
        );

        if (result.status === 'solved') {
          posthog.capture('manna_completed', {
            word: result.answer,
            attempts: (game?.guess_count ?? 0) + 1,
            solved: true,
            is_archive: !!archiveDate,
          });
          setWinRow(rowIdx);
          SoundService.play('manna-solve');
          // U-02: positive haptic on win — two pulses (uplifting pattern)
          if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
          // M-17: after bounce animation finishes (~1.4s total), bloom the full grid
          if (localStorage.getItem('celebrationAnimEnabled') !== 'false') {
            setTimeout(() => setBloomGrid(true), 1500);
          }
          setAnnouncement(t('manna.ariaSolved', 'Solved! The word was {{word}}.', { word: result.answer ?? '' }));
          // Trigger confetti once per session per game (archive games use a per-date key)
          setTimeout(() => {
            const confettiKey = archiveDate ? `manna-confetti-${archiveDate}` : CONFETTI_SESSION_KEY;
            if (!sessionStorage.getItem(confettiKey)) {
              setShowConfetti(true);
              sessionStorage.setItem(confettiKey, '1');
            }
          }, 650);
          if (result.blessings_awarded) {
            toast.success(
              t('manna.solved', '+{{n}} Blessings!', { n: result.blessings_awarded }),
              { icon: '✦' }
            );
            if (result.streak_bonus && result.win_streak) {
              setTimeout(() => {
                toast.success(
                  t('manna.streakBonus', '+{{bonus}} streak bonus! ({{streak}}-day solve streak 🔥)', {
                    bonus: result.streak_bonus,
                    streak: result.win_streak,
                  }),
                  { icon: '🔥', duration: 4000 }
                );
              }, 800);
            }
            // M-14: trigger blessings burst animation over post-game panel
            if (localStorage.getItem('celebrationAnimEnabled') !== 'false') {
              setBlessingsBurst(result.blessings_awarded);
              setTimeout(() => setBlessingsBurst(null), 1800);
            }
          }
          // G-02: refresh streak count in header so blessings and streak display update immediately
          refreshStreak().catch(() => {});
        } else if (result.status === 'failed') {
          posthog.capture('manna_completed', {
            word: result.answer,
            attempts: game?.max_guesses ?? 6,
            solved: false,
            is_archive: !!archiveDate,
          });
          SoundService.play('manna-fail');
          setAnnouncement(t('manna.ariaFailed', 'Game over. The word was {{word}}.', { word: result.answer ?? '' }));
          // G-02: refresh streak so blessings update after a failed game too
          refreshStreak().catch(() => {});
        }

        submitting.current = false;
        setSubmittingUI(false);
      }, flipDuration);
    } catch (err: any) {
      submitting.current = false;
      setSubmittingUI(false);
      const msg = err?.response?.data?.error ?? '';
      if (msg === 'not_a_word') {
        // M-01/M-05: word not in the biblical word bank — shake the row and keep input intact
        setShakeRow(rowIdx);
        setTimeout(() => setShakeRow(null), 400);
        SoundService.play('manna-invalid');
        if (navigator.vibrate) navigator.vibrate(30); // M-19
        toast(t('manna.notAWord', 'Not a recognized biblical word'), { icon: '📖' });
      } else if (msg.includes('5 letters')) {
        toast.error(t('manna.errorLength', 'Guesses must be exactly 5 letters.'));
      } else if (msg.includes('letters A')) {
        toast.error(t('manna.errorChars', 'Guesses must contain only letters A–Z.'));
      } else if (msg.includes('complete')) {
        toast(t('manna.errorComplete', 'This game is already complete.'));
      } else {
        toast.error(t('manna.errorSubmit', 'Failed to submit guess. Try again.'));
      }
    }
  };

  // hintLoading ref — lets handleKey (which is memoised) see the latest value
  const hintLoadingRef = useRef(false);
  useEffect(() => { hintLoadingRef.current = hintLoading; }, [hintLoading]);

  // ─── Keyboard handling ────────────────────────────────────────────────────
  const handleKey = useCallback((key: string) => {
    const game = gameRef.current;
    // Block game key input while any overlay is open or hint is loading
    if (showTutorialRef.current || showStatsRef.current) return;
    if (!game || game.status !== 'in_progress' || submitting.current || hintLoadingRef.current) return;

    if (key === '⌫' || key === 'Backspace') {
      setCurrentWord(w => w.slice(0, -1));
      return;
    }

    if (key === 'ENTER' || key === 'Enter') {
      handleSubmitRef.current?.();
      return;
    }

    if (/^[A-Za-z]$/.test(key)) {
      const freePos = getFreePositions(gameRef.current?.hint_letters);
      if (currentWordRef.current.length < freePos.length) {
        // The actual tile index that will receive this letter
        const tileIdx = freePos[currentWordRef.current.length];
        setCurrentWord(w => w + key.toUpperCase());
        // M-16 / physical keyboard sound: play manna-key only if the user has
        // opted into physical keyboard sounds (off by default — see MannaSettings).
        if (localStorage.getItem(PHYSICAL_KEY_SOUND_KEY) === 'true') {
          SoundService.play('manna-key');
        }
        setPoppedTile(tileIdx);
        setTimeout(() => setPoppedTile(null), 180);
      }
    }
  }, []);

  // Physical keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKey(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKey]);

  // ALL useMemo hooks must be before any conditional return — Rules of Hooks require
  // that hook call count never varies between renders. Use `game?.` null-safe access
  // and empty defaults when game is null (loading / locked states).
  const keyStates = useMemo(() => (game ? buildKeyStates(game.guesses) : {}), [game?.guesses]);

  const hintMap = useMemo<Record<number, string>>(
    () => Object.fromEntries((game?.hint_letters ?? []).map(h => [h.position, h.letter])),
    [game?.hint_letters]
  );
  const freePositions = useMemo(() => getFreePositions(game?.hint_letters), [game?.hint_letters]);
  // The tile index where the cursor (blinking caret) sits
  const cursorTileIdx = useMemo(() => {
    if (!game || game.status !== 'in_progress') return -1;
    return currentWord.length < freePositions.length ? freePositions[currentWord.length] : -1;
  }, [game?.status, currentWord, freePositions]);

  const rows = useMemo(() => {
    if (!game) return [] as { letters: string[]; states: TileState[]; flipping: boolean; win: boolean; shake: boolean }[];
    const gameIsOver = game.status !== 'in_progress';
    const result: { letters: string[]; states: TileState[]; flipping: boolean; win: boolean; shake: boolean }[] = [];
    for (let r = 0; r < (game?.max_guesses ?? 6); r++) {
      if (r < game.guesses.length) {
        const g = game.guesses[r];
        result.push({
          letters: g.word.split(''),
          states: g.result.map(x => x as TileState),
          flipping: false,
          win: winRow === r,
          shake: false,
        });
      } else if (flipping && flipping.rowIdx === r) {
        result.push({
          letters: flipping.guess.word.split(''),
          states: flipping.guess.result.map(x => x as TileState),
          flipping: true,
          win: false,
          shake: false,
        });
      } else if (r === game.guesses.length && !gameIsOver) {
        // Active row: merge hint letters and user-typed letters
        const letters = Array.from({ length: WORD_LENGTH }, (_, i) => {
          if (i in hintMap) return hintMap[i];
          const freeIdx = freePositions.indexOf(i);
          return currentWord[freeIdx] ?? '';
        });
        const states: TileState[] = letters.map((l, i) => {
          if (i in hintMap) return 'hint';
          return l ? 'active' : 'empty';
        });
        result.push({
          letters,
          states,
          flipping: false,
          win: false,
          shake: shakeRow === r,
        });
      } else {
        result.push({
          letters: Array(WORD_LENGTH).fill(''),
          states: Array(WORD_LENGTH).fill('empty') as TileState[],
          flipping: false,
          win: false,
          shake: false,
        });
      }
    }
    return result;
  }, [game, flipping, winRow, shakeRow, hintMap, freePositions, currentWord]);

  // ─── Conditional returns (must come after all hooks) ─────────────────────
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--candle-amber)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (locked) return <MannaLockedCard yesterday={yesterdayData} />;

  // Archive browser overlay
  if (showArchive) {
    return (
      <MannaArchive
        onSelectDate={(d) => { setArchiveDate(d); setShowArchive(false); setGame(null); setLoading(true); }}
        onClose={() => setShowArchive(false)}
      />
    );
  }

  if (loadError || !game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-5xl" aria-hidden>🌾</div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('manna.errorLoading', "Failed to load today's puzzle.")}
        </p>
        <button
          onClick={() => { setGame(null); setLocked(false); setLoadError(false); setFetchKey(k => k + 1); }}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }
  const isOver = game.status !== 'in_progress';
  const isSolved = game.status === 'solved';
  // isFreePlay is true for guest (unauthenticated) games; false for all signed-in users.
  const isFreePlay = game.is_free_play ?? false;
  const hintsLeft = 3 - (game.hints_used ?? 0);

  const activeRow = isOver ? -1 : game.guesses.length;

  return (
    <div className="manna-scene flex flex-col items-center gap-2 pt-1 pb-5 px-4 max-w-sm mx-auto">
      {/* Tutorial overlay — shown on first visit or when ? is tapped */}
      {showTutorial && (
        <MannaHowToPlay onDismiss={() => setShowTutorial(false)} />
      )}

      {/* Stats & History modal — opened via 📊 button */}
      {showStats && (
        <MannaStatsModal onDismiss={() => setShowStats(false)} />
      )}

      {/* End-of-day modal — fires after today's solve once verse is also read */}
      {showEOD && (
        <EndOfDayModal
          streak={streakData!.current_streak}
          onDismiss={() => {
            setShowEOD(false);
            sessionStorage.setItem(
              EOD_SESSION_KEY_PREFIX + new Date().toISOString().slice(0, 10),
              '1',
            );
          }}
        />
      )}

      {/* M-10: visually hidden aria-live region — screen readers announce guess results */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <Motes />

      {/* ── HUD Header ── */}
      <div className="manna-hud-header w-full flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center gap-2">
          {/* M-18: SVG wheat icon — consistent rendering across all OS/browsers */}
          <WheatIcon />
          <h1 className="manna-title-glow text-xl font-display font-bold leading-none" style={{ color: 'var(--blessing-gold)' }}>
            {t('manna.title', 'Manna')}
          </h1>
          {archiveDate && (
            <span className="text-xs font-medium" style={{ color: 'color-mix(in srgb, var(--foreground) 45%, transparent)' }}>
              {new Date(archiveDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Archive back navigation — icon buttons */}
          {archiveDate && (
            <>
              <button
                className="manna-action-btn"
                onClick={() => { setArchiveDate(null); setGame(null); setLoading(true); }}
                aria-label={t('manna.backToToday', 'Back to Today')}
                title={t('manna.backToToday', 'Back to Today')}
              >
                <HomeIcon />
              </button>
              <button
                className="manna-action-btn"
                onClick={() => setShowArchive(true)}
                aria-label={t('manna.backToArchive', 'Archive')}
                title={t('manna.backToArchive', 'Archive')}
              >
                <CalendarIcon />
              </button>
            </>
          )}
          {/* Hint button — premium only, during active game */}
          {isPremium && !isOver && (
            <button
              className="manna-hint-btn"
              onClick={handleHint}
              disabled={hintLoading || hintsLeft === 0}
              aria-label={
                hintsLeft === 0
                  ? t('manna.hintMax', 'No hints remaining.')
                  : t('manna.hintAriaLabel', 'Use a hint ({{n}} left, costs 15 Blessings)', { n: hintsLeft })
              }
              title={
                hintsLeft === 0
                  ? t('manna.hintMax', 'No hints remaining.')
                  : t('manna.hintAriaLabel', 'Use a hint ({{n}} left, costs 15 Blessings)', { n: hintsLeft })
              }
              style={{ padding: '0.2rem 0.5rem', gap: '0.25rem', fontSize: '0.72rem' }}
            >
              {hintLoading
                ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                : hintsLeft === 0
                  ? <>{t('manna.noHints', 'No hints')}</>
                  : <><LightbulbIcon /> {hintsLeft}</>
              }
            </button>
          )}
          {/* Guess counter — HUD display */}
          <span className="manna-guess-counter">
            {game.guess_count}<span style={{ opacity: 0.4 }}>/</span>{game.max_guesses}
          </span>
        </div>
      </div>

      {/* ── Guest banner — shown when not signed in ── */}
      {isFreePlay && (
        <div
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-muted)', position: 'relative', zIndex: 1 }}
        >
          <span style={{ color: 'var(--text-primary)' }}>
            <span className="font-semibold">{t('manna.guestBanner', 'Guest')}</span>
            {' · '}
            <span className="opacity-70">{t('manna.guestBannerDetail', '3 guesses · Sign up free for scripture clues & more')}</span>
          </span>
          <button
            className="manna-hint-btn shrink-0"
            onClick={() => navigate('/signup')}
            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
          >
            {t('manna.guestSignUpCta', 'Sign Up Free')}
          </button>
        </div>
      )}

      {/* ── Scripture clue — premium only ── */}
      {!isFreePlay && (
        <ScriptureClue
          testament={game.testament}
          reference={game.scripture_reference}
          clue={game.scripture_clue}
          t={t}
        />
      )}

      {/* ── Ornament divider ── */}
      <div className="manna-ornament">
        <span className="manna-ornament-star" aria-hidden>✦ ✦ ✦</span>
      </div>

      {/* ── Hint strip ── */}
      {(game.hint_letters?.length ?? 0) > 0 && (
        <HintStrip hintLetters={game.hint_letters!} t={t} />
      )}

      {/* ── Tile grid ── */}
      <div className="manna-grid-wrap" style={{ position: 'relative', zIndex: 1 }}>
        {/* Confetti burst on win */}
        {showConfetti && <Confetti />}

        <div
          className={`flex flex-col items-center gap-1.5 ${bloomGrid ? 'manna-grid--blooming' : ''}`}
          role="grid"
          aria-label={t('manna.grid', 'Puzzle grid')}
        >
          {rows.map((row, r) => (
            <div
              key={r}
              className={`flex gap-1.5 ${row.shake ? 'manna-row--shake' : ''} ${row.win ? 'manna-row--win' : ''}`}
              role="row"
              style={{ '--row-idx': r } as React.CSSProperties}
            >
              {row.letters.map((letter, i) => {
                const isActivePop = r === activeRow && i === poppedTile && !isOver && flipping === null;
                return (
                  <MannaTile
                    key={i}
                    letter={letter}
                    state={row.states[i]}
                    flipping={row.flipping}
                    index={i}
                    popped={isActivePop}
                    cursor={
                      !isOver &&
                      r === activeRow &&
                      flipping === null &&
                      i === cursorTileIdx
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom action bar — secondary game controls ── */}
      <div className="manna-action-bar w-full" style={{ position: 'relative', zIndex: 1 }}>
        <button
          className="manna-action-btn"
          onClick={() => setShowTutorial(true)}
          aria-label={t('manna.tutorialHelpBtn', 'How to play')}
          title={t('manna.tutorialHelpBtn', 'How to play')}
        >
          <HelpCircleIcon />
        </button>
        {isPremium && (
          <button
            className={`manna-action-btn${archiveDate ? ' hidden sm:flex' : ''}`}
            onClick={() => setShowStats(true)}
            aria-label={t('manna.statsModalLabel', 'Stats & History')}
            title={t('manna.statsModalLabel', 'Stats & History')}
          >
            <BarChartIcon />
          </button>
        )}
        {isPremium && !archiveDate && (
          <button
            className="manna-action-btn"
            onClick={() => setShowArchive(true)}
            aria-label={t('manna.archiveLabel', 'Archive')}
            title={t('manna.archiveLabel', 'Archive')}
          >
            <CalendarIcon />
          </button>
        )}
      </div>

      {/* ── Post-game panel OR keyboard ── */}
      {isOver ? (
        <div className={`manna-result-panel w-full ${isSolved ? 'manna-result-panel--solved' : ''}`}
             style={{ position: 'relative', zIndex: 1 }}>
          {/* M-14: Blessings burst animation */}
          {blessingsBurst !== null && <BlessingsBurst />}
          {isSolved ? (
            <p className="text-base font-semibold" style={{ color: 'var(--blessing-gold)' }}>
              ✦ {archiveDate
                ? t('manna.solvedArchiveTitle', 'You solved it!')
                : t('manna.solvedTitle', "You solved today's Manna!")}
            </p>
          ) : (
            <p className="manna-muted text-base font-semibold">
              {archiveDate
                ? t('manna.failedArchiveTitle', 'The word was:')
                : t('manna.failedTitle', "Today's word was:")}
            </p>
          )}

          {game.answer && (
            <p className="manna-title-glow text-3xl font-display font-bold tracking-widest mt-1" style={{ color: 'var(--blessing-gold)' }}>
              {game.answer}
            </p>
          )}

          {!isFreePlay && game.scripture_text && (
            <blockquote className="manna-scripture">
              <p>{game.scripture_text}</p>
              <cite className="not-italic font-semibold text-xs mt-1 block" style={{ color: 'var(--blessing-gold)' }}>
                — {game.scripture_reference}
              </cite>
            </blockquote>
          )}

          {!isFreePlay && game.connection_note && (
            <div
              className="w-full mt-2 px-3 py-2.5 rounded-xl text-left"
              style={{
                background: 'color-mix(in srgb, var(--candle-amber) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--candle-amber) 30%, transparent)',
              }}
            >
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--candle-amber)' }}>
                💡 {t('manna.connectionTitle', 'Why this word?')}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
                {game.connection_note}
              </p>
            </div>
          )}

          {/* Post-game CTA for guest users — invite them to sign up for the full game */}
          {isFreePlay && (
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="manna-muted text-xs text-center">
                {t('manna.guestPostGame', 'Sign up free to play with 6 guesses, see the full scripture, and more.')}
              </p>
              <button
                className="manna-hint-btn"
                onClick={() => navigate('/signup')}
                style={{ fontSize: '0.75rem' }}
              >
                {t('manna.guestSignUpCta', 'Create Free Account')}
              </button>
            </div>
          )}

          <ShareResult
            guesses={game.guesses}
            solved={isSolved}
            maxGuesses={game.max_guesses}
            answer={game.answer}
            scriptureReference={game.scripture_reference}
            t={t}
          />

          {/* M-13: Manna streak — appears once stats have loaded (premium only) */}
          {isPremium && postGameStreak !== null && postGameStreak > 0 && (
            <p className="manna-streak-badge">
              🔥 {t('manna.streak', '{{n}}-day Manna streak', { n: postGameStreak })}
            </p>
          )}

          {!isFreePlay && !archiveDate && (
            <p className="manna-muted text-xs mt-3">
              {t('manna.comeback', 'Come back tomorrow for a new word.')}
            </p>
          )}
          {!isFreePlay && !archiveDate && <MannaCountdown t={t} />}
          {isFreePlay && !archiveDate && (
            <p className="manna-muted text-xs mt-3">
              {t('manna.guestComeback', 'A new puzzle every day — sign up to play the full game.')}
            </p>
          )}
        </div>
      ) : (
        <div className="manna-keyboard" style={{ position: 'relative', zIndex: 1 }}>
          <MannaKeyboard keyStates={keyStates} onKey={handleKey} disabled={isOver || hintLoading} loading={submittingUI} />
        </div>
      )}
    </div>
  );
};

// ─── Scripture clue panel ─────────────────────────────────────────────────────

interface ScriptureClueProps {
  testament: string;
  reference: string;
  clue: string;
  t: TFunction;
}

const ScriptureClue: React.FC<ScriptureClueProps> = ({ testament, reference, clue, t }) => (
  <div className="manna-scripture-clue w-full" style={{ position: 'relative', zIndex: 1 }}>
    <div className="flex items-center gap-2 mb-1.5">
      <span className="manna-testament-badge">
        {testament}
      </span>
      <span className="manna-muted text-xs font-medium">{reference}</span>
    </div>
    <p className="manna-clue-text">
      <span className="opacity-60 text-xs">{t('manna.clueIntro', 'Find the missing word:')}</span>{' '}
      <span className="manna-clue-verse">{clue}</span>
    </p>
  </div>
);

// ─── Hint strip ───────────────────────────────────────────────────────────────

interface HintStripProps {
  hintLetters: HintLetter[];
  t: TFunction;
}

const HintStrip: React.FC<HintStripProps> = ({ hintLetters, t }) => {
  const positions = Array.from({ length: WORD_LENGTH }, (_, i) => {
    const hint = hintLetters.find(h => h.position === i);
    return hint ? hint.letter : null;
  });

  return (
    <div className="manna-hint-strip" style={{ position: 'relative', zIndex: 1 }}>
      <span className="manna-muted text-xs mr-2">{t('manna.hintsRevealed', 'Revealed:')}</span>
      <div className="flex gap-1">
        {positions.map((letter, i) => (
          <div key={i} className={`manna-hint-tile ${letter ? 'manna-hint-tile--revealed' : ''}`}>
            {letter ?? '·'}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Confetti burst ───────────────────────────────────────────────────────────

// Golden confetti pieces with varied shapes, colors, and trajectories
const CONFETTI_PIECES = [
  { x: -90, w: 8,  h: 5,  color: 'var(--blessing-gold)',  delay: 0.00, dur: 1.10, spin:  400, drift: -30 },
  { x: -60, w: 5,  h: 9,  color: 'var(--candle-amber)',   delay: 0.05, dur: 1.25, spin:  -580, drift: 20 },
  { x: -40, w: 7,  h: 7,  color: 'var(--blessing-gold)',  delay: 0.08, dur: 0.95, spin:  320, drift: -15 },
  { x: -20, w: 5,  h: 5,  color: '#fff',                   delay: 0.12, dur: 1.30, spin: -440, drift:  5  },
  { x:   0, w: 9,  h: 5,  color: 'var(--blessing-gold)',  delay: 0.02, dur: 1.15, spin:  500, drift: -40 },
  { x:  20, w: 5,  h: 8,  color: 'var(--candle-amber)',   delay: 0.10, dur: 1.00, spin: -360, drift:  25 },
  { x:  40, w: 6,  h: 6,  color: '#fff',                   delay: 0.04, dur: 1.20, spin:  280, drift:  10 },
  { x:  60, w: 8,  h: 4,  color: 'var(--blessing-gold)',  delay: 0.15, dur: 1.05, spin: -520, drift: -20 },
  { x:  85, w: 5,  h: 7,  color: 'var(--candle-amber)',   delay: 0.07, dur: 1.35, spin:  460, drift:  35 },
  { x: -75, w: 6,  h: 6,  color: 'var(--candle-amber)',   delay: 0.18, dur: 0.90, spin: -300, drift: -10 },
  { x:  10, w: 10, h: 4,  color: 'var(--blessing-gold)',  delay: 0.03, dur: 1.40, spin:  620, drift: -25 },
  { x: -50, w: 4,  h: 10, color: '#fff',                   delay: 0.20, dur: 1.10, spin: -480, drift:  15 },
  { x:  50, w: 7,  h: 5,  color: 'var(--blessing-gold)',  delay: 0.11, dur: 1.25, spin:  350, drift:  30 },
  { x: -10, w: 5,  h: 8,  color: 'var(--candle-amber)',   delay: 0.16, dur: 0.85, spin: -560, drift: -35 },
  { x:  70, w: 6,  h: 6,  color: 'var(--blessing-gold)',  delay: 0.09, dur: 1.15, spin:  410, drift:  20 },
  { x: -80, w: 8,  h: 5,  color: '#fff',                   delay: 0.22, dur: 1.30, spin: -390, drift: -5  },
  { x:  30, w: 5,  h: 9,  color: 'var(--candle-amber)',   delay: 0.14, dur: 1.00, spin:  540, drift:  40 },
  { x: -30, w: 9,  h: 4,  color: 'var(--blessing-gold)',  delay: 0.06, dur: 1.20, spin: -420, drift: -18 },
  { x:  80, w: 4,  h: 8,  color: 'var(--candle-amber)',   delay: 0.17, dur: 0.95, spin:  370, drift: -28 },
  { x: -55, w: 7,  h: 6,  color: '#fff',                   delay: 0.13, dur: 1.45, spin: -640, drift:  12 },
];

const Confetti: React.FC = () => (
  <div className="manna-confetti-wrap" aria-hidden="true">
    {CONFETTI_PIECES.map((p, i) => (
      <div
        key={i}
        className="manna-confetti-piece"
        style={{
          left: p.x,
          width: p.w,
          height: p.h,
          background: p.color,
          opacity: 0.92,
          borderRadius: p.w === p.h ? '50%' : '2px',
          '--delay': `${p.delay}s`,
          '--duration': `${p.dur}s`,
          '--spin': `${p.spin}deg`,
          '--drift': `${p.drift}px`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

// ─── Blessings burst (M-14) ───────────────────────────────────────────────────

// Gold sparkle particles radiate outward from the centre of the post-game panel
// when Blessings are awarded. Gated on celebrationAnimEnabled !== 'false'.
const BURST_PARTICLES = [
  { angle:   0, dist: 55 }, { angle:  45, dist: 65 }, { angle:  90, dist: 50 },
  { angle: 135, dist: 60 }, { angle: 180, dist: 55 }, { angle: 225, dist: 65 },
  { angle: 270, dist: 50 }, { angle: 315, dist: 60 },
  { angle:  22, dist: 80 }, { angle:  67, dist: 75 }, { angle: 112, dist: 85 },
  { angle: 157, dist: 70 }, { angle: 202, dist: 80 }, { angle: 247, dist: 75 },
  { angle: 292, dist: 85 }, { angle: 337, dist: 70 },
];

const BlessingsBurst: React.FC = () => (
  <div className="manna-blessings-burst" aria-hidden="true">
    {BURST_PARTICLES.map((p, i) => {
      const rad = (p.angle * Math.PI) / 180;
      const tx = Math.cos(rad) * p.dist;
      const ty = Math.sin(rad) * p.dist;
      return (
        <span
          key={i}
          className="manna-blessings-particle"
          style={{
            '--tx': `${tx}px`,
            '--ty': `${ty}px`,
            animationDelay: `${(i % 4) * 0.05}s`,
          } as React.CSSProperties}
        >
          ✦
        </span>
      );
    })}
  </div>
);

// ─── Floating light motes ─────────────────────────────────────────────────────

const MOTE_CONFIG = [
  { left: '12%',  bottom: '15%', size: 3, duration: '6s',   delay: '0s'   },
  { left: '28%',  bottom: '8%',  size: 4, duration: '8s',   delay: '1.5s' },
  { left: '50%',  bottom: '20%', size: 3, duration: '7s',   delay: '0.8s' },
  { left: '68%',  bottom: '10%', size: 5, duration: '9s',   delay: '2.2s' },
  { left: '82%',  bottom: '18%', size: 3, duration: '6.5s', delay: '3.0s' },
  { left: '42%',  bottom: '5%',  size: 4, duration: '7.5s', delay: '4.0s' },
];

const Motes: React.FC = React.memo(() => (
  <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
    {MOTE_CONFIG.map((m, i) => (
      <span
        key={i}
        className="manna-mote"
        style={{
          left: m.left,
          bottom: m.bottom,
          width: m.size,
          height: m.size,
          animationDuration: m.duration,
          animationDelay: m.delay,
        }}
      />
    ))}
  </div>
));

// ─── Next-puzzle countdown (M-08) ────────────────────────────────────────────

function getSecondsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  ));
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

const MannaCountdown: React.FC<{ t: TFunction }> = ({ t }) => {
  const [secs, setSecs] = React.useState(getSecondsUntilMidnightUTC);

  React.useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      setSecs(getSecondsUntilMidnightUTC()); // re-sync after tab was hidden
      id = setInterval(() => setSecs(getSecondsUntilMidnightUTC()), 1000);
    };
    const stop = () => {
      if (id !== null) { clearInterval(id); id = null; }
    };

    const onVisibility = () => {
      document.hidden ? stop() : start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <p className="manna-muted text-xs mt-2">
      {t('manna.nextPuzzle', 'Next word in')}
      {' '}
      <span className="manna-countdown tabular-nums font-semibold" aria-live="off">
        {formatCountdown(secs)}
      </span>
    </p>
  );
};

// ─── Wheat SVG icon (M-18) ────────────────────────────────────────────────────
//
// Replaces the 🌾 emoji — renders identically across all OS and browsers.
// Styled using CSS variables so it inherits the active theme's blessing-gold.

export const WheatIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: 'drop-shadow(0 0 8px color-mix(in srgb, var(--blessing-gold) 55%, transparent))',
      flexShrink: 0,
    }}
  >
    {/* Central stalk */}
    <line x1="20" y1="36" x2="20" y2="6" stroke="var(--blessing-gold)" strokeWidth="2" strokeLinecap="round"/>
    {/* Grain heads — left side (4 grains, stepping upward) */}
    <ellipse cx="14" cy="28" rx="5" ry="2.8" fill="var(--blessing-gold)" transform="rotate(-30 14 28)"/>
    <ellipse cx="13" cy="22" rx="5" ry="2.8" fill="var(--blessing-gold)" transform="rotate(-28 13 22)"/>
    <ellipse cx="13" cy="16" rx="4.5" ry="2.5" fill="var(--blessing-gold)" transform="rotate(-25 13 16)"/>
    <ellipse cx="14" cy="11" rx="4" ry="2.2" fill="var(--blessing-gold)" transform="rotate(-22 14 11)"/>
    {/* Grain heads — right side */}
    <ellipse cx="26" cy="28" rx="5" ry="2.8" fill="var(--blessing-gold)" transform="rotate(30 26 28)"/>
    <ellipse cx="27" cy="22" rx="5" ry="2.8" fill="var(--blessing-gold)" transform="rotate(28 27 22)"/>
    <ellipse cx="27" cy="16" rx="4.5" ry="2.5" fill="var(--blessing-gold)" transform="rotate(25 27 16)"/>
    <ellipse cx="26" cy="11" rx="4" ry="2.2" fill="var(--blessing-gold)" transform="rotate(22 26 11)"/>
    {/* Top grain */}
    <ellipse cx="20" cy="7" rx="3.5" ry="2" fill="var(--blessing-gold)"/>
  </svg>
);

// ─── Share result helper ──────────────────────────────────────────────────────

const EMOJI: Record<string, string> = {
  correct: '🟨', // gold — matches the game's blessing-gold correct tile
  present: '🟦', // teal/blue — matches the challenge-accent present tile
  absent: '⬛',  // dark — matches the dimmed absent tile
};

interface ShareResultProps {
  guesses: GuessEntry[];
  solved: boolean;
  maxGuesses: number;
  answer?: string | null;
  scriptureReference?: string;
  t: TFunction;
}

const ShareResult: React.FC<ShareResultProps> = ({ guesses, solved, maxGuesses, answer, scriptureReference, t }) => {
  const handleShare = () => {
    const grid = guesses
      .map(g => g.result.map(r => EMOJI[r] ?? '⬛').join(''))
      .join('\n');
    const answerLine = answer ? `\nWord: ${answer}` : '';
    const refLine = scriptureReference ? `\n📖 ${scriptureReference}` : '';
    const text = `Manna — Words of Praise\n${solved ? guesses.length : 'X'}/${maxGuesses}${answerLine}${refLine}\n\n${grid}`;

    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(
        () => toast.success(t('manna.copied', 'Result copied!')),
        () => toast.error(t('manna.copyFailed', 'Could not copy.'))
      );
    }
  };

  return (
    <button
      onClick={handleShare}
      className="mt-3 w-full py-2 rounded-lg text-sm font-semibold border transition-colors"
      style={{
        borderColor: 'var(--candle-amber)',
        color: 'var(--candle-amber)',
      }}
    >
      {t('manna.share', 'Share result')}
    </button>
  );
};
