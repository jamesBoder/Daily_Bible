import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Verse } from "../../types/verse";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CommentSection } from "../verse/CommentSection";
import { useFavorites } from "../../hooks/useFavorites";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { useTranslation } from "react-i18next";
import { TranslationBadge } from "./TranslationBadge";
import { TranslationSwitcherPopover } from "./TranslationSwitcherPopover";
import { verseService } from "../../services/api/verse";
import { showBlessingsToast } from "../../components/BlessingsToast";
import { useStreak } from "../../contexts/StreakContext";
import { SoundService } from "../../services/SoundService";
import posthog from "posthog-js";

// ── Share helpers ─────────────────────────────────────────────────────────────

// Visible copy-paste block — displayed in the UI and copied to clipboard
const buildCopyBlock = (verse: Verse): string => {
  const version = verse.version || verse.translation;
  const versionStr = version ? ` (${version})` : '';
  const dateStr = verse.daily_date
    ? new Date(verse.daily_date + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null;
  const header = dateStr ? `Today's Verse · ${dateStr}\n\n` : '';
  return `${header}"${verse.text}"\n— ${verse.reference}${versionStr}\n\nwordsofpraise.app`;
};

// Social share text — includes the app URL and a friendlier intro
const buildShareText = (verse: Verse): string => {
  const version = verse.version || verse.translation;
  const appUrl = window.location.hostname;
  return `"${verse.text}" — ${verse.reference}${version ? ` (${version})` : ""}\n\nvia Words of Praise 👉 ${appUrl}`;
};

interface VerseCardProps {
  verse: Verse;
  lang?: string;
  onVersionSelect?: (key: string, abbreviation: string) => void;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse, lang = "en", onVersionSelect }) => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const { isFavorited, getFavoriteId, addFavorite, removeFavorite } =
    useFavorites();
  const [isCopied, setIsCopied]           = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [justFavorited, setJustFavorited] = useState(false);
  const [heartbeatKey, setHeartbeatKey] = useState(0);

  const handleCommentSaved = async () => {
    // Guard — CommentSection is hidden for unauthenticated users, but safety net
    if (!user) return;
    if (!isFavorited(verse.id)) {
      try {
        await addFavorite(verse.id);
      } catch {
        // Silently ignore errors (e.g. already favorited race condition)
      }
    }
  };

  const handleFavorite = async () => {
    // Unauthenticated: show a friendly sign-up nudge instead of calling the API
    if (!user) {
      showToast.info("Sign up free to save your favorite verses!");
      return;
    }

    setIsFavoriteLoading(true);
    setFavoriteError(null);

    try {
      if (isFavorited(verse.id)) {
        // Remove from favorites
        const favoriteId = getFavoriteId(verse.id);
        if (favoriteId) {
          await removeFavorite(favoriteId);
          if (navigator.vibrate) navigator.vibrate(10);
        }
      } else {
        // Add to favorites
        await addFavorite(verse.id);
        SoundService.play('verse-favorite');
        if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
        setHeartbeatKey(k => k + 1);
        setJustFavorited(true);
        setTimeout(() => setJustFavorited(false), 600);
      }
    } catch (err: any) {
      setFavoriteError(err.message);
      setTimeout(() => setFavoriteError(null), 3000);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // ── Share helpers ─────────────────────────────────────────────────────────
  // Called once after any share action succeeds. Fire-and-forget — never blocks UI.
  const { refreshStreak } = useStreak();
  const queryClient = useQueryClient();
  const creditShareBlessings = () => {
    if (!user) return;
    verseService.recordShare().then(({ blessings_credited, discipline_completed }) => {
      if (blessings_credited > 0) {
        showBlessingsToast(blessings_credited, 'verse_shared');
        refreshStreak().catch(() => {});
      }
      if (discipline_completed) {
        queryClient.invalidateQueries({ queryKey: ['disciplines', 'today'] });
      }
    });
  };

  // ── Share handlers ────────────────────────────────────────────────────────
  const trackShare = (method: string) =>
    posthog.capture('verse_shared', { method, reference: verse.reference });

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(buildCopyBlock(verse));
      setIsCopied(true);
      if (navigator.vibrate) navigator.vibrate(15);
      setTimeout(() => setIsCopied(false), 2500);
      creditShareBlessings();
      trackShare('copy');
    } catch {
      showToast.error('Could not copy to clipboard');
    }
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
    creditShareBlessings();
    trackShare('twitter');
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    creditShareBlessings();
    trackShare('whatsapp');
  };

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(buildShareText(verse));
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, "_blank", "noopener,noreferrer");
    creditShareBlessings();
    trackShare('facebook');
  };

  const handleInstagramShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(buildCopyBlock(verse));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast.error('Could not copy to clipboard');
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    creditShareBlessings();
    trackShare('instagram');
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({ title: "Bible Verse", text: buildShareText(verse) });
      creditShareBlessings();
      trackShare('native');
    } catch (err: any) {
      // AbortError = user cancelled the share sheet — ignore it
      if (err?.name !== 'AbortError') {
        showToast.error('Could not share verse');
      }
    }
  };


  const isVerseAlreadyFavorited = isFavorited(verse.id);

  // Fade in effect when verse changes
  useEffect(() => {
    // Fade out
    setIsVisible(false);
    
    // Fade in after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [verse.reference]); // Trigger when verse reference changes

  // Keyboard shortcut: f = favorite
  useKeyboardShortcuts([
    {
      key: 'f',
      callback: handleFavorite,
    },
  ]);

  return (
    <Card
      className={`relative transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Decorative quote mark */}
      <div className="absolute top-4 left-4 text-4xl text-primary-100 dark:text-primary-900 font-serif">
        "
      </div>

      {/* Verse text */}
      <div className="relative z-10 mb-6">
        <p
          className="text-[var(--foreground)] font-serif leading-relaxed text-center px-8 py-4"
          style={{ fontSize: 'var(--verse-font-size, clamp(1rem, 4.5vw, 1.25rem))' }}
        >
          {verse.text}
        </p>
      </div>

      {/* Reference */}
      <div className="text-center mb-6">
        <p className="text-sm md:text-base font-display font-semibold text-primary-700 dark:text-primary-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.12)] dark:drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
          {verse.reference}
        </p>
        {/* Translation badge — authenticated users only */}
        {!!user && verse.version && onVersionSelect && (
          <div ref={badgeRef} className="relative inline-block mt-1.5">
            <TranslationBadge
              version={verse.version}
              onClick={() => setPopoverOpen((o) => !o)}
            />
            {popoverOpen && (
              <TranslationSwitcherPopover
                lang={lang || i18n.language}
                currentVersion={verse.version}
                onVersionSelect={onVersionSelect}
                onClose={() => setPopoverOpen(false)}
                anchorRef={badgeRef}
              />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {favoriteError && (
        <div className="mb-4 text-center">
          <p className="text-sm text-red-600">{favoriteError}</p>
        </div>
      )}

      {/* Favorite button */}
      <div className="flex justify-center mb-4">
        <Button
          onClick={handleFavorite}
          variant="secondary"
          isLoading={isFavoriteLoading}
          className="flex items-center gap-2"
          aria-label={isVerseAlreadyFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isVerseAlreadyFavorited}
        >
          <svg
            key={justFavorited ? heartbeatKey : 0}
            className={`w-5 h-5 ${isVerseAlreadyFavorited ? "fill-red-500" : "fill-none"} ${justFavorited ? "animate-heartbeat" : ""}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {isVerseAlreadyFavorited ? t('verse.removeFromFavorites') : t('verse.addToFavorites')}
        </Button>
      </div>

      {/* Share panel — always visible on Daily Verse page */}
      <div className="border-t border-[var(--theme-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--journal-text-muted)] uppercase tracking-wide mb-3 text-center">
          {t('verse.share', 'Share')}
        </p>

        {/* ── Copy-paste block ── */}
        <div className="mb-4">
          <button
            onClick={() => handleCopy()}
            aria-label="Copy verse to clipboard"
            className={`mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isCopied
                ? 'bg-green-500 text-white focus:ring-green-400'
                : 'bg-[var(--theme-surface)] text-[var(--foreground)] hover:opacity-80 focus:ring-[var(--candle-amber)]'
            }`}
          >
            {isCopied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {t('verse.copied', 'Copied!')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {t('verse.copyVerse', 'Copy Verse')}
              </>
            )}
          </button>
        </div>

        {/* ── Social share icons ── */}
        <p className="text-xs text-[var(--journal-text-muted)] mb-2 text-center">
          {t('verse.shareOn', 'Share on')}
        </p>
        <div className="flex items-center justify-center gap-2">
          {/* Twitter / X */}
          <button
            onClick={handleTwitterShare}
            aria-label="Share on Twitter / X"
            title="Share on Twitter / X"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-black text-white hover:bg-gray-900 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-600"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5d] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#25D366]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            aria-label="Share on Facebook"
            title="Share on Facebook"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1877F2]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagramShare}
            aria-label="Share on Instagram (copies text, opens Instagram)"
            title="Share on Instagram (copies text, opens Instagram)"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white hover:opacity-90 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#ee2a7b]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </button>

          {/* Native Share (only if supported) */}
          {typeof navigator !== "undefined" && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              aria-label="Share via device share sheet"
              title="Share via device share sheet"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Comment section — hidden for guests (Pitfall 5: also removes 'c' keyboard shortcut) */}
      {!!user && (
        <CommentSection
          verseId={verse.id}
          verseReference={verse.reference}
          onCommentSaved={handleCommentSaved}
        />
      )}
    </Card>
  );
};
