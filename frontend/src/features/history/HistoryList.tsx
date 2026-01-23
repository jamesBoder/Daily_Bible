// History List component

// imports
import React from "react";
import { useHistory } from "../../hooks/useHistory";
import { Loading } from "../../components/common/Loading";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export const HistoryList: React.FC = () => {
  const { history, isLoading, error, clearHistory } = useHistory();
  const [clearing, setClearing] = React.useState(false);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your history?")) {
      return;
    }

    setClearing(true);
    try {
      await clearHistory();
    } catch (err) {
      alert("Failed to clear history");
    } finally {
      setClearing(false);
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
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My History</h1>
        <Button
          onClick={handleClearHistory}
          disabled={clearing || history.length === 0}
          variant="danger"
        >
          {clearing ? "Clearing..." : "Clear History"}
        </Button>
      </div>

      {history.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-600">Your history is empty.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <Card key={entry.id}>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-primary-600 mb-2">
                    {entry.verse?.reference || "Unknown Reference"}
                  </h3>
                  <p className="text-gray-800 leading-relaxed">
                    {entry.verse?.text || "Verse text not available"}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <span>
                    {entry.verse?.book &&
                    entry.verse?.chapter &&
                    entry.verse?.verse
                      ? `${entry.verse.book} ${entry.verse.chapter}:${entry.verse.verse}`
                      : ""}
                  </span>
                  <span>
                    Viewed: {new Date(entry.viewed_at).toLocaleDateString()} at{" "}
                    {new Date(entry.viewed_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
