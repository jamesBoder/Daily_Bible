import React, { useState, useEffect } from "react";
import { Verse } from "../../types/verse";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CommentSection } from "../verse/CommentSection";
import { useFavorites } from "../../hooks/useFavorites";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";

// ── Share helpers ─────────────────────────────────────────────────────────────
const buildShareText = (verse: Verse): string => {
  const version = verse.version || verse.translation;
  const appUrl = window.location.hostname;
  return `"${verse.text}" — ${verse.reference}${version ? ` (${version})` : ""}\n\nvia Daily Bible App 👉 ${appUrl}`;
};

interface VerseCardProps {
  verse: Verse;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse }) => {
  const { isGuest } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const { isFavorited, getFavoriteId, addFavorite, removeFavorite } =
    useFavorites();
  const [isCopied, setIsCopied] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const handleCommentSaved = async () => {
    // Guard — CommentSection is hidden for guests
    if (isGuest) return;
    if (!isFavorited(verse.id)) {
      try {
        await addFavorite(verse.id);
      } catch {
        // Silently ignore errors
      }
    }
  };

  const handleFavorite = async () => {
    // Guest mode: show sign-up prompt instead of calling the API
    if (isGuest) {
      showToast.info("Sign up to save your favorite verses!");
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
        }
      } else {
        // Add to favorites
        await addFavorite(verse.id);
      }
    } catch (err: any) {
      setFavoriteError(err.message);
      setTimeout(() => setFavoriteError(null), 3000);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // ── Share handler (copy only) ────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText(verse));
      setIsCopied(true);
      showToast.success("Verse copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      showToast.error("Failed to copy verse");
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

  // Keyboard shortcut: f = favorite, c = copy
  useKeyboardShortcuts([
    {
      key: 'f',
      callback: handleFavorite,
    },
    {
      key: 'c',
      callback: handleCopy,
    },
  ]);

  return (
    <Card className={`relative transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Decorative quote mark */}
      <div className="absolute top-4 left-4 text-6xl text-primary-100 dark:text-primary-900 font-serif">
        "
      </div>

      {/* Verse text */}
      <div className="relative z-10 mb-6">
        <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-serif leading-relaxed text-center px-8 py-4">
          {verse.text}
        </p>
      </div>

      {/* Reference */}
      <div className="text-center mb-6">
        <p className="text-xl font-display font-semibold text-primary-700 dark:text-primary-400 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
          {verse.reference}
        </p>
        {verse.version && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {verse.version}
          </p>
        )}
      </div>

      {/* Error message */}
      {favoriteError && (
        <div className="mb-4 text-center">
          <p className="text-sm text-red-600">{favoriteError}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3 mb-4">
        <Button
          onClick={handleFavorite}
          variant="secondary"
          isLoading={isFavoriteLoading}
          className="flex items-center gap-2"
          aria-label={isVerseAlreadyFavorited ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isVerseAlreadyFavorited}
        >
          <svg
            className={`w-5 h-5 ${isVerseAlreadyFavorited ? "fill-red-500" : "fill-none"}`}
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
          {isVerseAlreadyFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
        </Button>

        <Button
          onClick={handleCopy}
          variant="secondary"
          className={`flex items-center gap-2 ${isCopied ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
        >
          {isCopied ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
          {isCopied ? 'Copied!' : 'Copy Verse'}
        </Button>
      </div>

      {/* Comment section — hidden for guests */}
      {!isGuest && (
        <CommentSection
          verseId={verse.id}
          verseReference={verse.reference}
          onCommentSaved={handleCommentSaved}
        />
      )}
    </Card>
  );
};