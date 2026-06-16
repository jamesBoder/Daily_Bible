import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from '@phosphor-icons/react';

interface BlessingsBurstItem {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

// Global queue management — lets any component fire a burst without prop drilling.
let burstQueue: BlessingsBurstItem[] = [];
let addBurstCallback: ((burst: BlessingsBurstItem) => void) | null = null;

// Export function to trigger a blessings burst from anywhere in the app.
export const showBlessingsToast = (amount: number, reason: string) => {
  if (!amount || amount <= 0) return;

  const newBurst: BlessingsBurstItem = {
    id: `${Date.now()}-${Math.random()}`,
    amount,
    reason,
    timestamp: Date.now(),
  };

  // De-dupe identical bursts fired within 5s (e.g. double-tap / re-render).
  const isDuplicate = burstQueue.some(
    (b) => b.reason === reason && b.amount === amount && Date.now() - b.timestamp < 5000
  );
  if (isDuplicate) return;

  // Cap concurrent bursts so the center of the screen never floods.
  if (burstQueue.length >= 3) {
    burstQueue.shift();
  }
  burstQueue.push(newBurst);

  if (navigator.vibrate) navigator.vibrate(30);

  if (addBurstCallback) {
    addBurstCallback(newBurst);
  }
};

// Total visible lifetime — must outlast the CSS blessingBurstIn animation (2.4s).
const BURST_LIFETIME = 2500;

// Sparkle particles radiating from the icon. Pre-computed so they don't shift
// between renders. Each has a drift vector and a stagger delay.
const SPARKLES = [
  { x: -34, y: -28, delay: 0 },
  { x: 36, y: -22, delay: 0.08 },
  { x: -28, y: 26, delay: 0.16 },
  { x: 30, y: 30, delay: 0.12 },
  { x: 0, y: -40, delay: 0.04 },
  { x: 44, y: 6, delay: 0.2 },
  { x: -46, y: 2, delay: 0.18 },
];

const BlessingsToast: React.FC = () => {
  const { t } = useTranslation();
  const [bursts, setBursts] = useState<BlessingsBurstItem[]>([]);

  const removeBurst = useCallback((id: string) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
    burstQueue = burstQueue.filter((b) => b.id !== id);
  }, []);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();

    addBurstCallback = (burst: BlessingsBurstItem) => {
      setBursts((prev) => [...prev, burst]);
      const timer = setTimeout(() => {
        removeBurst(burst.id);
        timers.delete(timer);
      }, BURST_LIFETIME);
      timers.add(timer);
    };

    return () => {
      addBurstCallback = null;
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [removeBurst]);

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'daily_view':
        return t('blessings.earned.daily_view', 'Daily verse viewed');
      case 'reflection_written':
        return t('blessings.earned.reflection', 'Reflection added');
      case 'verse_favorited':
        return t('blessings.earned.favorite', 'Verse favorited');
      case 'verse_shared':
        return t('blessings.earned.shared', 'Verse shared');
      case 'journal_entry_written':
        return t('blessings.earned.journal', 'Journal entry written');
      case 'milestone_achieved':
        return t('blessings.earned.milestone', 'Milestone achieved');
      case 'manna_solved':
        return t('blessings.earned.manna_solved', 'Manna puzzle solved');
      case 'manna_played':
        return t('blessings.earned.manna_played', 'Manna puzzle played');
      case 'manna_streak_bonus':
        return t('blessings.earned.manna_streak_bonus', 'Manna streak bonus');
      case 'discipline_complete':
        return t('blessings.earned.discipline_complete', 'Discipline completed');
      default:
        return t('blessings.earned.generic', 'Blessings earned');
    }
  };

  if (bursts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex flex-col items-center
                 justify-center gap-3 px-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={t('blessings.label', 'Blessings')}
    >
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="animate-blessing-burst flex flex-col items-center will-change-transform"
        >
          {/* Icon + amount card with radiating sparkles */}
          <div className="relative flex items-center justify-center">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="animate-blessing-sparkle absolute h-1.5 w-1.5 rounded-full
                           bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                style={
                  {
                    '--spark-x': `${s.x}px`,
                    '--spark-y': `${s.y}px`,
                    animationDelay: `${s.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}

            <div
              className="flex items-center gap-2.5 rounded-2xl px-6 py-3.5
                         bg-gradient-to-br from-amber-300 to-yellow-500
                         shadow-[0_10px_44px_rgba(251,191,36,0.55)]
                         ring-1 ring-white/50"
            >
              <Star
                size={34}
                weight="fill"
                className="animate-blessing-glow text-white drop-shadow"
              />
              <span className="text-4xl font-extrabold tabular-nums text-white drop-shadow-sm">
                +{burst.amount}
              </span>
            </div>
          </div>

          {/* Label pill — translucent backdrop reads cleanly on any theme/verse art */}
          <div
            className="mt-2.5 flex flex-col items-center gap-0.5 rounded-full
                       bg-black/55 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="text-sm font-bold uppercase tracking-wide text-amber-200">
              {t('blessings.label', 'Blessings')}
            </span>
            <span className="text-xs font-medium text-white/85">
              {getReasonText(burst.reason)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlessingsToast;
