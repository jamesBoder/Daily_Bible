import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { QuizOption } from '../../services/api/plans';

interface ComprehensionCheckProps {
  question: string;
  optionsJson: string;    // JSON QuizOption[]
  explanation: string;
}

const ComprehensionCheck: React.FC<ComprehensionCheckProps> = ({ question, optionsJson, explanation }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const options: QuizOption[] = useMemo(() => {
    try { return JSON.parse(optionsJson); } catch { return []; }
  }, [optionsJson]);

  if (!options.length) return null;

  const answered = selected !== null;

  const optionClass = (opt: QuizOption): string => {
    const base = 'w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-colors ';
    if (!answered) {
      return base + 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800/50 hover:border-amber-400 dark:hover:border-amber-500 active:scale-[0.98]';
    }
    if (opt.correct) {
      return base + 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium';
    }
    if (opt.label === selected) {
      return base + 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    }
    return base + 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 bg-white dark:bg-gray-800/30 opacity-50';
  };

  return (
    <div
      className="rounded-2xl px-4 py-4 mb-5 border"
      style={{
        borderColor: 'color-mix(in srgb, var(--candle-amber) 30%, transparent)',
        background: 'color-mix(in srgb, var(--candle-amber) 4%, transparent)',
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--candle-amber)' }}>
        {t('plan.check.title', 'Quick Check')}
      </p>

      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-3 leading-snug">
        {question}
      </p>

      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <button
            key={opt.label}
            disabled={answered}
            className={optionClass(opt)}
            onClick={() => setSelected(opt.label)}
          >
            <span className="font-semibold mr-1.5">{opt.label})</span>
            {opt.text}
          </button>
        ))}
      </div>

      {answered && explanation && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-800/30">
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--candle-amber)' }}>
            {t('plan.check.explanation', 'About this passage')}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default ComprehensionCheck;
