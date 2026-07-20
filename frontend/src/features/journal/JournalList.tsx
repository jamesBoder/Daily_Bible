import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../services/api/api";
import { useTutorial } from "../../hooks/useTutorial";
import { JournalTutorial, JOURNAL_TUTORIAL_KEY } from "./JournalTutorial";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import PullRefreshIndicator from "../../components/common/PullRefreshIndicator";
import "./JournalList.css";

// ── Types ──────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: number;
  content_plain: string;
  content_rich: string;
  linked_verse: string;
  prompt_id: number | null;
  created_at: string;
  updated_at: string;
}

interface JournalListResponse {
  entries: JournalEntry[];
  total_stored: number;
  view_limit: number | null;
  is_premium: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatEntryDate(isoString: string): { full: string; day: string } {
  const d = new Date(isoString);
  return {
    full: d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
    day: d.toLocaleDateString(undefined, { weekday: 'short' }),
  };
}

function isToday(isoString: string): boolean {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function JournalListSkeleton() {
  return (
    <div className="journal-entry-list" aria-busy="true" aria-label="Loading journal entries">
      {[1, 2, 3].map((i) => (
        <div key={i} className="journal-skeleton-card">
          <div
            className="journal-skeleton-line skeleton-shimmer"
            style={{ height: "12px", width: "40%", marginBottom: "8px" }}
          />
          <div
            className="journal-skeleton-line skeleton-shimmer"
            style={{ height: "14px", width: "90%" }}
          />
          <div
            className="journal-skeleton-line skeleton-shimmer"
            style={{ height: "14px", width: "70%" }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export const JournalList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(JOURNAL_TUTORIAL_KEY);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [totalStored, setTotalStored] = useState(0);
  const [viewLimit, setViewLimit] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<JournalListResponse>("/api/journal");
      setEntries(res.data.entries);
      setTotalStored(res.data.total_stored);
      setViewLimit(res.data.view_limit);
      setIsPremium(res.data.is_premium);
    } catch {
      setError(t("journal.errorLoading", "Failed to load journal entries. Please try again."));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const ptr = usePullToRefresh({ onRefresh: fetchEntries });

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const hasEntryToday =
    entries.length > 0 && isToday(entries[0].created_at);

  const lockedCount =
    viewLimit !== null && totalStored > viewLimit
      ? totalStored - viewLimit
      : 0;

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-6"
      onTouchStart={ptr.onTouchStart}
      onTouchMove={ptr.onTouchMove}
      onTouchEnd={ptr.onTouchEnd}
    >
      <PullRefreshIndicator progress={ptr.pullProgress} isRefreshing={ptr.isRefreshing} />
      {/* Tutorial overlay */}
      {showTutorial && <JournalTutorial onDismiss={dismissTutorial} />}

      {/* Page header */}
      <div className="journal-page-header">
        <div>
          <h1 className="journal-page-title">{t("journal.title", "My Journal")}</h1>
          <p className="journal-page-subtitle">
            {t("journal.subtitle", "A private space for prayer, reflection, and growth.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="tap-target-44 w-8 h-8 flex items-center justify-center rounded-full text-[var(--foreground)] opacity-40 hover:opacity-90 hover:bg-[var(--theme-surface)] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={openTutorial}
            aria-label={t("common.help", "Help")}
            title={t("common.help", "Help")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            className="journal-new-btn"
            onClick={() => navigate("/journal/new")}
            aria-label={t("journal.newEntry", "New Entry")}
          >
            + {t("journal.newEntry", "New Entry")}
          </button>
        </div>
      </div>

      {/* Today banner (hidden once user has written today) */}
      {!isLoading && !error && !hasEntryToday && (
        <div className="journal-today-banner" role="complementary" aria-label="Write today's entry">
          <div className="journal-today-banner-left">
            <span className="journal-today-banner-icon" aria-hidden="true">🪶</span>
            <div>
              <p className="journal-today-banner-label">
                {t("journal.todayIs", "Today, {{date}}", { date: getTodayFormatted() })}
              </p>
              <p className="journal-today-banner-sub">
                {t("journal.whatOnYourHeart", "What is on your heart?")}
              </p>
            </div>
          </div>
          <button
            className="journal-begin-btn"
            onClick={() => navigate("/journal/new")}
          >
            {t("journal.beginWriting", "Begin Writing →")}
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <JournalListSkeleton />
      ) : error ? (
        <div className="text-center py-12" role="alert">
          <p className="journal-page-subtitle mb-4">{error}</p>
          <button
            className="journal-new-btn"
            onClick={fetchEntries}
          >
            {t("common.retry", "Retry")}
          </button>
        </div>
      ) : entries.length === 0 ? (
        /* Empty state */
        <div className="journal-empty-state">
          <span className="journal-empty-icon" aria-hidden="true">🪶</span>
          <h2 className="journal-empty-title">
            {t("journal.emptyTitle", "Your devotional journey begins here.")}
          </h2>
          <p className="journal-empty-body">
            {t(
              "journal.emptyBody",
              "Write your first entry — a reflection, a prayer, or simply what's on your heart."
            )}
          </p>
          <button
            className="journal-empty-cta"
            onClick={() => navigate("/journal/new")}
          >
            {t("journal.writeFirstEntry", "Write your first entry →")}
          </button>
        </div>
      ) : (
        <>
          {/* Entry list */}
          <div className="journal-entry-list">
            {entries.map((entry, index) => {
              const { full, day } = formatEntryDate(entry.created_at);
              const preview = entry.content_plain.slice(0, 120).trim();

              return (
                <div
                  key={entry.id}
                  className="journal-entry-card"
                  style={{ animationDelay: `${index * 55}ms` }}
                  onClick={() => navigate(`/journal/${entry.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") navigate(`/journal/${entry.id}`);
                  }}
                  aria-label={`Journal entry from ${full}: ${preview}`}
                >
                  <div className="journal-entry-card-header">
                    <span className="journal-entry-date">{full}</span>
                    <span className="journal-entry-day">{day}</span>
                  </div>
                  <p className="journal-entry-preview">
                    {preview}
                    {entry.content_plain.length > 120 ? "…" : ""}
                  </p>
                  {isPremium && entry.linked_verse && (
                    <span className="journal-entry-verse-badge">
                      📖 {entry.linked_verse}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Locked entries stack */}
          {lockedCount > 0 && (
            <div className="journal-locked-stack-wrapper" aria-label="Older entries locked">
              <div className="journal-locked-ghost" aria-hidden="true" />
              <div className="journal-locked-ghost" aria-hidden="true" />
              <div className="journal-locked-ghost" aria-hidden="true" />
              <div className="journal-locked-notice">
                <p className="journal-locked-notice-text">
                  🔒{" "}
                  {t("journal.lockedEntries", {
                    count: lockedCount,
                    defaultValue:
                      "{{count}} older entries are safely stored. Unlock full history with a Words of Praise membership.",
                  })}
                </p>
                <button className="journal-locked-notice-cta">
                  {t("journal.unlockHistory", "Unlock Full History")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
