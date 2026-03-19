import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { SoundService } from "../../services/SoundService";
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
import { Verse } from "../../types/verse";
import { HistoryEntry } from "../../types/history";


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

// Max number of days users can navigate back
const MAX_DAYS_BACK = 30;

export const DailyVerse: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isGuest } = useAuth();

  // Per-session version override (key like "kjv", "web"). Empty = use server preference.
  const [sessionVersion, setSessionVersion] = useState<string | undefined>(undefined);
  // Premium status — fetched once for authenticated users to gate Compare button
  const [isPremium, setIsPremium] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  // When a premium user switches translation while browsing a past day, we fetch
  // the verse reference in the new version and display it here.
  const [historyOverrideVerse, setHistoryOverrideVerse] = useState<Verse | null>(null);
  const [historyVersionLoading, setHistoryVersionLoading] = useState(false);
  // Verses fetched by date for days the user did not originally view
  const [fetchedVerses, setFetchedVerses] = useState<Record<string, Verse>>({});
  const [isFetchingDate, setIsFetchingDate] = useState(false);
  const [fetchDateError, setFetchDateError] = useState(false);

  const { verse, isLoading, error, refetch } = useVerse(i18n.language, sessionVersion);
  const { history } = useHistory(!isGuest);
  const [searchParams, setSearchParams] = useSearchParams();

  const [historyIndex, setHistoryIndex] = useState(0);

  // Build today's date string in local timezone (YYYY-MM-DD)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Virtual list of past dates (yesterday, day-before, …) in local timezone.
  // Every user can navigate back up to MAX_DAYS_BACK days regardless of whether
  // they viewed the verse on those days.
  const pastDates = useMemo<string[]>(() => {
    const dates: string[] = [];
    for (let i = 1; i <= MAX_DAYS_BACK; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      dates.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
    return dates;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayStr]);

  // Map date string → history entry for quick look-up (skips today's entry)
  const historyByDate = useMemo<Record<string, HistoryEntry>>(() => {
    const map: Record<string, HistoryEntry> = {};
    for (const entry of history) {
      const date = entry.verse?.daily_date?.slice(0, 10);
      if (date && date !== todayStr) {
        map[date] = entry;
      }
    }
    return map;
  }, [history, todayStr]);

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

  // Fire streak-confirm sound once per session when today's verse loads
  const streakSoundFiredRef = useRef(false);
  useEffect(() => {
    if (verse && historyIndex === 0 && !streakSoundFiredRef.current) {
      SoundService.play('streak-confirm');
      streakSoundFiredRef.current = true;
    }
  }, [verse, historyIndex]);

  // Reset index + session version when language changes
  useEffect(() => {
    setHistoryIndex(0);
    setSessionVersion(undefined);
    setShowComparison(false);
    setFetchedVerses({});
  }, [i18n.language]);

  // Derive the target date and its verse when browsing past days
  const targetDate = historyIndex > 0 ? (pastDates[historyIndex - 1] ?? null) : null;
  const historyEntryForDate = targetDate ? (historyByDate[targetDate] ?? null) : null;
  const fetchedVerse = targetDate ? (fetchedVerses[targetDate] ?? null) : null;
  // The "active" past verse: from history if the user viewed it, otherwise from the API fetch
  const activeVerse = historyEntryForDate?.verse ?? fetchedVerse;

  // Clear fetch error when navigating to a different day
  useEffect(() => {
    setFetchDateError(false);
  }, [historyIndex]);

  // Fetch verse for the target date when it's not in the user's view history
  useEffect(() => {
    if (!targetDate || historyEntryForDate || fetchedVerses[targetDate]) return;
    let cancelled = false;
    setIsFetchingDate(true);
    setFetchDateError(false);
    api
      .get<{ verse: Verse }>("/api/verses/daily", {
        params: { date: targetDate, lang: i18n.language },
      })
      .then((res) => {
        if (!cancelled) {
          setFetchedVerses((prev) => ({ ...prev, [targetDate]: res.data.verse }));
        }
      })
      .catch(() => {
        if (!cancelled) setFetchDateError(true);
      })
      .finally(() => {
        if (!cancelled) setIsFetchingDate(false);
      });
    return () => { cancelled = true; };
  }, [targetDate, historyEntryForDate, fetchedVerses, i18n.language]);

  // If the calendar linked to a specific date, jump there once pastDates is ready
  const dateParam = searchParams.get("date");
  useEffect(() => {
    if (!dateParam) return;
    const idx = pastDates.findIndex((d) => d === dateParam);
    if (idx !== -1) {
      setHistoryIndex(idx + 1);
    }
    setSearchParams({}, { replace: true });
  }, [dateParam, pastDates, setSearchParams]);

  const displayVerse = historyIndex === 0 ? verse : (activeVerse ?? null);
  const showForward = historyIndex > 0;
  const showBack = !isGuest && historyIndex < MAX_DAYS_BACK;

  const handleVersionSelect = useCallback((key: string) => {
    setSessionVersion(key);
    setShowComparison(false);
  }, []);

  // Fetch a past day's verse in a different translation (premium users only)
  const handleHistoryVersionSelect = useCallback(async (key: string, abbreviation: string) => {
    if (!activeVerse) return;
    setHistoryVersionLoading(true);
    try {
      const encoded = encodeURIComponent(activeVerse.reference);
      const res = await api.get<{ verse: { text: string } }>(
        `/api/verses/${encoded}`,
        { params: { version: key, lang: i18n.language } }
      );
      setHistoryOverrideVerse({
        ...activeVerse,
        text: res.data.verse.text,
        version: abbreviation,
      });
    } catch {
      // Silently fall back to the stored verse if the fetch fails
    } finally {
      setHistoryVersionLoading(false);
    }
  }, [activeVerse, i18n.language]);

  // Clear override whenever user moves to a different day
  useEffect(() => {
    setHistoryOverrideVerse(null);
    setShowComparison(false);
  }, [historyIndex]);

  // Stable callback refs so useKeyboardShortcuts' effect doesn't thrash
  const goBack = useCallback(() => {
    if (historyIndex < MAX_DAYS_BACK) setHistoryIndex((i) => i + 1);
  }, [historyIndex]);

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
    if (Math.abs(dx) < 50 || dy > Math.abs(dx) * 0.75) return;
    if (dx > 0) goBack();
    else goForward();
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

  // Date display: use targetDate directly for past days (it's already YYYY-MM-DD)
  const displayDate: Date =
    historyIndex > 0 && targetDate
      ? new Date(targetDate + "T12:00:00")
      : new Date();

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

  // Whether the verse area is loading (skeleton)
  const verseAreaLoading =
    ((historyIndex > 0 && activeVerse === null) || isFetchingDate || historyVersionLoading) &&
    !fetchDateError;

  // The verse to render (with override for premium translation switching)
  const renderedVerse =
    historyIndex > 0
      ? (historyOverrideVerse ?? displayVerse ?? verse)
      : (displayVerse ?? verse);

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
          {verseAreaLoading ? (
            <VerseCardSkeleton />
          ) : fetchDateError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
              <p className="text-red-700 dark:text-red-400 text-sm">{t("dailyVerse.error")}</p>
            </div>
          ) : (
            <VerseCard
              verse={renderedVerse}
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
                  reference={renderedVerse.reference}
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
        {verseAreaLoading ? (
          <VerseCardSkeleton />
        ) : fetchDateError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400 text-sm">{t("dailyVerse.error")}</p>
          </div>
        ) : (
          <VerseCard
            verse={renderedVerse}
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
                reference={renderedVerse.reference}
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
