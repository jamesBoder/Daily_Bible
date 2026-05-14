import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SoundService } from "../../services/SoundService";
import { useSearchParams } from "react-router-dom";
import { useVerse } from "../../hooks/useVerse";
import { useHistory } from "../../hooks/useHistory";
import { useAuth } from "../../hooks/useAuth";
import { useStreak } from "../../contexts/StreakContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useSwipe } from "../../hooks/useSwipe";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import PullRefreshIndicator from "../../components/common/PullRefreshIndicator";
import { VerseCard } from "./VerseCard";
import { SideBySideView } from "./SideBySideView";
import { Button } from "../../components/common/Button";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { useTranslation } from "react-i18next";
import GraceDayBanner from "../../components/GraceDayBanner";
import StreakResetAcknowledgment from "../../components/StreakResetAcknowledgment";
import FirstEngagementOnboarding from "../../components/FirstEngagementOnboarding";
import VisitorEngagementModal from "../../components/VisitorEngagementModal";
import { showBlessingsToast } from "../../components/BlessingsToast";
import api from "../../services/api/api";
import { Verse } from "../../types/verse";
import { HistoryEntry } from "../../types/history";
import SeasonalBanner from "../plans/SeasonalBanner";
import AnnotationPanel from "./AnnotationPanel";
import AnnotationIndicator from "./AnnotationIndicator";


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
        bg-[var(--theme-surface)]/60
        backdrop-blur-sm
        border border-[var(--theme-border)]/80
        shadow-md
        text-[var(--journal-text-muted)]
        hover:bg-primary-50 dark:hover:bg-primary-900/30
        hover:border-primary-300 dark:hover:border-primary-600
        hover:text-primary-600 dark:hover:text-primary-400
        active:scale-95 transition-all duration-150
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
  const { user } = useAuth();
  const { refreshStreak } = useStreak();

  // Per-session version override (key like "kjv", "web"). Empty = use server preference.
  const [sessionVersion, setSessionVersion] = useState<string | undefined>(undefined);
  // Premium status — fetched once for authenticated users to gate Compare button
  const [isPremium, setIsPremium] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  // When a premium user switches translation while browsing a past day, we fetch
  // the verse reference in the new version and display it here.
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [historyOverrideVerse, setHistoryOverrideVerse] = useState<Verse | null>(null);
  const [historyVersionLoading, setHistoryVersionLoading] = useState(false);
  // Verses fetched by date for days the user did not originally view
  const [fetchedVerses, setFetchedVerses] = useState<Record<string, Verse>>({});
  const [isFetchingDate, setIsFetchingDate] = useState(false);
  const [fetchDateError, setFetchDateError] = useState(false);

  const queryClient = useQueryClient();
  const { verse, blessingsCredited, isLoading, error, refetch } = useVerse(i18n.language, sessionVersion);
  const { history } = useHistory(!!user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [historyIndex, setHistoryIndex] = useState(0);

  // Use the same UTC-10 effective date the backend uses so "today" is consistent
  // across history filtering and past-date navigation.
  const now = new Date();
  const effectiveNow = new Date(now.getTime() - 10 * 60 * 60 * 1000);
  const todayStr = effectiveNow.toISOString().split('T')[0];

  // Virtual list of past dates (yesterday, day-before, …) relative to UTC-10 today.
  // Every user can navigate back up to MAX_DAYS_BACK days regardless of whether
  // they viewed the verse on those days.
  const pastDates = useMemo<string[]>(() => {
    const dates: string[] = [];
    for (let i = 1; i <= MAX_DAYS_BACK; i++) {
      const d = new Date(effectiveNow.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(
        `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
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

  // Fetch premium status once when auth state changes — language is irrelevant to subscription.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get<{ user_is_premium: boolean }>('/api/translations')
      .then((res) => {
        if (!cancelled) setIsPremium(res.data.user_is_premium);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  // Fire streak-confirm sound once per session when today's verse loads
  const streakSoundFiredRef = useRef(false);
  useEffect(() => {
    if (verse && historyIndex === 0 && !streakSoundFiredRef.current) {
      SoundService.play('streak-confirm');
      streakSoundFiredRef.current = true;
    }
  }, [verse, historyIndex]);

  // Show blessings toast once per calendar day when the daily verse credits blessings.
  // Guarded by sessionStorage so it doesn't re-fire on every component mount.
  useEffect(() => {
    if (!user || !verse || historyIndex !== 0 || blessingsCredited <= 0) return;
    const sessionKey = `blessings-daily-toasted-${todayStr}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    showBlessingsToast(blessingsCredited, 'daily_view');
    // Delay so this refresh always falls outside the 1-second debounce window
    // (StreakContext fetches streak on mount, ~0ms; verse arrives ~200-800ms later).
    // The backend now writes milestones synchronously before the verse response
    // returns, so a 1.5s delay is more than enough to pick them up.
    const tid = setTimeout(() => refreshStreak().catch(() => {}), 1500);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, blessingsCredited]);

  // Track the previous language so we can detect actual language *changes*
  // (as opposed to initial mount, where we must not nuke the prefetched verse).
  const prevLangRef = useRef(i18n.language);

  // Invalidate cached verses when the language changes so a fresh fetch runs.
  // Guards against stale cache entries keyed to the old language (e.g. a Spanish
  // verse that was seeded under the 'en' key by the index.html prefetch while
  // the preferred_bible_version language-mismatch bug was still present).
  useEffect(() => {
    if (prevLangRef.current !== i18n.language) {
      queryClient.invalidateQueries({ queryKey: ['dailyVerse'] });
      prevLangRef.current = i18n.language;
    }
  }, [i18n.language, queryClient]);

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

  // Clear fetch error and close annotation panel when navigating to a different day
  useEffect(() => {
    setFetchDateError(false);
    setAnnotationOpen(false);
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
  const showBack = !!user && historyIndex < MAX_DAYS_BACK;

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
  const swipeHandlers = useSwipe({ onSwipeLeft: goBack, onSwipeRight: goForward });

  // Pull down to re-fetch today's verse (handy when returning to app)
  const ptr = usePullToRefresh({ onRefresh: () => { refetch(); } });

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
        <div className="bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg p-6 text-center">
          <p className="text-[var(--foreground)]">{t("dailyVerse.error")}</p>
        </div>
      </div>
    );
  }

  // Date display: for past days use targetDate; for today use the verse's daily_date
  // (not new Date()) so the displayed date matches the actual verse, not the browser clock.
  // This prevents the date from jumping to "tomorrow" at midnight before the verse rolls over.
  const displayDate: Date = (() => {
    if (historyIndex > 0 && targetDate) return new Date(targetDate + "T12:00:00");
    if (verse?.daily_date) return new Date(verse.daily_date.slice(0, 10) + "T12:00:00");
    return new Date();
  })();

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

  // The verse to render (with override for premium translation switching).
  // On past days, do NOT fall back to today's verse — use null so the skeleton shows.
  const renderedVerse =
    historyIndex > 0
      ? (historyOverrideVerse ?? displayVerse ?? null)
      : (displayVerse ?? verse);

  return (
    <div
      className="max-w-3xl mx-auto px-4 pt-1 pb-8 md:pt-4 md:pb-8"
      onTouchStart={(e) => { swipeHandlers.onTouchStart(e); ptr.onTouchStart(e); }}
      onTouchMove={ptr.onTouchMove}
      onTouchEnd={(e) => { swipeHandlers.onTouchEnd(e); ptr.onTouchEnd(); }}
    >
      <PullRefreshIndicator progress={ptr.pullProgress} isRefreshing={ptr.isRefreshing} />
      {/* Seasonal reading plan banner */}
      {!!user && <SeasonalBanner />}

      {/* Visitor nudge — shown once to unauthenticated users after a short delay */}
      {!user && <VisitorEngagementModal />}

      {/* Streak-related banners and notifications */}
      {!!user && (
        <>
          <GraceDayBanner />
          <StreakResetAcknowledgment />
          <FirstEngagementOnboarding />
        </>
      )}

      {/* Title + date row with inline nav arrows */}
      <div className="text-center mb-4">
        <h1 className="text-xl md:text-2xl font-display font-bold text-primary-600 dark:text-primary-400 mb-2 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
          {t("dailyVerse.title")}
        </h1>

        {/* Date line with nav arrows on either side */}
        <div className="flex items-center justify-center gap-4">
          {/* Left arrow — always reserves space to keep date centered */}
          <div className="w-11 flex justify-center">
            {showBack && !!user && (
              <div className="animate-fade-in">
                <NavArrow direction="back" onClick={goBack} size="sm" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <p key={formattedDate} className="text-[var(--journal-text-muted)] animate-fade-in">
              {formattedDate}
            </p>
            {historyIndex > 0 && (
              <div className="mt-1">
                <TodayButton onClick={() => setHistoryIndex(0)} />
              </div>
            )}
          </div>

          {/* Right arrow */}
          <div className="w-11 flex justify-center">
            {showForward && (
              <div className="animate-fade-in">
                <NavArrow direction="forward" onClick={goForward} size="sm" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card — full width on both mobile and desktop */}
      {/* key forces React to replay animate-content-fade-in when transitioning skeleton → content */}
      <div key={verseAreaLoading ? 'skeleton' : 'content'} className={verseAreaLoading ? '' : 'animate-content-fade-in'}>
        {verseAreaLoading ? (
          <VerseCardSkeleton />
        ) : fetchDateError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400 text-sm">{t("dailyVerse.error")}</p>
          </div>
        ) : (
          <VerseCard
            verse={renderedVerse!}
            lang={i18n.language}
            onVersionSelect={
              historyIndex === 0 && !!user
                ? handleVersionSelect
                : (historyIndex > 0 && isPremium ? handleHistoryVersionSelect : undefined)
            }
          />
        )}
        {/* Annotations button — shown for authenticated users on today's verse */}
        {!!user && historyIndex === 0 && renderedVerse && (
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setAnnotationOpen(true); }}
              className="flex items-center gap-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 hover:opacity-75 transition-opacity px-2 py-1"
            >
              <AnnotationIndicator verseReference={renderedVerse.reference} />
              {t('annotation.addNote', 'Add a note')}
            </button>
          </div>
        )}

        {/* Compare Translations — premium users, today's and history verses */}
        {isPremium && renderedVerse && (
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

      {/* Annotation bottom sheet / sidebar */}
      {!!user && renderedVerse && (
        <AnnotationPanel
          verseReference={renderedVerse.reference}
          isOpen={annotationOpen}
          onClose={() => setAnnotationOpen(false)}
        />
      )}
    </div>
  );
};
