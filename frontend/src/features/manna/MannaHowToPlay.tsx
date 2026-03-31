import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WheatIcon } from './MannaPuzzle';
import './manna.css';

/** localStorage key — once set, the tutorial won't auto-show on mount */
export const MANNA_TUTORIAL_KEY = 'mannaSeenTutorial';

interface MannaHowToPlayProps {
  onDismiss: () => void;
}

export const MannaHowToPlay: React.FC<MannaHowToPlayProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const totalPages = 2;

  // Mark as seen and call the parent dismiss callback
  const handleDismiss = () => {
    localStorage.setItem(MANNA_TUTORIAL_KEY, '1');
    onDismiss();
  };

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(p => p + 1);
    } else {
      handleDismiss();
    }
  };

  // Dismiss on backdrop click (not on the panel itself)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleDismiss();
  };

  // Trap focus within the panel while open
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    panel.addEventListener('keydown', onKeyDown);
    first?.focus();
    return () => panel.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div
      className="manna-tutorial-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={t('manna.howToPlay', 'How to Play')}
    >
      <div className="manna-tutorial-panel" ref={panelRef}>

        {/* Close button */}
        <button
          className="manna-tutorial-close"
          onClick={handleDismiss}
          aria-label={t('common.close', 'Close')}
        >
          ✕
        </button>

        {/* Header — compact */}
        <div className="manna-tutorial-header">
          <span className="manna-tutorial-icon" aria-hidden><WheatIcon size={28} /></span>
          <h2 className="manna-tutorial-title">
            {t('manna.howToPlayTitle', 'How to Play')}
          </h2>
        </div>

        {/* Page 0: Color key */}
        {page === 0 && (
          <>
            <p className="manna-tutorial-intro" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
              {t('manna.tutorialIntro', 'Guess the 5-letter Biblical word in 6 tries.')}
            </p>

            <p className="manna-tutorial-section-label" style={{ marginBottom: '0.6rem' }}>
              {t('manna.tutorialColorKeyTitle', 'After each guess, tiles reveal how close you were:')}
            </p>

            <div className="manna-tutorial-demos">
              {/* CORRECT */}
              <div className="manna-tutorial-demo">
                <div
                  className="manna-tile manna-tile--correct manna-tutorial-demo-tile"
                  aria-label={t('manna.tutorialCorrectLabel', 'Correct tile: G')}
                >
                  G
                </div>
                <p className="manna-tutorial-demo-label manna-tutorial-demo-label--correct">
                  {t('manna.tutorialCorrectLabel', 'Right letter,\nright position')}
                </p>
              </div>

              {/* PRESENT */}
              <div className="manna-tutorial-demo">
                <div
                  className="manna-tile manna-tile--present manna-tutorial-demo-tile"
                  aria-label={t('manna.tutorialPresentLabel', 'Present tile: R')}
                >
                  R
                </div>
                <p className="manna-tutorial-demo-label manna-tutorial-demo-label--present">
                  {t('manna.tutorialPresentLabel', 'Right letter,\nwrong position')}
                </p>
              </div>

              {/* ABSENT */}
              <div className="manna-tutorial-demo">
                <div
                  className="manna-tile manna-tile--absent manna-tutorial-demo-tile"
                  aria-label={t('manna.tutorialAbsentLabel', 'Absent tile: L')}
                >
                  L
                </div>
                <p className="manna-tutorial-demo-label manna-tutorial-demo-label--absent">
                  {t('manna.tutorialAbsentLabel', 'Not in\nthe word')}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Page 1: Tips + begin */}
        {page === 1 && (
          <div className="manna-tutorial-tips" style={{ marginBottom: '0.75rem' }}>
            <div className="manna-tutorial-tip">
              <span aria-hidden>📖</span>
              <p>{t('manna.tutorialClue', 'Each puzzle shows a Bible verse — find the missing word that fills the blank.')}</p>
            </div>
            <div className="manna-tutorial-tip">
              <span aria-hidden>💡</span>
              <p>{t('manna.tutorialHints', 'Hints reveal a letter position (costs 15 Blessings ✦). Up to 3 per puzzle.')}</p>
            </div>
          </div>
        )}

        {/* Pagination dots */}
        <div className="flex justify-center gap-1.5 mb-3" aria-hidden>
          {Array.from({ length: totalPages }).map((_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                borderRadius: '999px',
                height: '6px',
                width: i === page ? '16px' : '6px',
                background: i === page ? 'var(--blessing-gold)' : 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button className="manna-cta-btn manna-tutorial-cta" onClick={handleNext}>
          {page < totalPages - 1
            ? t('tutorial.next', 'Next')
            : t('manna.tutorialBegin', 'Begin Playing')}
        </button>

        <p className="manna-tutorial-reopen-hint">
          {t('manna.tutorialReopenHint', 'Tap ? anytime to review these rules.')}
        </p>
      </div>
    </div>
  );
};
