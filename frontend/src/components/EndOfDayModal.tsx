import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from '@phosphor-icons/react';

interface EndOfDayModalProps {
  /** The user's current streak (today's count). Tomorrow will be +1. */
  streak: number;
  onDismiss: () => void;
}

/**
 * End-of-day celebration modal — shown after the user completes both daily
 * activities (verse read + Manna solved). Provides an emotional close to the
 * day and previews tomorrow's streak count to reinforce the habit loop.
 *
 * Trigger: MannaPuzzle fires this 3s after today's (non-free-play) solve,
 * once the backend confirms the verse was also read today (last_active_date).
 * Dismissal is session-scoped — sessionStorage key set by the caller.
 */
const EndOfDayModal: React.FC<EndOfDayModalProps> = ({ streak, onDismiss }) => {
  const { t } = useTranslation();

  // ESC to dismiss
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const tomorrowStreak = streak + 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onDismiss}
      />

      {/* Modal — pt-16 clears the h-14 sticky header; max-h accounts for bottom nav */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm animate-slide-from-top max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl">
          <div className="bg-[var(--theme-surface)] shadow-2xl overflow-hidden border border-amber-200/60 dark:border-amber-700/40 rounded-3xl">
            <div className="p-6 sm:p-7 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/20">

              {/* Dismiss button */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={onDismiss}
                  aria-label={t('common.dismiss', 'Dismiss')}
                  className="p-1.5 rounded-full text-[var(--journal-text-muted)] hover:opacity-100 hover:bg-[var(--theme-surface)] transition-colors"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              {/* Icon + title */}
              <div className="text-center mb-5">
                <div className="text-5xl mb-3" role="img" aria-label="candle">🕯️</div>
                <h2 className="text-xl font-bold text-[var(--foreground)] leading-tight">
                  {t('endOfDay.title', "You're done for today")}
                </h2>
                <p className="mt-2 text-sm text-[var(--journal-text-muted)] leading-relaxed">
                  {t('endOfDay.body', 'Come back tomorrow — a new verse and a new puzzle await.')}
                </p>
              </div>

              {/* Tomorrow's streak preview */}
              <div className="flex items-center justify-center gap-3 py-4 px-5 mb-5 rounded-2xl bg-amber-100/70 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-700/40">
                <span className="text-2xl" role="img" aria-label="fire">🔥</span>
                <div className="text-center">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                    {t('endOfDay.streakLabel', 'Tomorrow')}
                  </p>
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {t('endOfDay.streakValue', 'Day {{streak}}', { streak: tomorrowStreak })}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={onDismiss}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
                autoFocus={window.matchMedia('(hover: hover)').matches}
              >
                {t('endOfDay.cta', 'See you tomorrow')}
              </button>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EndOfDayModal;
