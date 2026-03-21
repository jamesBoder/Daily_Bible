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

interface SubscriptionData {
  status: string;               // 'none' | 'active' | 'trialing' | 'canceled' | 'past_due'
  plan: string;                 // 'monthly' | 'annual' | ''
  is_premium: boolean;
  period_end: string | null;
  canceled_at: string | null;
  owned_purchase_keys: string[]; // non-consumable OTP product keys the user has purchased
}

interface StreakContextType {
  streakData: StreakData | null;
  loading: boolean;
  error: string | null;
  refreshStreak: () => Promise<void>;
  useGraceDay: () => Promise<{ success: boolean; error?: string }>;
  dismissMilestone: (key: string) => Promise<void>;
  // Subscription
  subscription: SubscriptionData | null;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  startCheckout: (plan: string) => Promise<void>;
  startOneTimePurchase: (productKey: string) => Promise<void>;
  openPortal: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  status: 'none',
  plan: '',
  is_premium: false,
  period_end: null,
  canceled_at: null,
  owned_purchase_keys: [],
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

export const StreakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastFetchRef = useRef<number>(0);
  const lastSubFetchRef = useRef<number>(0);

  // Debounced refresh function to prevent rapid API calls
  const refreshStreak = useCallback(async () => {
    // Prevent refresh if called within 1 second of last fetch
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) {
      return;
    }

    if (!isAuthenticated || isGuest) {
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
      const response = await api.get('/api/streak');
      setStreakData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch streak data:', err);
      setError(err.response?.data?.error || 'Failed to load streak data');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshSubscription = useCallback(async () => {
    const now = Date.now();
    if (now - lastSubFetchRef.current < 1000) return;
    if (!isAuthenticated || isGuest) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      return;
    }

    setSubscriptionLoading(true);
    lastSubFetchRef.current = now;
    try {
      const res = await api.get('/api/subscription/status');
      setSubscription(res.data);
    } catch {
      // Non-fatal — leave previous state or default
      setSubscription(prev => prev ?? DEFAULT_SUBSCRIPTION);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [isAuthenticated, isGuest]);

  // §8.18.2 — Recover a pending Stripe redirect that was interrupted
  const checkPendingCheckout = useCallback(async () => {
    const url = sessionStorage.getItem('pendingStripeUrl');
    const type = sessionStorage.getItem('pendingStripeType');
    const initiatedAt = sessionStorage.getItem('pendingStripeInitiatedAt');
    if (!url || !initiatedAt) return;

    const age = Date.now() - Number(initiatedAt);
    // Abandon after 30 minutes — Stripe sessions expire in 24 h but
    // after 30 min there is no practical reason to keep redirecting.
    if (age > 30 * 60 * 1000) {
      sessionStorage.removeItem('pendingStripeUrl');
      sessionStorage.removeItem('pendingStripeType');
      sessionStorage.removeItem('pendingStripeInitiatedAt');
      return;
    }

    // If we are back on this page and less than 30 min have passed,
    // redirect the user to complete the checkout.
    console.info(`[StreakContext] Resuming pending Stripe ${type ?? 'checkout'}`);
    window.location.href = url;
  }, []);

  // Use grace day action
  const useGraceDay = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      await api.post('/api/streak/grace-day');
      await refreshStreak();
      return { success: true };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to use grace day';
      return { success: false, error: message };
    }
  }, [isAuthenticated, refreshStreak]);

  // Dismiss milestone celebration
  const dismissMilestone = useCallback(async (key: string) => {
    if (!isAuthenticated) return;

    try {
      await api.post(`/api/milestones/${key}/dismiss`);
      await refreshStreak();
    } catch (err) {
      console.error('Failed to dismiss milestone:', err);
    }
  }, [isAuthenticated, refreshStreak]);

  const startCheckout = useCallback(async (plan: string) => {
    const res = await api.post('/api/subscription/checkout', { plan });
    const { url } = res.data;
    sessionStorage.setItem('pendingStripeUrl', url);
    sessionStorage.setItem('pendingStripeType', 'subscription');
    sessionStorage.setItem('pendingStripeInitiatedAt', String(Date.now()));
    window.location.href = url;
  }, []);

  const startOneTimePurchase = useCallback(async (productKey: string) => {
    const res = await api.post('/api/subscription/checkout', { product_key: productKey });
    const { url } = res.data;
    sessionStorage.setItem('pendingStripeUrl', url);
    sessionStorage.setItem('pendingStripeType', 'one_time');
    sessionStorage.setItem('pendingStripeInitiatedAt', String(Date.now()));
    window.location.href = url;
  }, []);

  const openPortal = useCallback(async () => {
    const res = await api.post('/api/subscription/portal');
    window.location.href = res.data.url;
  }, []);

  // Initial load and auth change
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      refreshStreak();
      refreshSubscription();
      checkPendingCheckout();
    } else {
      setStreakData(null);
      setSubscription(DEFAULT_SUBSCRIPTION);
    }
  }, [isAuthenticated, isGuest, refreshStreak, refreshSubscription, checkPendingCheckout]);

  // Refresh on visibility change (when user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        // Debounce the refresh by 500ms
        refreshTimeoutRef.current = setTimeout(() => {
          refreshStreak();
          refreshSubscription();
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
  }, [isAuthenticated, refreshStreak, refreshSubscription]);

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
        subscription,
        subscriptionLoading,
        refreshSubscription,
        startCheckout,
        startOneTimePurchase,
        openPortal,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};
