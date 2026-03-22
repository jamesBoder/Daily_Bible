import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { mannaApi, GuessEntry, HintLetter, MannaGameResponse, MannaLockedResponse, YesterdayResult } from '../../services/api/manna';
import { SoundService } from '../../services/SoundService';
import { MannaLockedCard } from './MannaLockedCard';
import { MannaTile, TileState } from './MannaTile';
import { MannaKeyboard } from './MannaKeyboard';
import './manna.css';

const MAX_GUESSES = 6;
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

export const MannaPuzzle: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [yesterdayData, setYesterdayData] = useState<YesterdayResult | null>(null);
  const [game, setGame] = useState<MannaGameResponse | null>(null);
  const [hintLoading, setHintLoading] = useState(false);

  // Letter entry pop — tracks which tile index just received a letter
  const [poppedTile, setPoppedTile] = useState<number | null>(null);

  // Win confetti
  const [showConfetti, setShowConfetti] = useState(false);

  // Current input: letters typed into free (non-hinted) positions only
  const [currentWord, setCurrentWord] = useState('');

  const [pendingGuess, setPendingGuess] = useState<GuessEntry | null>(null);
  const [flippingRow, setFlippingRow] = useState<number | null>(null);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [winRow, setWinRow] = useState<number | null>(null);
  const [submittingUI, setSubmittingUI] = useState(false);

  const submitting = useRef(false);
  const gameRef = useRef<MannaGameResponse | null>(null);
  const currentWordRef = useRef('');

  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);

  // ─── Load today's game ────────────────────────────────────────────────────
  useEffect(() => {
    mannaApi
      .getToday()
      .then(resp => {
        if (resp.locked) {
          setLocked(true);
          const lockedResp = resp as MannaLockedResponse;
          if (lockedResp.yesterday) setYesterdayData(lockedResp.yesterday);
        } else {
          const gameResp = resp as MannaGameResponse;
          setGame(gameResp);
          // Show confetti if already solved — once per session to avoid re-firing on reload
          if (gameResp.status === 'solved' && !sessionStorage.getItem(CONFETTI_SESSION_KEY)) {
            setShowConfetti(true);
            sessionStorage.setItem(CONFETTI_SESSION_KEY, '1');
          }
        }
      })
      .catch(() => toast.error(t('manna.errorLoading', 'Failed to load today\'s puzzle.')))
      .finally(() => setLoading(false));
  }, [t]);

  // ─── Hint handler ─────────────────────────────────────────────────────────
  const handleHint = async () => {
    const g = gameRef.current;
    if (!g || hintLoading || g.status !== 'in_progress') return;
    if (g.hints_used >= 3) {
      toast(t('manna.hintMax', 'No hints remaining.'), { icon: '💡' });
      return;
    }

    setHintLoading(true);
    try {
      const result = await mannaApi.getHint();
      setGame(prev => prev ? {
        ...prev,
        hints_used: result.hints_used,
        hint_letters: result.hint_letters,
      } : prev);
      // Clear current input — hinted positions may have shifted free slots
      setCurrentWord('');
      toast.success(
        t('manna.hintRevealed', 'Position {{n}}: {{letter}}', {
          n: result.position + 1,
          letter: result.letter,
        }),
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
  };

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
      toast(t('manna.notEnoughLetters', 'Not enough letters'), { icon: '✏️' });
      return;
    }

    // Merge hint-locked letters with user-typed letters into the full submitted word
    const submittedWord = buildSubmittedWord(typedLetters, game.hint_letters);

    submitting.current = true;
    setSubmittingUI(true);
    const rowIdx = game.guesses.length;

    try {
      const result = await mannaApi.submitGuess(submittedWord);

      const newGuess: GuessEntry = { word: submittedWord, result: result.result };
      const updatedGuesses = [...game.guesses, newGuess];

      setPendingGuess(newGuess);
      setFlippingRow(rowIdx);
      setCurrentWord('');

      newGuess.result.forEach((state, i) => {
        setTimeout(() => {
          const cue =
            state === 'correct' ? 'manna-tile-correct' :
            state === 'present' ? 'manna-tile-present' :
                                  'manna-tile-absent';
          SoundService.play(cue);
        }, i * 120 + 250);
      });

      const flipDuration = (WORD_LENGTH - 1) * 120 + 500 + 100;
      setTimeout(() => {
        setFlippingRow(null);
        setPendingGuess(null);
        setGame(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            guesses: updatedGuesses,
            status: result.status,
            guess_count: result.guess_count,
            answer: result.answer,
            scripture_text: result.scripture_text,
          };
        });

        if (result.status === 'solved') {
          setWinRow(rowIdx);
          SoundService.play('manna-solve');
          // Trigger confetti once per session
          setTimeout(() => {
            if (!sessionStorage.getItem(CONFETTI_SESSION_KEY)) {
              setShowConfetti(true);
              sessionStorage.setItem(CONFETTI_SESSION_KEY, '1');
            }
          }, 650);
          if (result.blessings_awarded) {
            toast.success(
              t('manna.solved', '+{{n}} Blessings!', { n: result.blessings_awarded }),
              { icon: '✦' }
            );
          }
        } else if (result.status === 'failed') {
          SoundService.play('manna-fail');
        }

        submitting.current = false;
        setSubmittingUI(false);
      }, flipDuration);
    } catch (err: any) {
      submitting.current = false;
      setSubmittingUI(false);
      const msg = err?.response?.data?.error ?? '';
      if (msg.includes('5 letters')) {
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

  // ─── Keyboard handling ────────────────────────────────────────────────────
  const handleKey = useCallback((key: string) => {
    const game = gameRef.current;
    if (!game || game.status !== 'in_progress' || submitting.current) return;

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
        SoundService.play('manna-key');
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

  // ─── Derived state ────────────────────────────────────────────────────────
  if (loading) {
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
  if (!game) return null;

  const keyStates = buildKeyStates(game.guesses);
  const isOver = game.status !== 'in_progress';
  const isSolved = game.status === 'solved';
  const hintsLeft = 3 - (game.hints_used ?? 0);

  // Hint map for active row rendering
  const hintMap: Record<number, string> = Object.fromEntries(
    (game.hint_letters ?? []).map(h => [h.position, h.letter])
  );
  const freePositions = getFreePositions(game.hint_letters);
  // The tile index where the cursor (blinking caret) sits
  const cursorTileIdx = !isOver && currentWord.length < freePositions.length
    ? freePositions[currentWord.length]
    : -1;

  const rows: { letters: string[]; states: TileState[]; flipping: boolean; win: boolean; shake: boolean }[] = [];

  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < game.guesses.length) {
      const g = game.guesses[r];
      rows.push({
        letters: g.word.split(''),
        states: g.result.map(x => x as TileState),
        flipping: false,
        win: winRow === r,
        shake: false,
      });
    } else if (r === game.guesses.length && flippingRow === r && pendingGuess) {
      rows.push({
        letters: pendingGuess.word.split(''),
        states: pendingGuess.result.map(x => x as TileState),
        flipping: true,
        win: false,
        shake: false,
      });
    } else if (r === game.guesses.length && !isOver) {
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
      rows.push({
        letters,
        states,
        flipping: false,
        win: false,
        shake: shakeRow === r,
      });
    } else {
      rows.push({
        letters: Array(WORD_LENGTH).fill(''),
        states: Array(WORD_LENGTH).fill('empty') as TileState[],
        flipping: false,
        win: false,
        shake: false,
      });
    }
  }

  const activeRow = isOver ? -1 : game.guesses.length;

  return (
    <div className="manna-scene flex flex-col items-center gap-3 py-5 px-4 max-w-sm mx-auto">
      <Motes />

      {/* ── Header ── */}
      <div className="w-full flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex items-center gap-2.5">
          <span
            className="text-3xl"
            aria-hidden
            style={{ filter: `drop-shadow(0 0 8px color-mix(in srgb, var(--blessing-gold) 55%, transparent))` }}
          >
            🌾
          </span>
          <div>
            <h1 className="manna-title-glow text-xl font-display font-bold leading-tight" style={{ color: 'var(--blessing-gold)' }}>
              {t('manna.title', 'Manna')}
            </h1>
            <p className="manna-muted text-xs leading-tight">
              {t('manna.subtitle', 'A daily Biblical word puzzle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {!isOver && (
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
            >
              {hintLoading
                ? <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                : hintsLeft === 0
                  ? <>{t('manna.noHints', 'No hints')}</>
                  : <>💡 {hintsLeft}</>
              }
            </button>
          )}
          <span className="manna-muted text-xs tabular-nums font-semibold">
            {game.guess_count}<span className="opacity-40">/</span>{MAX_GUESSES}
          </span>
        </div>
      </div>

      {/* ── Scripture clue ── */}
      <ScriptureClue
        testament={game.testament}
        reference={game.scripture_reference}
        clue={game.scripture_clue}
        t={t}
      />

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
          className="flex flex-col items-center gap-1.5"
          role="grid"
          aria-label={t('manna.grid', 'Puzzle grid')}
        >
          {rows.map((row, r) => (
            <div
              key={r}
              className={`flex gap-1.5 ${row.shake ? 'manna-row--shake' : ''} ${row.win ? 'manna-row--win' : ''}`}
              role="row"
            >
              {row.letters.map((letter, i) => {
                const isActivePop = r === activeRow && i === poppedTile && !isOver && flippingRow === null;
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
                      flippingRow === null &&
                      i === cursorTileIdx
                    }
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Post-game panel OR keyboard ── */}
      {isOver ? (
        <div className={`manna-result-panel w-full ${isSolved ? 'manna-result-panel--solved' : ''}`}
             style={{ position: 'relative', zIndex: 1 }}>
          {isSolved ? (
            <p className="text-base font-semibold" style={{ color: 'var(--blessing-gold)' }}>
              ✦ {t('manna.solvedTitle', "You solved today's Manna!")}
            </p>
          ) : (
            <p className="manna-muted text-base font-semibold">
              {t('manna.failedTitle', "Today's word was:")}
            </p>
          )}

          {game.answer && (
            <p className="manna-title-glow text-3xl font-display font-bold tracking-widest mt-1" style={{ color: 'var(--blessing-gold)' }}>
              {game.answer}
            </p>
          )}

          {game.scripture_text && (
            <blockquote className="manna-scripture">
              <p>{game.scripture_text}</p>
              <cite className="not-italic font-semibold text-xs mt-1 block" style={{ color: 'var(--blessing-gold)' }}>
                — {game.scripture_reference}
              </cite>
            </blockquote>
          )}

          <ShareResult guesses={game.guesses} solved={isSolved} t={t} />

          <p className="manna-muted text-xs mt-3">
            {t('manna.comeback', 'Come back tomorrow for a new word.')}
          </p>
        </div>
      ) : (
        <div className="manna-keyboard" style={{ position: 'relative', zIndex: 1 }}>
          <MannaKeyboard keyStates={keyStates} onKey={handleKey} disabled={isOver} loading={submittingUI} />
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

// ─── Floating light motes ─────────────────────────────────────────────────────

const MOTE_CONFIG = [
  { left: '12%',  bottom: '15%', size: 3, duration: '6s',   delay: '0s'   },
  { left: '28%',  bottom: '8%',  size: 4, duration: '8s',   delay: '1.5s' },
  { left: '50%',  bottom: '20%', size: 3, duration: '7s',   delay: '0.8s' },
  { left: '68%',  bottom: '10%', size: 5, duration: '9s',   delay: '2.2s' },
  { left: '82%',  bottom: '18%', size: 3, duration: '6.5s', delay: '3.0s' },
  { left: '42%',  bottom: '5%',  size: 4, duration: '7.5s', delay: '4.0s' },
];

const Motes: React.FC = () => (
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
);

// ─── Share result helper ──────────────────────────────────────────────────────

const EMOJI: Record<string, string> = {
  correct: '🟨',
  present: '🟧',
  absent: '⬜',
};

interface ShareResultProps {
  guesses: GuessEntry[];
  solved: boolean;
  t: TFunction;
}

const ShareResult: React.FC<ShareResultProps> = ({ guesses, solved, t }) => {
  const handleShare = () => {
    const grid = guesses
      .map(g => g.result.map(r => EMOJI[r] ?? '⬜').join(''))
      .join('\n');
    const text = `Manna — Words of Praise\n${solved ? guesses.length : 'X'}/${MAX_GUESSES}\n\n${grid}`;

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
