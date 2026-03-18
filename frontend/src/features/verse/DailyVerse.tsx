import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useVerse } from "../../hooks/useVerse";
import { useHistory } from "../../hooks/useHistory";
import { useAuth } from "../../hooks/useAuth";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { VerseCard } from "./VerseCard";
import { SideBySideView } from "./SideBySideView";
import { Button } from "../../components/common/Button";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { useTranslation } from "react-i18next";
import GraceDayBanner from "../../components/GraceDayBanner";
import StreakResetAcknowledgment from "../../components/StreakResetAcknowledgment";
import FirstEngagementOnboarding from "../../components/FirstEngagementOnboarding";
import api from "../../services/api/api";


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

  // Per-session version override (key like "kjv", "web"). Empty = use server preference.
  const [sessionVersion, setSessionVersion] = useState<string | undefined>(undefined);
  // Premium status — fetched once for authenticated users to gate Compare button
  const [isPremium, setIsPremium] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  // History verse override: when a premium user switches translation while browsing history,
  // we fetch that verse reference in the new version and display it here.
  const [historyOverrideVerse, setHistoryOverrideVerse] = useState<import("../../types/verse").Verse | null>(null);
  const [historyVersionLoading, setHistoryVersionLoading] = useState(false);

  const { verse, isLoading, error, refetch } = useVerse(i18n.language, sessionVersion);
  const { history, isLoading: historyLoading } = useHistory(!isGuest);
  const [searchParams, setSearchParams] = useSearchParams();

  const [historyIndex, setHistoryIndex] = useState(0);

  // Fetch premium status once for authenticated users
  useEffect(() => {
    if (isGuest) return;
    let cancelled = false;
    api
      .get<{ user_is_premium: boolean }>(`/api/translations?lang=${encodeURIComponent(i18n.language)}`)
      .then((res) => {
        if (!cancelled) setIsPremium(res.data.user_is_premium);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isGuest, i18n.language]);

  // Reset index + session version when language changes
  useEffect(() => {
    setHistoryIndex(0);
    setSessionVersion(undefined);
    setShowComparison(false);
  }, [i18n.language]);

  // Skip history[0] if it matches today (local tz) to avoid duplicating today's verse.
  // Use verse.daily_date (plain YYYY-MM-DD, timezone-safe) as the canonical date source.
  // Build YYYY-MM-DD for today in local timezone without relying on toLocaleDateString
  // locale behavior (which can vary across browsers and environments).
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  // daily_date comes back as a full ISO timestamp from PostgreSQL (e.g. "2026-03-07T00:00:00Z")
  // so we slice to the date portion before comparing.
  const firstEntryDate = history.length > 0 ? history[0].verse?.daily_date?.slice(0, 10) : undefined;
  const offset = firstEntryDate === todayStr ? 1 : 0;
  const effectiveHistory = history.slice(offset);

  // If the calendar linked to a specific date, find it in history and jump there once loaded.
  const dateParam = searchParams.get('date');
  useEffect(() => {
    if (!dateParam || historyLoading || effectiveHistory.length === 0) return;
    const idx = effectiveHistory.findIndex(
      e => e.verse?.daily_date?.slice(0, 10) === dateParam
    );
    if (idx !== -1) {
      setHistoryIndex(idx + 1);
    }
    // Remove the param so browser back/forward works naturally
    setSearchParams({}, { replace: true });
  }, [dateParam, historyLoading, effectiveHistory, setSearchParams]);

  // Derive display state
  const currentEntry = historyIndex > 0 ? effectiveHistory[historyIndex - 1] : null;
  const displayVerse = historyIndex === 0 ? verse : (currentEntry?.verse ?? null);
  const showForward = historyIndex > 0;
  const showBack = !isGuest && !historyLoading && historyIndex < effectiveHistory.length;

  const handleVersionSelect = useCallback((key: string) => {
    setSessionVersion(key);
    setShowComparison(false);
  }, []);

  // Fetch the history verse in a different translation when a premium user picks one
  const handleHistoryVersionSelect = useCallback(async (key: string, abbreviation: string) => {
    if (!currentEntry?.verse) return;
    setHistoryVersionLoading(true);
    try {
      const encoded = encodeURIComponent(currentEntry.verse.reference);
      const res = await api.get<{ verse: { text: string } }>(
        `/api/verses/${encoded}`,
        { params: { version: key, lang: i18n.language } }
      );
      setHistoryOverrideVerse({
        ...currentEntry.verse,
        text: res.data.verse.text,
        version: abbreviation,
      });
    } catch {
      // Silently fall back to the stored verse if the fetch fails
    } finally {
      setHistoryVersionLoading(false);
    }
  }, [currentEntry, i18n.language]);

  // Clear override whenever user moves to a different history entry or returns to today
  useEffect(() => {
    setHistoryOverrideVerse(null);
    setShowComparison(false);
  }, [historyIndex]);

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

  // Swipe left/right to cycle through history
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    // Ignore if swipe distance is too short or vertical scroll dominates
    if (Math.abs(dx) < 50 || dy > Math.abs(dx) * 0.75) return;
    if (dx > 0) goBack();    // swipe left → older verse
    else goForward();         // swipe right → newer verse
  }, [goBack, goForward]);

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

  // Clamp historyIndex in case effectiveHistory shrank (e.g. after a history clear).
  const safeIndex = Math.min(historyIndex, effectiveHistory.length);

  // Build the display date from verse.daily_date with layered guards:
  //   1. Slice to YYYY-MM-DD and validate the format before constructing Date
  //      (PostgreSQL returns "2026-03-07T00:00:00Z"; appending T12:00:00 to the
  //       raw value produces an invalid string → "Invalid Date")
  //   2. Check isNaN after construction — corrupt or missing data triggers fallback
  const rawDailyDate = currentEntry?.verse.daily_date;
  const datePart = rawDailyDate?.slice(0, 10);
  const isValidDateStr = typeof datePart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  const parsedHistoryDate = isValidDateStr ? new Date(datePart + "T12:00:00") : null;
  const isValidHistoryDate = parsedHistoryDate !== null && !isNaN(parsedHistoryDate.getTime());

  // For pre-migration rows where daily_date is NULL, derive the date from viewed_at
  // using the same UTC-10 offset the backend uses to assign verse dates. Using UTC
  // getters on the offset-adjusted timestamp avoids any local-timezone conversion.
  let viewedAtFallback: Date | null = null;
  if (safeIndex > 0 && !isValidHistoryDate && currentEntry?.viewed_at) {
    const effectiveMs = new Date(currentEntry.viewed_at).getTime() - 10 * 60 * 60 * 1000;
    const d = new Date(effectiveMs);
    const ymd =
      `${d.getUTCFullYear()}-` +
      `${String(d.getUTCMonth() + 1).padStart(2, "0")}-` +
      `${String(d.getUTCDate()).padStart(2, "0")}`;
    const candidate = new Date(ymd + "T12:00:00");
    if (!isNaN(candidate.getTime())) viewedAtFallback = candidate;
  }

  const displayDate: Date =
    safeIndex > 0 && isValidHistoryDate ? parsedHistoryDate! :
    viewedAtFallback !== null ? viewedAtFallback :
    new Date();

  // Guard toLocaleDateString: a bad locale tag can throw in some environments.
  const formattedDate = (() => {
    try {
      return displayDate.toLocaleDateString(i18n.language, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return displayDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  })();

  return (
    <div
      className="max-w-3xl mx-auto px-4 pt-4 pb-8 md:py-8"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Streak-related banners and notifications */}
      {!isGuest && (
        <>
          <GraceDayBanner />
          <StreakResetAcknowledgment />
          <FirstEngagementOnboarding />
        </>
      )}
      
      {/* Mobile control row — sits between nav header and h1, hidden on desktop */}
      {!isGuest && (
        <div className="flex items-center justify-between px-4 py-1 md:hidden mb-2">
          {/* Left zone — fixed width so center stays centered */}
          <div className="w-11 flex justify-start">
            {showBack && (
              <div className="animate-fade-in">
                <NavArrow direction="back" onClick={goBack} size="sm" />
              </div>
            )}
          </div>

          {/* Center zone — Today shortcut */}
          <div className="flex items-center justify-center">
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
        {/* Date line: key changes on every new date, triggering the fade-in animation */}
        <p key={formattedDate} className="text-gray-600 dark:text-gray-400 animate-fade-in">
          {formattedDate}
        </p>
        {/* Desktop Today shortcut — only shown when browsing history */}
        {historyIndex > 0 && (
          <p className="mt-1 hidden md:block">
            <button
              onClick={() => setHistoryIndex(0)}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-200"
            >
              ← Today
            </button>
          </p>
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
          ) : historyVersionLoading ? (
            <VerseCardSkeleton />
          ) : (
            <VerseCard
              verse={historyIndex > 0 ? (historyOverrideVerse ?? displayVerse ?? verse) : (displayVerse ?? verse)}
              lang={i18n.language}
              onVersionSelect={
                historyIndex === 0 && !isGuest
                  ? handleVersionSelect
                  : (historyIndex > 0 && isPremium ? handleHistoryVersionSelect : undefined)
              }
            />
          )}
          {/* Compare Translations — premium users, today's and history verses */}
          {isPremium && (displayVerse ?? verse) && (
            <div className="mt-3 flex justify-center">
              {showComparison ? (
                <SideBySideView
                  reference={(historyOverrideVerse ?? displayVerse ?? verse)!.reference}
                  lang={i18n.language}
                  onClose={() => setShowComparison(false)}
                />
              ) : (
                <button
                  onClick={() => setShowComparison(true)}
                  className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors px-2 py-1"
                >
                  {t("verse.compareTranslations", "Compare Translations")}
                </button>
              )}
            </div>
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
        ) : historyVersionLoading ? (
          <VerseCardSkeleton />
        ) : (
          <VerseCard
            verse={historyIndex > 0 ? (historyOverrideVerse ?? displayVerse ?? verse) : (displayVerse ?? verse)}
            lang={i18n.language}
            onVersionSelect={
              historyIndex === 0 && !isGuest
                ? handleVersionSelect
                : (historyIndex > 0 && isPremium ? handleHistoryVersionSelect : undefined)
            }
          />
        )}
        {/* Compare Translations — premium users, today's and history verses */}
        {isPremium && (displayVerse ?? verse) && (
          <div className="mt-3 flex justify-center">
            {showComparison ? (
              <SideBySideView
                reference={(historyOverrideVerse ?? displayVerse ?? verse)!.reference}
                lang={i18n.language}
                onClose={() => setShowComparison(false)}
              />
            ) : (
              <button
                onClick={() => setShowComparison(true)}
                className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline transition-colors px-2 py-1"
              >
                {t("verse.compareTranslations", "Compare Translations")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
