import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from '@phosphor-icons/react';
import { SoundService } from '../../services/SoundService';

interface MemoryVerseFlashcardProps {
  verseRef: string;
  verseText: string;
  /** Called after any rating or skip — parent should close and advance. */
  onDone: () => void;
}

type FlashStep = 'recall' | 'preview' | 'full';

const PREVIEW_WORD_COUNT = 8;

const MemoryVerseFlashcard: React.FC<MemoryVerseFlashcardProps> = ({ verseRef, verseText, onDone }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<FlashStep>('recall');

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const words = verseText.split(/\s+/);
  const hasPreview = words.length > PREVIEW_WORD_COUNT;
  const previewText = hasPreview
    ? words.slice(0, PREVIEW_WORD_COUNT).join(' ') + '…'
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onDone}
    >
      <div
        className="w-full max-w-sm bg-[var(--theme-surface)] rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 w-full" style={{ background: 'var(--blessing-gold)' }} />

        <div className="px-5 pt-4" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          {/* Header row */}
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
            <p className="text-xs font-semibold uppercase tracking-wider flex-1" style={{ color: 'var(--blessing-gold)' }}>
              {t('plan.flashcard.title', 'Memory Verse')}
            </p>
            <button
              onClick={onDone}
              className="text-xs text-[var(--journal-text-muted)] hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {t('plan.flashcard.skip', 'Skip')}
            </button>
          </div>

          {/* Verse reference — always visible */}
          <p className="text-sm font-semibold text-[var(--journal-text-muted)] mb-4 tracking-wide">
            {verseRef}
          </p>

          {/* Content area: min-height prevents the card from jumping in size between steps */}
          <div className="min-h-[140px]">

          {/* Step: recall — blank card */}
          {step === 'recall' && (
            <button
              onClick={() => { SoundService.play('card-flip'); setStep(hasPreview ? 'preview' : 'full'); }}
              className="w-full rounded-2xl px-5 py-8 text-center mb-4 active:scale-[0.98] transition-transform"
              style={{ background: 'color-mix(in srgb, var(--blessing-gold) 8%, transparent)' }}
            >
              <p className="text-sm text-[var(--journal-text-muted)] mb-3">
                {t('plan.flashcard.recallPrompt', 'Can you recall this verse?')}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--blessing-gold)' }}>
                {hasPreview
                  ? t('plan.flashcard.tapForHint', 'Tap for a hint')
                  : t('plan.flashcard.tapForFull', 'Tap to reveal the full verse')
                } →
              </p>
            </button>
          )}

          {/* Step: preview — first N words (only when verse is long enough) */}
          {step === 'preview' && previewText && (
            <button
              onClick={() => { SoundService.play('card-flip'); setStep('full'); }}
              className="w-full rounded-2xl px-5 py-5 text-left mb-4 active:scale-[0.98] transition-transform"
              style={{ background: 'color-mix(in srgb, var(--blessing-gold) 8%, transparent)' }}
            >
              <p className="text-base font-serif leading-relaxed text-[var(--journal-text-muted)] mb-3">
                &ldquo;{previewText}&rdquo;
              </p>
              <p className="text-xs font-semibold text-right" style={{ color: 'var(--blessing-gold)' }}>
                {t('plan.flashcard.tapForFull', 'Tap to reveal the full verse')} →
              </p>
            </button>
          )}

          {/* Step: full — verse + rating */}
          {step === 'full' && (
            <>
              <div
                className="rounded-2xl px-5 py-4 mb-5"
                style={{ background: 'color-mix(in srgb, var(--blessing-gold) 8%, transparent)' }}
              >
                <p className="text-base font-serif leading-loose text-[var(--foreground)]">
                  &ldquo;{verseText}&rdquo;
                </p>
              </div>

              <p className="text-sm font-semibold text-center text-[var(--journal-text-muted)] mb-3">
                {t('plan.flashcard.ratePrompt', 'How well did you know it?')}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => { SoundService.play('quiz-correct'); onDone(); }}
                  className="py-2.5 rounded-xl text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 active:scale-95 transition-transform"
                >
                  {t('plan.flashcard.knew', 'Knew it')}
                </button>
                <button
                  onClick={() => { SoundService.play('card-flip'); onDone(); }}
                  className="py-2.5 rounded-xl text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 active:scale-95 transition-transform"
                >
                  {t('plan.flashcard.almost', 'Almost')}
                </button>
                <button
                  onClick={() => { SoundService.play('quiz-wrong'); onDone(); }}
                  className="py-2.5 rounded-xl text-xs font-semibold bg-[var(--theme-surface)] text-[var(--journal-text-muted)] active:scale-95 transition-transform"
                >
                  {t('plan.flashcard.notYet', 'Not yet')}
                </button>
              </div>
            </>
          )}

          </div>{/* end min-height wrapper */}
        </div>
      </div>
    </div>
  );
};

export default MemoryVerseFlashcard;
