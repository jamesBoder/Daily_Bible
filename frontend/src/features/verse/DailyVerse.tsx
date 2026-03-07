import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useVerse } from "../../hooks/useVerse";
import { useHistory } from "../../hooks/useHistory";
import { useAuth } from "../../hooks/useAuth";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { VerseCard } from "./VerseCard";
import { Button } from "../../components/common/Button";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { useTranslation } from "react-i18next";

// Helper: local-timezone date string for duplicate detection
const toLocalDateStr = (d: Date): string =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Helper: relative date label via Intl.RelativeTimeFormat — no date-fns needed
const getRelativeLabel = (viewed_at: string, lang: string): string => {
  const entry = new Date(viewed_at);
  const today = new Date();
  const entryMidnight = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate());
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round(
    (todayMidnight.getTime() - entryMidnight.getTime()) / (1000 * 60 * 60 * 24)
  );
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  return rtf.format(-diffDays, "day");
};

// NavArrow button component
interface NavArrowProps {
  direction: "back" | "forward";
  onClick: () => void;
  size?: "sm" | "md";
}

const NavArrow: React.FC<NavArrowProps> = ({ direction, onClick, size = "md" }) => {
  const isBack = direction === "back";
  const sizeClasses = size === "sm" ? "w-11 h-11" : "w-14 h-14";
  const iconSize = size === "sm" ? "w-5 h-5" : "w-6 h-6";

  return (
    <button
      onClick={onClick}
      aria-label={isBack ? "Go to previous verse" : "Go to next verse"}
      className={`
        ${sizeClasses} rounded-full
        bg-white/60 dark:bg-gray-800/60
        backdrop-blur-sm
        border border-gray-200/80 dark:border-gray-700/80
        shadow-md
        text-gray-500 dark:text-gray-400
        hover:bg-primary-50 dark:hover:bg-primary-900/30
        hover:border-primary-300 dark:hover:border-primary-600
        hover:text-primary-600 dark:hover:text-primary-400
        flex items-center justify-center
        nav-arrow-glow
      `}
    >
      <svg
        className={iconSize}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        {isBack ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
};

// Today shortcut pill button
const TodayButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
      px-3 py-1 rounded-full
      text-xs font-semibold
      bg-primary-50 dark:bg-primary-900/30
      text-primary-600 dark:text-primary-400
      border border-primary-200 dark:border-primary-700
      hover:bg-primary-100 dark:hover:bg-primary-900/50
      hover:scale-105 active:scale-95
      transition-all duration-200
    "
  >
    Today
  </button>
);

export const DailyVerse: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isGuest } = useAuth();
  const { verse, isLoading, error, refetch } = useVerse(i18n.language);
  const { history, isLoading: historyLoading } = useHistory(!isGuest);

  const [historyIndex, setHistoryIndex] = useState(0);

  // Reset index when language changes so we don't show a stale past-verse
  useEffect(() => {
    setHistoryIndex(0);
  }, [i18n.language]);

  // Skip history[0] if it matches today (local tz) to avoid duplicating today's verse
  const todayStr = toLocalDateStr(new Date());
  const firstEntryStr =
    history.length > 0 ? toLocalDateStr(new Date(history[0].viewed_at)) : "";
  const offset = firstEntryStr === todayStr ? 1 : 0;
  const effectiveHistory = history.slice(offset);

  // Derive display state
  const currentEntry = historyIndex > 0 ? effectiveHistory[historyIndex - 1] : null;
  const displayVerse = historyIndex === 0 ? verse : (currentEntry?.verse ?? null);
  const showForward = historyIndex > 0;
  const showBack = !isGuest && !historyLoading && historyIndex < effectiveHistory.length;

  // Stable callback refs so useKeyboardShortcuts' effect doesn't thrash
  const goBack = useCallback(() => {
    if (historyIndex < effectiveHistory.length) setHistoryIndex((i) => i + 1);
  }, [historyIndex, effectiveHistory.length]);

  const goForward = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex((i) => i - 1);
  }, [historyIndex]);

  const shortcuts = useMemo(
    () => [
      { key: "ArrowLeft", callback: goBack },
      { key: "ArrowRight", callback: goForward },
    ],
    [goBack, goForward]
  );
  useKeyboardShortcuts(shortcuts);

  const relativeLabel = currentEntry
    ? getRelativeLabel(currentEntry.viewed_at, i18n.language)
    : "";

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{t("dailyVerse.error")}</p>
          <Button onClick={() => refetch()} variant="primary">
            {t("dailyVerse.retry")}
          </Button>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-700 dark:text-gray-400">{t("dailyVerse.error")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Mobile control row — sits between nav header and h1, hidden on desktop */}
      {!isGuest && (
        <div className="flex items-center justify-between px-4 py-2 md:hidden mb-2">
          {/* Left zone — fixed width so center stays centered */}
          <div className="w-11 flex justify-start">
            {showBack && (
              <div className="animate-fade-in">
                <NavArrow direction="back" onClick={goBack} size="sm" />
              </div>
            )}
          </div>

          {/* Center zone — relative label + Today shortcut */}
          <div className="flex flex-col items-center gap-1">
            {historyIndex > 0 && (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {relativeLabel}
              </span>
            )}
            {historyIndex > 0 && <TodayButton onClick={() => setHistoryIndex(0)} />}
          </div>

          {/* Right zone — fixed width */}
          <div className="w-11 flex justify-end">
            {showForward && <NavArrow direction="forward" onClick={goForward} size="sm" />}
          </div>
        </div>
      )}

      {/* Title + date line */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-bold text-primary-600 dark:text-primary-400 mb-2 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
          {t("dailyVerse.title")}
        </h1>
        {/* Date line: full date at index 0, relative label at index > 0 */}
        <p className="text-gray-600">
          {historyIndex === 0
            ? new Date().toLocaleDateString(i18n.language, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : relativeLabel}
        </p>
        {/* "Today" shortcut — desktop only, appears below date line */}
        {historyIndex > 0 && (
          <button
            onClick={() => setHistoryIndex(0)}
            className="mt-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline hidden md:inline-block transition-colors duration-200"
          >
            ← Today
          </button>
        )}
      </div>

      {/* Desktop: three-column flex so card stays centered when arrows appear/disappear */}
      <div className="hidden md:flex items-center gap-6">
        {/* Left slot — always reserves w-14 space */}
        <div className="w-14 flex-shrink-0 flex justify-center">
          {showBack && (
            <div className="animate-fade-in">
              <NavArrow direction="back" onClick={goBack} />
            </div>
          )}
        </div>

        {/* Card — expands to fill remaining space */}
        <div className="flex-1 min-w-0">
          {historyIndex > 0 && displayVerse === null ? (
            <VerseCardSkeleton />
          ) : (
            <VerseCard verse={displayVerse ?? verse} />
          )}
        </div>

        {/* Right slot — always reserves w-14 space */}
        <div className="w-14 flex-shrink-0 flex justify-center">
          {showForward && <NavArrow direction="forward" onClick={goForward} />}
        </div>
      </div>

      {/* Mobile: single-column card */}
      <div className="md:hidden">
        {historyIndex > 0 && displayVerse === null ? (
          <VerseCardSkeleton />
        ) : (
          <VerseCard verse={displayVerse ?? verse} />
        )}
      </div>
    </div>
  );
};
