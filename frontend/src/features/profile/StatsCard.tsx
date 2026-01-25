// display user stats

// imports
import React, { useEffect, useState } from "react";
import { profileService } from "../../services/api/profile";

// StatsCard component
//- Total Verses Read
//- Daily Reading Streak
//- Favorites Count
//- Notes Taken
//- Total favorites count
//- Days active streak
//- Account age
//- Beautiful card layout

export const StatsCard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="text-gray-600 dark:text-gray-300">Loading stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Your Statistics
      </h2>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Verses Read
            </h3>
            <p className="text-4xl font-bold text-blue-900 dark:text-blue-100">
              {stats.history_count || 0}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center border border-red-200 dark:border-red-800">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
              Favorites
            </h3>
            <p className="text-4xl font-bold text-red-900 dark:text-red-100">
              {stats.favorite_count || 0}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
              Notes
            </h3>
            <p className="text-4xl font-bold text-green-900 dark:text-green-100">
              {stats.comment_count || 0}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
            <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
              Days Active
            </h3>
            <p className="text-4xl font-bold text-purple-900 dark:text-purple-100">
              {stats.account_age_days || 0}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No statistics available.
        </p>
      )}
    </div>
  );
};
