import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClockCounterClockwise, CaretDown, CaretUp } from '@phosphor-icons/react';
import type { PrevDaySummary } from '../../services/api/plans';

interface PrevDayStripProps {
  prevDay: PrevDaySummary;
}

const PrevDayStrip: React.FC<PrevDayStripProps> = ({ prevDay }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasNote = !!prevDay.journal_excerpt;

  return (
    <div
      className="rounded-xl mb-4 overflow-hidden border"
      style={{
        borderColor: 'color-mix(in srgb, var(--candle-amber) 20%, transparent)',
        background: 'color-mix(in srgb, var(--candle-amber) 5%, transparent)',
      }}
    >
      <button
        onClick={hasNote ? () => setExpanded(v => !v) : undefined}
        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left ${hasNote ? '' : 'cursor-default'}`}
      >
        <ClockCounterClockwise
          size={14}
          weight="bold"
          className="text-amber-500 dark:text-amber-400 flex-shrink-0"
        />
        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex-1 truncate">
          {t('plan.lastTime', 'Last time')}{': '}
          <span className="font-normal text-[var(--foreground)] opacity-75">
            {prevDay.verse_ref}
            {prevDay.day_title ? ` — "${prevDay.day_title}"` : ''}
          </span>
        </span>
        {hasNote && (expanded
          ? <CaretUp size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          : <CaretDown size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
        )}
      </button>

      {expanded && prevDay.journal_excerpt && (
        <div className="px-4 pb-3 pt-0.5">
          <p className="text-xs text-[var(--journal-text-muted)] uppercase tracking-wide font-semibold mb-1">
            {t('plan.yourNote', 'Your note')}
          </p>
          <p className="text-sm text-[var(--foreground)] italic leading-relaxed">
            &ldquo;{prevDay.journal_excerpt}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};

export default PrevDayStrip;
