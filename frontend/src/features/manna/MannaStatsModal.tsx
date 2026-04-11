import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { mannaApi, MannaStats, MannaGameSummary } from '../../services/api/manna';
import './manna.css';

type Tab = 'stats' | 'history';

interface MannaStatsModalProps {
  onDismiss: () => void;
}

export const MannaStatsModal: React.FC<MannaStatsModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<Tab>('stats');
  const [stats, setStats] = useState<MannaStats | null>(null);
  const [history, setHistory] = useState<MannaGameSummary[] | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [statsRetry, setStatsRetry] = useState(0);
  const [historyRetry, setHistoryRetry] = useState(0);

  // Load stats when tab is active (re-runs on retry)
  useEffect(() => {
    if (tab !== 'stats') return;
    setLoadingStats(true);
    setStatsError(false);
    mannaApi.getStats()
      .then(s => setStats(s))
      .catch(() => setStatsError(true))
      .finally(() => setLoadingStats(false));
  }, [tab, statsRetry]);

  // Load history when tab is active (re-runs on retry)
  useEffect(() => {
    if (tab !== 'history') return;
    setLoadingHistory(true);
    setHistoryError(false);
    mannaApi.getHistory()
      .then(r => setHistory(r.history))
      .catch(() => setHistoryError(true))
      .finally(() => setLoadingHistory(false));
  }, [tab, historyRetry]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  // Focus trap + Escape key
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onDismiss(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };
    panel.addEventListener('keydown', onKeyDown);
    first?.focus();
    return () => panel.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="manna-tutorial-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={t('manna.statsModalLabel', 'Manna Stats & History')}
    >
      <div className="manna-tutorial-panel manna-stats-panel" ref={panelRef}>

        {/* Close */}
        <button
          className="manna-tutorial-close"
          onClick={onDismiss}
          aria-label={t('common.close', 'Close')}
        >
          ✕
        </button>

        {/* Header */}
        <div className="manna-tutorial-header" style={{ marginBottom: '0.75rem' }}>
          <span className="manna-tutorial-icon" aria-hidden>📊</span>
          <h2 className="manna-tutorial-title">
            {t('manna.statsTitle', 'Manna Stats')}
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="manna-stats-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'stats'}
            className={`manna-stats-tab ${tab === 'stats' ? 'manna-stats-tab--active' : ''}`}
            onClick={() => setTab('stats')}
          >
            {t('manna.statsTab', 'Stats')}
          </button>
          <button
            role="tab"
            aria-selected={tab === 'history'}
            className={`manna-stats-tab ${tab === 'history' ? 'manna-stats-tab--active' : ''}`}
            onClick={() => setTab('history')}
          >
            {t('manna.historyTab', 'History')}
          </button>
        </div>

        {/* ── Stats tab ── */}
        {tab === 'stats' && (
          <div role="tabpanel" className="manna-stats-body">
            {loadingStats && <Spinner />}
            {statsError && (
              <div className="flex flex-col items-center gap-3 py-6">
                <p className="manna-muted text-sm text-center">
                  {t('manna.statsError', 'Could not load stats.')}
                </p>
                <button className="manna-hint-btn" onClick={() => setStatsRetry(n => n + 1)}>
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            )}
            {stats && !loadingStats && (
              <StatsContent stats={stats} t={t} />
            )}
          </div>
        )}

        {/* ── History tab ── */}
        {tab === 'history' && (
          <div role="tabpanel" className="manna-stats-body">
            {loadingHistory && <Spinner />}
            {historyError && (
              <div className="flex flex-col items-center gap-3 py-6">
                <p className="manna-muted text-sm text-center">
                  {t('manna.historyError', 'Could not load history.')}
                </p>
                <button className="manna-hint-btn" onClick={() => setHistoryRetry(n => n + 1)}>
                  {t('common.retry', 'Retry')}
                </button>
              </div>
            )}
            {history && !loadingHistory && (
              <HistoryContent history={history} t={t} />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// ─── Stats content ────────────────────────────────────────────────────────────

const StatsContent: React.FC<{ stats: MannaStats; t: TFunction }> = ({ stats, t }) => {
  const maxDist = Math.max(...Object.values(stats.guess_distribution), 1);

  return (
    <>
      {/* Key numbers */}
      <div className="manna-stats-grid">
        <StatBox value={stats.played} label={t('manna.statPlayed', 'Played')} />
        <StatBox value={`${Math.round(stats.win_rate)}%`} label={t('manna.statWinRate', 'Win %')} />
        <StatBox value={stats.current_streak} label={t('manna.statStreak', 'Streak')} />
        <StatBox value={stats.max_streak} label={t('manna.statMaxStreak', 'Best')} />
      </div>

      {/* Avg guesses */}
      {stats.won > 0 && (
        <p className="manna-muted text-xs text-center mb-3">
          {t('manna.statAvgGuesses', 'Average guesses (wins): {{n}}', {
            n: stats.avg_guesses.toFixed(1),
          })}
        </p>
      )}

      {/* Guess distribution bars */}
      <p className="manna-tutorial-section-label" style={{ marginBottom: '0.6rem' }}>
        {t('manna.statDistribution', 'Guess Distribution')}
      </p>
      <div className="manna-dist-rows">
        {(['1', '2', '3', '4', '5', '6'] as const).map(n => {
          const count = stats.guess_distribution[n] ?? 0;
          const pct = maxDist > 0 ? Math.max((count / maxDist) * 100, count > 0 ? 8 : 2) : 2;
          return (
            <div key={n} className="manna-dist-row">
              <span className="manna-dist-label">{n}</span>
              <div className="manna-dist-bar-wrap">
                <div
                  className="manna-dist-bar"
                  style={{ width: `${pct}%` }}
                  aria-label={`${n} ${t('manna.statGuesses', 'guesses')}: ${count}`}
                >
                  {count > 0 && <span className="manna-dist-count">{count}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats.played === 0 && (
        <p className="manna-muted text-xs text-center mt-4">
          {t('manna.statsEmpty', 'No games played yet. Come back after your first puzzle!')}
        </p>
      )}
    </>
  );
};

const StatBox: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="manna-stat-box">
    <span className="manna-stat-value">{value}</span>
    <span className="manna-stat-label">{label}</span>
  </div>
);

// ─── History content ──────────────────────────────────────────────────────────

const STATUS_ICON: Record<string, string> = {
  solved: '✅',
  failed: '❌',
  in_progress: '🔄',
};

const HistoryContent: React.FC<{ history: MannaGameSummary[]; t: TFunction }> = ({ history, t }) => {
  if (history.length === 0) {
    return (
      <p className="manna-muted text-sm text-center py-6">
        {t('manna.historyEmpty', 'No past games yet. Your history will appear here after your first puzzle.')}
      </p>
    );
  }

  return (
    <div className="manna-history-list">
      {history.map(g => (
        <div key={g.game_date} className="manna-history-row">
          <span className="manna-history-icon" aria-hidden>{STATUS_ICON[g.status] ?? '·'}</span>
          <span className="manna-history-date">{formatDate(g.game_date)}</span>
          <span
            className="manna-history-word"
            style={{ color: g.status === 'solved' ? 'var(--blessing-gold)' : undefined }}
          >
            {g.word || '—'}
          </span>
          <span className="manna-history-guesses manna-muted">
            {g.status === 'solved'
              ? `${g.guess_count}/${g.max_guesses ?? 6}`
              : g.status === 'failed'
                ? `X/${g.max_guesses ?? 6}`
                : '—'
            }
          </span>
        </div>
      ))}
    </div>
  );
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div
      className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: 'var(--candle-amber)', borderTopColor: 'transparent' }}
    />
  </div>
);
