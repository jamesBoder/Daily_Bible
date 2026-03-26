import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mannaApi, MannaGameSummary } from '../../services/api/manna';
import './manna.css';

interface MannaArchiveProps {
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

/** Returns a human-friendly label for a past date. */
function formatArchiveDate(daysAgo: number, d: Date): string {
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo <= 7) return `${daysAgo} days ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const MannaArchive: React.FC<MannaArchiveProps> = ({ onSelectDate, onClose }) => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<MannaGameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    mannaApi.getHistory()
      .then(r => setHistory(r.history))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  // Build list of last 60 days (excluding today), merged with history data.
  // Use UTC midnight arithmetic throughout so date strings match the backend's UTC dates.
  const days: { date: string; label: string; daysAgo: number; summary?: MannaGameSummary }[] = [];
  const historyMap = Object.fromEntries(history.map(h => [h.game_date, h]));

  const now = new Date();
  const utcTodayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  for (let i = 1; i <= 60; i++) {
    const d = new Date(utcTodayMs - i * 24 * 60 * 60 * 1000); // exact UTC midnight i days ago
    const dateStr = d.toISOString().split('T')[0];             // always "YYYY-MM-DD" at midnight UTC
    days.push({ date: dateStr, label: formatArchiveDate(i, d), daysAgo: i, summary: historyMap[dateStr] });
  }

  return (
    <div className="manna-scene flex flex-col gap-4 py-5 px-4 max-w-sm mx-auto" style={{ position: 'relative', zIndex: 1 }}>
      <div className="w-full flex items-center justify-between">
        <h2 className="manna-title-glow text-xl font-display font-bold" style={{ color: 'var(--blessing-gold)' }}>
          📅 {t('manna.archive', 'Archive')}
        </h2>
        <button className="manna-help-btn" onClick={onClose} aria-label={t('common.close', 'Close')}>✕</button>
      </div>
      <p className="manna-muted text-xs">{t('manna.archiveSubtitle', "Play any past day's word puzzle.")}</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div
            className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--candle-amber)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="manna-muted text-sm">{t('manna.archiveError', 'Could not load history. Tap a date to play anyway.')}</p>
          {/* Still allow playing even without history loaded */}
          <div className="flex flex-col gap-2 w-full mt-2">
            {days.slice(0, 7).map(({ date, label }) => (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-muted)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">⬜</span>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                </div>
                <span className="manna-muted text-xs">{t('manna.archivePlay', 'Play')}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {days.map(({ date, label, summary }) => {
            let statusIcon: string;
            let statusLabel: string;

            if (!summary) {
              statusIcon = '⬜';
              statusLabel = t('manna.archiveNotPlayed', 'Not played');
            } else if (summary.status === 'solved') {
              statusIcon = '✅';
              statusLabel = t('manna.archiveSolved', 'Solved in {{n}}', { n: summary.guess_count });
            } else if (summary.status === 'in_progress') {
              statusIcon = '🟡';
              statusLabel = t('manna.archiveInProgress', 'In progress');
            } else {
              statusIcon = '❌';
              statusLabel = t('manna.archiveFailed', 'Failed');
            }

            return (
              <button
                key={date}
                onClick={() => onSelectDate(date)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-all hover:brightness-110 active:scale-95"
                style={{ background: 'var(--panel-bg)', border: '1px solid var(--border-muted)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{statusIcon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    {summary?.word && (summary.status === 'solved' || summary.status === 'failed') && (
                      <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--blessing-gold)' }}>
                        {summary.word}
                      </p>
                    )}
                  </div>
                </div>
                <span className="manna-muted text-xs">{statusLabel}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
