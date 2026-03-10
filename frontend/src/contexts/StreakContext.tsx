import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api/api';

interface Milestone {
  key: string;
  days_required: number;
  name: string;
  blessings_awarded: number;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  grace_days_remaining: number;
  grace_days_reset_at: string | null;
  streak_recoverable: boolean;
  blessings_balance: number;
  next_milestone: Milestone | null;
  newly_achieved_milestone: Milestone | null;
}

interface StreakContextType {
  streakData: StreakData | null;
  loading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
  useGraceDay: () => Promise<{ success: boolean; error?: string }>;
  dismissMilestone: (key: string) => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastFetchRef = useRef<number>(0);

  // Debounced refresh function to prevent rapid API calls
  const refreshStreak = useCallback(async () => {
    // Prevent refresh if called within 1 second of last fetch
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }

    if (!isAuthenticated) {
      setStreakData(null);
      return;
    }

    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    setLoading(true);
    setError(null);
    lastFetchRef.current = now;

    try {
      const response = await api.get('/streak');
      setStreakData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch streak data:', err);
      setError(err.response?.data?.error || 'Failed to load streak data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Use grace day action
  const useGraceDay = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await api.post('/streak/grace-day');
      await refreshStreak();
      return { success: true };
    } catch (err: any) {
      const errorKey = err.response?.data?.error_key;
      let errorMessage = 'Failed to use grace day';
      
      // Map error keys to user-friendly messages
      switch (errorKey) {
        case 'NO_GRACE_DAYS':
          errorMessage = 'You have no grace days remaining';
          break;
        case 'STREAK_NOT_BROKEN':
          errorMessage = 'Your streak is not broken';
          break;
        case 'GRACE_PERIOD_EXPIRED':
          errorMessage = 'The grace period has expired';
          break;
        case 'ALREADY_USED_TODAY':
          errorMessage = 'You have already used a grace day today';
          break;
      }
      
      return { success: false, error: errorMessage };
    }
  }, [isAuthenticated, refreshStreak]);

  // Dismiss milestone celebration
  const dismissMilestone = useCallback(async (key: string) => {
    if (!isAuthenticated) return;

    try {
      await api.post(`/milestones/${key}/dismiss`);
      await refreshStreak();
    } catch (err) {
      console.error('Failed to dismiss milestone:', err);
    }
  }, [isAuthenticated, refreshStreak]);

  // Initial load and auth change
  useEffect(() => {
    if (isAuthenticated) {
      refreshStreak();
    } else {
      setStreakData(null);
    }
  }, [isAuthenticated, refreshStreak]);

  // Refresh on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Debounce the refresh by 500ms
        refreshTimeoutRef.current = setTimeout(() => {
          refreshStreak();
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, refreshStreak]);

  // Refresh at midnight to update streak
  useEffect(() => {
    if (!isAuthenticated) return;

    const scheduleNextRefresh = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 5, 0); // 5 seconds after midnight
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      return setTimeout(() => {
        refreshStreak();
        // Schedule next refresh
        scheduleNextRefresh();
      }, msUntilMidnight);
    };

    const timeoutId = scheduleNextRefresh();
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, refreshStreak]);

  return (
    <StreakContext.Provider
      value={{
        streakData,
        loading,
        error,
        refreshStreak,
        useGraceDay,
        dismissMilestone,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};