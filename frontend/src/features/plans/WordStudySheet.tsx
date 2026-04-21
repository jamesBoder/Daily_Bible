import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from '@phosphor-icons/react';
import type { WordStudy } from '../../services/api/plans';

interface WordStudySheetProps {
  word: string;
  study: WordStudy;
  onClose: () => void;
}

const WordStudySheet: React.FC<WordStudySheetProps> = ({ word, study, onClose }) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-amber-300/30 dark:border-amber-700/20 max-h-[60vh] overflow-y-auto animate-slide-up"
        style={{ background: 'var(--header-bg)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('plan.wordStudy.sheetLabel', 'Word study: {{word}}', { word })}
      >
        {/* Drag handle + close button */}
        <div className="flex items-center justify-between pt-3 pb-1 px-4">
          <div className="w-6" aria-hidden="true" />{/* spacer */}
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        <div className="px-5 pb-6 pt-3">
          {/* English word */}
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 capitalize">
            {word}
          </p>

          {/* Original language word — large, styled */}
          <p
            className="text-3xl leading-tight mb-1"
            style={{ fontFamily: 'serif', color: 'var(--candle-amber)' }}
          >
            {study.original}
          </p>

          {/* Transliteration */}
          <p className="text-sm italic text-gray-400 dark:text-gray-500 mb-5">
            {study.transliteration}
          </p>

          {/* Definition */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">
              {t('plan.wordStudy.definition', 'Meaning')}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {study.definition}
            </p>
          </div>

          {/* Cross-references */}
          {(study.refs?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
                {t('plan.wordStudy.alsoIn', 'Also in')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(study.refs ?? []).map(ref => (
                  <span
                    key={ref}
                    className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'color-mix(in srgb, var(--candle-amber) 10%, transparent)',
                      color: 'var(--candle-amber)',
                    }}
                  >
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WordStudySheet;
