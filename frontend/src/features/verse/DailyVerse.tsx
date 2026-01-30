import React from "react";
import { useVerse } from "../../hooks/useVerse";
import { VerseCard } from "./VerseCard";
import { Loading } from "../../components/common/Loading";
import { Button } from "../../components/common/Button";

export const DailyVerse: React.FC = () => {
  const { verse, isLoading, error, refetch } = useVerse();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6 text-center">
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => refetch()} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-700 dark:text-gray-400">
            No verse available today
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-primary-600 mb-2">
          Today's Verse
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <VerseCard verse={verse} />
    </div>
  );
};
