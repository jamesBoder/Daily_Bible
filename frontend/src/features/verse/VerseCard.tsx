import React, { useState } from "react";
import { Verse } from "../../types/verse";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

interface VerseCardProps {
  verse: Verse;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleFavorite = async () => {
    // TODO: Implement favorite functionality in Week 6
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      if (navigator.share) {
        await navigator.share({
          title: verse.reference,
          text: `${verse.text}\n\n- ${verse.reference}`,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${verse.text}\n\n- ${verse.reference}`
        );
        alert("Verse copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="relative">
      {/* Decorative quote mark */}
      <div className="absolute top-4 left-4 text-6xl text-primary-100 font-serif">
        "
      </div>

      {/* Verse text */}
      <div className="relative z-10 mb-6">
        <p className="text-xl md:text-2xl text-gray-800 font-serif leading-relaxed text-center px-8 py-4">
          {verse.text}
        </p>
      </div>

      {/* Reference */}
      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-primary-700">
          {verse.reference}
        </p>
        {verse.version && (
          <p className="text-sm text-gray-500 mt-1">{verse.version}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleFavorite}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <svg
            className={`w-5 h-5 ${isFavorited ? "fill-red-500" : "fill-none"}`}
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
          {isFavorited ? "Favorited" : "Favorite"}
        </Button>

        <Button
          onClick={handleShare}
          variant="secondary"
          isLoading={isSharing}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </Button>
      </div>
    </Card>
  );
};
