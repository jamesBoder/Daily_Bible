import React from 'react';
import { useTranslation } from 'react-i18next';
import { ROSARY_MYSTERY_SETS, getTodaysMysterySet, type MysterySetKey } from './data/rosaryData';
import { SoundService } from '../../services/SoundService';

interface MysterySelectScreenProps {
  hasSession: boolean;
  sessionKey: MysterySetKey;
  /** Current step index in the in-progress session, for showing progress */
  sessionStep: number;
  onStart: (key: MysterySetKey) => void;
  onResume: () => void;
}

const MYSTERY_COLORS: Record<MysterySetKey, { bg: string; border: string; accent: string; iconBg: string }> = {
  joyful:    { bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-200 dark:border-blue-800',     accent: 'text-blue-600 dark:text-blue-400',   iconBg: 'bg-blue-100 dark:bg-blue-900/60' },
  sorrowful: { bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-200 dark:border-purple-800', accent: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/60' },
  glorious:  { bg: 'bg-amber-50 dark:bg-amber-950/40',   border: 'border-amber-200 dark:border-amber-800',   accent: 'text-amber-600 dark:text-amber-400',  iconBg: 'bg-amber-100 dark:bg-amber-900/60' },
  luminous:  { bg: 'bg-cyan-50 dark:bg-cyan-950/40',     border: 'border-cyan-200 dark:border-cyan-800',     accent: 'text-cyan-600 dark:text-cyan-400',    iconBg: 'bg-cyan-100 dark:bg-cyan-900/60' },
};

const MYSTERY_ICONS: Record<MysterySetKey, string> = {
  joyful:    '🌸',
  sorrowful: '🌹',
  glorious:  '✨',
  luminous:  '☀️',
};

const MYSTERY_LABELS: Record<MysterySetKey, string> = {
  joyful:    'Joyful Mysteries',
  sorrowful: 'Sorrowful Mysteries',
  glorious:  'Glorious Mysteries',
  luminous:  'Luminous Mysteries',
};

const MysterySelectScreen: React.FC<MysterySelectScreenProps> = ({
  hasSession, sessionKey, sessionStep, onStart, onResume,
}) => {
  const { t } = useTranslation();
  const todayKey = getTodaysMysterySet(new Date().getDay());

  const handleSelect = (key: MysterySetKey) => {
    if (navigator.vibrate) navigator.vibrate(8);
    SoundService.play('checkout-tap');
    onStart(key);
  };

  const mysteryLabel = t(`prayer.${sessionKey}`, MYSTERY_LABELS[sessionKey]);

  return (
    <div className="flex flex-col gap-5 px-1 py-2">
      {/* Resume prompt — only shown when a session is in progress */}
      {hasSession && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-amber-300/60 dark:border-amber-700/50"
          style={{ background: 'color-mix(in srgb, var(--candle-amber) 6%, var(--card-bg))' }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
              {t('prayer.resumeSession', 'Continue where you left off?')}
            </p>
            <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
              {MYSTERY_ICONS[sessionKey]} {mysteryLabel} · {t('prayer.stepLabel', 'step {{n}}', { n: sessionStep + 1 })}
            </p>
          </div>
          <button
            onClick={onResume}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold text-white active:scale-[0.97] transition-transform"
            style={{ background: 'var(--blessing-gold)' }}
            aria-label={t('prayer.resumeAriaLabel', 'Resume {{mystery}}', { mystery: mysteryLabel })}
          >
            {t('prayer.resume', 'Resume')}
          </button>
        </div>
      )}

      {/* Section header */}
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] px-1">
        {hasSession
          ? t('prayer.startNewLabel', 'Or start fresh')
          : t('prayer.chooseMysteriesTitle', "Choose a Mystery")}
      </p>

      {/* Mystery set cards */}
      <div className="flex flex-col gap-3">
        {ROSARY_MYSTERY_SETS.map(set => {
          const c = MYSTERY_COLORS[set.key];
          const isToday = set.key === todayKey;
          return (
            <button
              key={set.key}
              onClick={() => handleSelect(set.key)}
              className={`w-full text-left px-4 py-4 rounded-2xl border transition-all active:scale-[0.98] ${c.bg} ${c.border} ${isToday ? 'ring-2 ring-offset-1 ring-amber-400/70 dark:ring-offset-gray-900' : ''}`}
              aria-label={`${t(`prayer.${set.key}`, set.key)}${isToday ? ' — ' + t('prayer.todayLabel', "today's") : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Icon badge */}
                <span className={`text-lg w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${c.iconBg}`}>
                  {MYSTERY_ICONS[set.key]}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      {t(`prayer.${set.key}`, MYSTERY_LABELS[set.key])}
                    </span>
                    {isToday && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${c.iconBg} ${c.accent}`}>
                        {t('prayer.todayLabel', "Today")}
                      </span>
                    )}
                  </div>
                  {/* Mystery titles inline as a single line summary */}
                  <p className="text-xs text-[var(--journal-text-muted)] mt-1 leading-snug line-clamp-1">
                    {set.mysteries.map(m => m.title).join(' · ')}
                  </p>
                </div>

                <svg className={`w-4 h-4 flex-shrink-0 ${c.accent}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MysterySelectScreen;
