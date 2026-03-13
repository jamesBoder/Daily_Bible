import React, { useEffect, useState } from 'react';
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
  /** If true, show month navigation (Phase 8 premium). Currently unused — always false. */
  isPremium?: boolean;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({ isPremium = false }) => {
  const { t } = useTranslation();
  const [months, setMonths] = useState<CalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const months = isPremium ? 12 : 1;
    api.get(`/api/streak/calendar?months=${months}`)
      .then(res => {
        setMonths(res.data.months ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [isPremium]);

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

  if (months.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        {t('profile.calendar_empty', 'No activity recorded yet.')}
      </p>
    );
  }

  // For free tier, show one month.
  const currentMonth = months[months.length - 1];

  // Build a padded grid starting from the first weekday of the month's first day.
  const firstDate = new Date(currentMonth.days[0].date + 'T00:00:00');
  const paddingCells = firstDate.getDay(); // 0=Sun, 6=Sat

  return (
    <div className="space-y-3">
      {/* Month + year header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">
          {currentMonth.label}
        </h3>
        <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--candle-amber)' }} />
            {t('profile.cal_engaged', 'Active')}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'var(--grace-lavender)' }} />
            {t('profile.cal_grace', 'Grace')}
          </span>
        </div>
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
          <div key={`pad-${i}`} />
        ))}
        {currentMonth.days.map((day, idx) => (
          <CalendarCell key={day.date} day={day} index={paddingCells + idx} />
        ))}
      </div>
    </div>
  );
};

interface CalendarCellProps {
  day: CalendarDay;
  index: number;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ day, index }) => {
  const dayNum = new Date(day.date + 'T00:00:00').getDate();

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
