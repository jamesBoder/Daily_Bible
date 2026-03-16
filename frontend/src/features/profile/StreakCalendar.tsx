import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api/api';

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

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Build a fully-empty CalendarMonth for months the API didn't return. */
function buildEmptyMonth(year: number, month: number): CalendarMonth {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: CalendarDay[] = Array.from({ length: daysInMonth }, (_, i) => ({
    date: `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    state: 'missed',
  }));
  return {
    year,
    month,
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    days,
  };
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
  const navigate = useNavigate();
  const [apiMonths, setApiMonths] = useState<CalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Index into the spine (0 = oldest, spine.length-1 = current month)
  const spine = buildMonthSpine(FETCH_MONTHS);
  const [viewIdx, setViewIdx] = useState(spine.length - 1);

  useEffect(() => {
    api.get(`/api/streak/calendar?months=${FETCH_MONTHS}`)
      .then(res => {
        setApiMonths(res.data.months ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
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
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {currentMonth.label}
        </h3>
        <button
          onClick={() => setViewIdx(i => i + 1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-xs text-gray-400 dark:text-gray-500">
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
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 dark:text-gray-500 py-1">
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
      className += ' border-2 border-dashed text-gray-600 dark:text-gray-300';
      style = {
        borderColor: 'var(--candle-amber)',
        ...(!prefersReduced && { opacity: 0, animation: 'fadeIn 0.3s ease forwards', animationDelay: delay }),
      };
      break;
    case 'missed':
    default:
      className += ' text-gray-400 dark:text-gray-600';
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
