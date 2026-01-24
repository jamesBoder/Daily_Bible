import React from "react";
import { useFavorites } from "../../hooks/useFavorites";
import { Loading } from "../../components/common/Loading";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { CommentSection } from "../verse/CommentSection";

export const FavoritesList: React.FC = () => {
  const { favorites, isLoading, error, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  const handleRemove = async (favoriteId: number) => {
    if (!window.confirm("Remove this verse from favorites?")) {
      return;
    }

    setRemovingId(favoriteId);
    try {
      await removeFavorite(favoriteId);
    } catch (err) {
      alert("Failed to remove favorite");
    } finally {
      setRemovingId(null);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Favorites</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {favorites.length} {favorites.length === 1 ? "verse" : "verses"} saved
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4"
              fill="none"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start adding verses to your favorites to see them here
            </p>
            <Button
              onClick={() => (window.location.href = "/daily")}
              variant="primary"
            >
              View Daily Verse
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="relative">
              {/* Verse content */}
              <div className="mb-4">
                <p className="text-lg text-gray-800 dark:text-gray-200 font-serif leading-relaxed mb-4">
                  {favorite.verse?.text}
                </p>
                <p className="text-md font-semibold text-primary-700 dark:text-primary-400">
                  {favorite.verse?.reference}
                </p>
                {favorite.verse?.version && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {favorite.verse.version}
                  </p>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
                <span>
                  Added {new Date(favorite.created_at).toLocaleDateString()}
                </span>
                <Button
                  onClick={() => handleRemove(favorite.id)}
                  variant="danger"
                  isLoading={removingId === favorite.id}
                  className="text-sm"
                >
                  Remove
                </Button>
              </div>
              <CommentSection
                verseId={favorite.verse_id}
                verseReference={favorite.verse?.reference || ""}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
