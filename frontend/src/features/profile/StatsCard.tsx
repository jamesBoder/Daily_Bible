// display user stats

// imports
import React, { useEffect, useState } from "react";
import { profileService } from "../../services/api/profile";
import { useAuth } from "../../hooks/useAuth";

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
  const { user } = useAuth();
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
    return <div>Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Total Verses Read</h3>
            <p className="text-3xl">{stats.totalVersesRead}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Daily Reading Streak</h3>
            <p className="text-3xl">{stats.dailyStreak} days</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Favorites Count</h3>
            <p className="text-3xl">{stats.favoritesCount}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Notes Taken</h3>
            <p className="text-3xl">{stats.notesCount}</p>
          </div>
        </div>
      ) : (
        <p>No statistics available.</p>
      )}
    </div>
  );
};
