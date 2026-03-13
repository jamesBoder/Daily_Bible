import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../../contexts/StreakContext';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const MilestoneCelebrationModal: React.FC = () => {
  const { t } = useTranslation();
  const { streakData, dismissMilestone } = useStreak();

  // Session-level deduplication: even if dismissMilestone API call fails, the modal
  // will not reappear in the same session.
  const [sessionDismissed, setSessionDismissed] = useState<Set<string>>(
    () => new Set(JSON.parse(sessionStorage.getItem('dismissedMilestones') || '[]'))
  );

  const milestone = streakData?.newly_achieved_milestone ?? null;
  const shouldShow = milestone !== null && !sessionDismissed.has(milestone.key);

  // Animation steps: each step becomes visible after the previous delay.
  const [step, setStep] = useState(0);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // On open: save previous focus, advance animation steps.
  useEffect(() => {
    if (!shouldShow) {
      setStep(0);
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;

    if (prefersReducedMotion) {
      setStep(5); // skip straight to fully revealed
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    // step 1: badge silhouette visible (0ms)
    setStep(1);
    // step 2: amber reveal (500ms)
    timers.push(setTimeout(() => setStep(2), 500));
    // step 3: badge full color + glow (1800ms)
    timers.push(setTimeout(() => setStep(3), 1800));
    // step 4: milestone name fades in (2300ms)
    timers.push(setTimeout(() => setStep(4), 2300));
    // step 5: blessings amount + Continue button (2800ms)
    timers.push(setTimeout(() => setStep(5), 2800));

    return () => timers.forEach(clearTimeout);
  }, [shouldShow, prefersReducedMotion]);

  // Move focus to Continue button once it appears.
  useEffect(() => {
    if (step >= 5 && continueButtonRef.current) {
      continueButtonRef.current.focus();
    }
  }, [step]);

  // Restore focus to previous element on close.
  const handleDismiss = useCallback(async () => {
    if (!milestone) return;
    const key = milestone.key;

    // Session-deduplicate immediately — modal closes now regardless of API result.
    const updated = new Set(Array.from(sessionDismissed).concat(key));
    setSessionDismissed(updated);
    sessionStorage.setItem('dismissedMilestones', JSON.stringify(Array.from(updated)));

    // Restore focus before async work.
    previousFocusRef.current?.focus();

    // Context handles the API call + streak refresh. Do NOT call api.post separately.
    await dismissMilestone(key);
  }, [milestone, sessionDismissed, dismissMilestone]);

  // ESC to dismiss.
  useEffect(() => {
    if (!shouldShow) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shouldShow, handleDismiss]);

  // Focus trap: keep Tab/Shift+Tab inside the modal.
  const modalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!shouldShow) return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [shouldShow]);

  // 14 ember particles — memoized so they don't re-randomize on re-render.
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 80,
        y: -(Math.random() * 100 + 60),
        size: Math.random() * 4 + 4,
        delay: Math.random() * 1.2,
        duration: Math.random() * 1 + 2,
      })),
    []
  );

  if (!shouldShow || !milestone) return null;

  const badgeBrightness = step >= 3 ? 1 : step >= 2 ? 0.6 : 0.15;
  const badgeGlow = step >= 3 ? '0 0 24px 6px var(--milestone-glow)' : 'none';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="milestone-title"
        ref={modalRef}
      >
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border border-amber-200/50 dark:border-amber-700/30 animate-slide-from-top">

          {/* Badge area */}
          <div className="relative flex items-center justify-center mb-6">
            {/* Ember particles — transform/opacity only, no top/left */}
            {!prefersReducedMotion && step >= 3 && particles.map(p => (
              <span
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  background: 'var(--candle-amber)',
                  opacity: 0,
                  animation: `particleDrift ${p.duration}s ease-out ${p.delay}s forwards`,
                  '--particle-x': `${p.x}px`,
                  '--particle-y': `${p.y}px`,
                } as React.CSSProperties}
              />
            ))}

            {/* Badge circle */}
            <div
              className="milestone-badge milestone-badge--earned w-24 h-24 flex items-center justify-center text-5xl"
              style={{
                filter: `brightness(${badgeBrightness})`,
                boxShadow: badgeGlow,
                transition: 'filter 0.6s ease, box-shadow 0.6s ease',
              }}
            >
              {getBadgeEmoji(milestone.key)}
            </div>
          </div>

          {/* Milestone name */}
          <div
            style={{
              opacity: step >= 4 ? 1 : 0,
              transition: prefersReducedMotion ? 'none' : 'opacity 0.5s ease',
            }}
          >
            <h2
              id="milestone-title"
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
            >
              {t(`milestone.${milestone.key}.name`, milestone.name)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('milestone.achieved_label', 'Milestone Achieved')}
            </p>
          </div>

          {/* Blessings amount + Continue button */}
          <div
            style={{
              opacity: step >= 5 ? 1 : 0,
              transition: prefersReducedMotion ? 'none' : 'opacity 0.5s ease',
            }}
          >
            <p
              className="text-lg font-semibold mb-6"
              style={{ color: 'var(--blessing-gold)' }}
            >
              ✦ +{milestone.blessings_awarded} {t('milestone.blessings_label', 'Blessings')}
            </p>

            <button
              ref={continueButtonRef}
              onClick={handleDismiss}
              className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-500
                         hover:from-amber-600 hover:to-yellow-600
                         text-white font-semibold rounded-2xl
                         transition-all duration-200 hover:scale-[1.02]
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                         min-h-[44px] shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
            >
              {t('milestone.continue', 'Continue')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/** Placeholder emoji per milestone key. Replaced by commissioned artwork in Phase 2+. */
function getBadgeEmoji(key: string): string {
  const map: Record<string, string> = {
    first_steps:    '👣',
    week_in_word:   '📖',
    rooted:         '🌳',
    month_of_grace: '🕊️',
    steadfast:      '⚓',
    three_month:    '🙏',
    half_year:      '⌛',
    nine_months:    '🌿',
    full_year:      '👑',
  };
  return map[key] ?? '✦';
}

export default MilestoneCelebrationModal;
