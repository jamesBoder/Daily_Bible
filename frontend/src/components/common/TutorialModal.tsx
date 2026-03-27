import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
}

interface TutorialModalProps {
  /** Emoji or icon element shown in the header */
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  steps: TutorialStep[];
  ctaLabel?: string;
  /** Hint shown at bottom reminding user how to re-open */
  reopenHint?: string;
  onDismiss: () => void;
  'aria-label'?: string;
}

/**
 * Generic, accessible tutorial modal used across all features.
 * - Focus-trapped while open
 * - Escape key and backdrop click dismiss
 * - localStorage marking is handled by the caller (via useTutorial)
 */
export const TutorialModal: React.FC<TutorialModalProps> = ({
  icon,
  title,
  subtitle,
  steps,
  ctaLabel,
  reopenHint,
  onDismiss,
  'aria-label': ariaLabel,
}) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  // Focus trap + Escape key
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onDismiss(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };

    panel.addEventListener('keydown', onKeyDown);
    first?.focus();
    return () => panel.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Decorative top accent */}
        <div className="flex-shrink-0 h-1 w-full bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400" />

        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={onDismiss}
          aria-label={t('common.close', 'Close')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Non-scrolling header */}
        <div className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
          <div className="flex flex-col items-center text-center">
            <div className="text-4xl mb-3" aria-hidden>{icon}</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-display">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
              {t('tutorial.howItWorks', 'How it works')}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        {/* Scrollable steps only */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 min-h-0">
          <div className="space-y-4 py-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-lg" aria-hidden>
                  {step.emoji}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Non-scrolling footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-3">
          <button
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            onClick={onDismiss}
          >
            {ctaLabel ?? t('tutorial.gotIt', 'Got it!')}
          </button>
          {reopenHint && (
            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">
              {reopenHint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
