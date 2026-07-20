import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api/api';
import { useLanguage } from '../../contexts/LanguageContext';
import { msUntilDailyReset } from '../../lib/queryClient';

interface CalendarDay {
  date: string;
  state: 'engaged' | 'grace_day' | 'today_pending' | 'missed';
}

interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  days: CalendarDay[];
}

interface StreakCalendarProps {
  isPremium?: boolean;
}

/** Build a fully-empty CalendarMonth for months the API didn't return. */
function buildEmptyMonth(year: number, month: number): CalendarMonth {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    state: 'missed',
  }));
  return { year, month, label: '', days };
}

/** Localized month + year label, e.g. "March 2025" or "mars 2025". */
function localMonthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
}

/** Localized 2-letter day headers for a Sunday-anchored week. */
function localDayLabels(locale: string): string[] {
  const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  // Jan 5 2025 is a Sunday; iterate Sun–Sat
  return Array.from({ length: 7 }, (_, i) =>
    fmt.format(new Date(2025, 0, 5 + i)).slice(0, 2)
  );
}

/** Produce a list of the last `count` calendar months (newest last). */
function buildMonthSpine(count: number): { year: number; month: number }[] {
  const spine: { year: number; month: number }[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    spine.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return spine;
}

const FETCH_MONTHS = 12;

const StreakCalendar: React.FC<StreakCalendarProps> = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const { data: calData, isLoading, isError } = useQuery({
    queryKey: ['streak-calendar'],
    queryFn: () => api.get(`/api/streak/calendar?months=${FETCH_MONTHS}`).then(r => r.data),
    staleTime: msUntilDailyReset(), // calendar only changes at the daily reset
  });

  const apiMonths: CalendarMonth[] = calData?.months ?? [];

  // Index into the spine (0 = oldest, spine.length-1 = current month)
  const spine = buildMonthSpine(FETCH_MONTHS);
  const [viewIdx, setViewIdx] = useState(spine.length - 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square w-full rounded-lg bg-[var(--theme-border)] animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--journal-text-muted)] text-center py-4">
        {t('profile.calendar_error', 'Calendar temporarily unavailable.')}
      </p>
    );
  }

  // Merge API data onto the spine
  const months: CalendarMonth[] = spine.map(({ year, month }) => {
    const found = apiMonths.find(m => m.year === year && m.month === month);
    return found ?? buildEmptyMonth(year, month);
  });

  const currentMonth = months[viewIdx];
  if (currentMonth.days.length === 0) return null;
  const firstDate = new Date(currentMonth.days[0].date + 'T00:00:00');
  const paddingCells = firstDate.getDay();
  const totalCells = paddingCells + currentMonth.days.length;
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  const canGoBack = viewIdx > 0;
  const canGoForward = viewIdx < spine.length - 1;

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewIdx(i => i - 1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="tap-target-44 w-8 h-8 flex items-center justify-center rounded-full text-[var(--journal-text-muted)] hover:bg-[var(--theme-surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {localMonthLabel(currentMonth.year, currentMonth.month, currentLanguage)}
        </h3>
        <button
          onClick={() => setViewIdx(i => i + 1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="tap-target-44 w-8 h-8 flex items-center justify-center rounded-full text-[var(--journal-text-muted)] hover:bg-[var(--theme-surface)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-xs text-[var(--journal-text-muted)]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--candle-amber)' }} />
          {t('profile.cal_engaged', 'Active')}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--grace-lavender)' }} />
          {t('profile.cal_grace', 'Grace')}
        </span>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1">
        {localDayLabels(currentLanguage).map((d, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-[var(--journal-text-muted)] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: paddingCells }).map((_, i) => (
          <div key={`pad-start-${i}`} />
        ))}
        {currentMonth.days.map((day, idx) => (
          <CalendarCell
            key={day.date}
            day={day}
            index={paddingCells + idx}
            onNavigate={() => navigate(`/daily?date=${day.date}`)}
          />
        ))}
        {Array.from({ length: trailingCells }).map((_, i) => (
          <div key={`pad-end-${i}`} />
        ))}
      </div>
    </div>
  );
};

interface CalendarCellProps {
  day: CalendarDay;
  index: number;
  onNavigate: () => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, index, onNavigate }) => {
  const dayNum = new Date(day.date + 'T00:00:00').getDate();
  const isClickable = day.state === 'today_pending' || day.state === 'engaged';

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const delay = prefersReduced ? undefined : `${index * 12}ms`;

  const base = 'aspect-square w-full rounded-lg flex items-center justify-center text-xs font-semibold select-none';

  let style: React.CSSProperties = {};
  let className = base;

  switch (day.state) {
    case 'engaged':
      className += ' text-white';
      style = {
        background: 'var(--candle-amber)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        ...(!prefersReduced && { opacity: 0, animation: 'fadeInScale 0.3s ease forwards', animationDelay: delay }),
      };
      break;
    case 'grace_day':
      className += ' text-white';
      style = {
        background: 'var(--grace-lavender)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        ...(!prefersReduced && { opacity: 0, animation: 'fadeIn 0.3s ease forwards', animationDelay: delay }),
      };
      break;
    case 'today_pending':
      className += ' border-2 border-dashed text-[var(--foreground)]';
      style = {
        borderColor: 'var(--candle-amber)',
        ...(!prefersReduced && { opacity: 0, animation: 'fadeIn 0.3s ease forwards', animationDelay: delay }),
      };
      break;
    case 'missed':
    default:
      className += ' text-[var(--foreground)] opacity-25';
      style = {
        background: 'rgba(0,0,0,0.04)',
        ...(!prefersReduced && { opacity: 0, animation: 'fadeIn 0.3s ease forwards', animationDelay: delay }),
      };
      break;
  }

  if (isClickable) {
    return (
      <button
        onClick={onNavigate}
        className={className + ' cursor-pointer hover:brightness-110 hover:scale-105 transition-transform'}
        style={style}
        title={day.date}
        aria-label={`${day.date}: ${day.state.replace('_', ' ')}`}
      >
        {dayNum}
      </button>
    );
  }

  return (
    <div
      className={className}
      style={style}
      title={day.date}
      aria-label={`${day.date}: ${day.state.replace('_', ' ')}`}
    >
      {dayNum}
    </div>
  );
};

export default StreakCalendar;
