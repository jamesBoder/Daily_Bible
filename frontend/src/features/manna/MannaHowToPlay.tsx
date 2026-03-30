import React, { useEffect, useRef } from 'react';
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

  // Mark as seen and call the parent dismiss callback
  const handleDismiss = () => {
    localStorage.setItem(MANNA_TUTORIAL_KEY, '1');
    onDismiss();
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
  }, []);

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

        {/* Header */}
        <div className="manna-tutorial-header">
          <span className="manna-tutorial-icon" aria-hidden><WheatIcon size={36} /></span>
          <h2 className="manna-tutorial-title">
            {t('manna.howToPlayTitle', 'How to Play')}
          </h2>
        </div>

        <p className="manna-tutorial-intro">
          {t('manna.tutorialIntro', 'Guess the 5-letter Biblical word in 6 tries.')}
        </p>
        <p className="manna-tutorial-sub">
          {t('manna.tutorialSub', 'Each guess must be a recognized Biblical word.')}
        </p>

        {/* ── Tile color key ── */}
        <div className="manna-tutorial-color-key">
          <p className="manna-tutorial-section-label">
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
        </div>

        {/* ── Ornament divider ── */}
        <div className="manna-ornament manna-tutorial-ornament" aria-hidden>
          <span className="manna-ornament-star">✦ ✦ ✦</span>
        </div>

        {/* ── Tips ── */}
        <div className="manna-tutorial-tips">
          <div className="manna-tutorial-tip">
            <span aria-hidden>📖</span>
            <p>{t('manna.tutorialClue', 'Each puzzle shows a Bible verse — find the missing word that fills the blank.')}</p>
          </div>
          <div className="manna-tutorial-tip">
            <span aria-hidden>💡</span>
            <p>{t('manna.tutorialHints', 'Hints reveal a letter position (costs 15 Blessings ✦). Up to 3 per puzzle.')}</p>
          </div>
        </div>

        {/* ── CTA ── */}
        <button className="manna-cta-btn manna-tutorial-cta" onClick={handleDismiss}>
          {t('manna.tutorialBegin', 'Begin Playing')}
        </button>

        <p className="manna-tutorial-reopen-hint">
          {t('manna.tutorialReopenHint', 'Tap ? anytime to review these rules.')}
        </p>

      </div>
    </div>
  );
};
