import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { WordStudy } from '../../services/api/plans';
import { SoundService } from '../../services/SoundService';

interface PassageBlockProps {
  verseRef: string;
  verseText: string;
  wordStudiesJson?: string;
  onWordTap: (word: string, study: WordStudy) => void;
}

const PassageBlock: React.FC<PassageBlockProps> = ({ verseRef, verseText, wordStudiesJson, onWordTap }) => {
  const { t } = useTranslation();

  const studies: Record<string, WordStudy> = useMemo(() => {
    if (!wordStudiesJson) return {};
    try { return JSON.parse(wordStudiesJson); } catch { return {}; }
  }, [wordStudiesJson]);

  const hasStudies = Object.keys(studies).length > 0;

  // Split into alternating whitespace / word tokens, preserving all spacing.
  const tokens = useMemo(() => verseText.split(/(\s+)/), [verseText]);

  return (
    <div
      className="rounded-2xl px-5 py-4 mb-6"
      style={{ background: 'color-mix(in srgb, var(--candle-amber) 6%, transparent)', borderLeft: '3px solid var(--candle-amber)' }}
    >
      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 uppercase tracking-wide">
        {verseRef}
      </p>

      <p className="text-base font-serif leading-loose text-[var(--foreground)]">
        {hasStudies
          ? tokens.map((tok, i) => {
              // Whitespace-only tokens: render as-is
              if (/^\s+$/.test(tok)) return <React.Fragment key={i}>{tok}</React.Fragment>;

              const clean = tok.toLowerCase().replace(/[^a-z]/g, '');
              const study = clean ? studies[clean] : undefined;

              return study ? (
                <span
                  key={i}
                  className="cursor-pointer border-b-2 border-dotted border-amber-400 dark:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-sm px-0.5 py-0.5 -my-0.5 transition-colors inline-block"
                  onClick={() => { SoundService.play('word-tap'); onWordTap(clean, study); }}
                >
                  {tok}
                </span>
              ) : (
                <React.Fragment key={i}>{tok}</React.Fragment>
              );
            })
          : verseText}
      </p>

      {hasStudies && (
        <p className="text-xs text-amber-500 dark:text-amber-400 mt-3 italic">
          {t('plan.wordStudy.tapHint', 'Tap underlined words to explore the original language')}
        </p>
      )}
    </div>
  );
};

export default PassageBlock;
