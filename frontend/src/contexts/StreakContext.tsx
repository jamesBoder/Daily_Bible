import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../services/SoundService';

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
  // §8.18.4
  checkoutOverlayVisible: boolean;
  cancelCheckout: () => void;
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
  const { t } = useTranslation();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastFetchRef = useRef<number>(0);
  const lastSubFetchRef = useRef<number>(0);

  // §8.18.4: Checkout overlay state
  const [checkoutOverlayVisible, setCheckoutOverlayVisible] = useState(false);
  const checkoutControllerRef = useRef<AbortController | null>(null);

  // §8.18.4: Track subscription transitions for welcome ceremony and past_due resolution
  const prevIsPremiumRef = useRef<boolean | undefined>(undefined);
  const prevStatusRef = useRef<string | undefined>(undefined);

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

  // §8.18.3/8.18.4: Watch for subscription transitions
  useEffect(() => {
    if (subscription === null) return;

    const wasPremium = prevIsPremiumRef.current;
    const isPremium = subscription.is_premium;
    const prevStatus = prevStatusRef.current;

    // Welcome ceremony: false → true (guarded by sessionStorage to play once per session)
    if (wasPremium === false && isPremium === true) {
      if (!sessionStorage.getItem('welcomeCeremonyPlayed')) {
        sessionStorage.setItem('welcomeCeremonyPlayed', '1');
        if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
        SoundService.play('subscription-success');
        setTimeout(() => {
          toast.success(t('subscription.became_premium', 'Welcome to Premium! 🎉'));
        }, 200);
      }
    }

    // past_due → active: quiet confirmation
    if (prevStatus === 'past_due' && subscription.status === 'active') {
      toast.success(t('subscription.past_due_resolved', 'Payment resolved. Your subscription is active.'));
      localStorage.removeItem('paymentAlertDismissedAt');
      sessionStorage.removeItem('paymentAlertSounded');
    }

    prevIsPremiumRef.current = isPremium;
    prevStatusRef.current = subscription.status;
  }, [subscription?.is_premium, subscription?.status, t]);

  // §8.18.4: Cancel in-flight checkout
  const cancelCheckout = useCallback(() => {
    checkoutControllerRef.current?.abort();
    checkoutControllerRef.current = null;
    setCheckoutOverlayVisible(false);
  }, []);

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
    // §8.18.1/8.18.3/8.18.4: play tap sound, show overlay, abort previous if any
    checkoutControllerRef.current?.abort();
    const controller = new AbortController();
    checkoutControllerRef.current = controller;
    SoundService.play('checkout-tap');
    setCheckoutOverlayVisible(true);
    try {
      const res = await api.post('/api/subscription/checkout', { plan },
        { signal: controller.signal });
      const { url } = res.data;
      sessionStorage.setItem('pendingStripeUrl', url);
      sessionStorage.setItem('pendingStripeType', 'subscription');
      sessionStorage.setItem('pendingStripeInitiatedAt', String(Date.now()));
      window.location.href = url;
      // overlay persists until page navigates away
    } catch (err: any) {
      setCheckoutOverlayVisible(false);
      throw err; // let callers handle the error toast
    }
  }, []);

  const startOneTimePurchase = useCallback(async (productKey: string) => {
    checkoutControllerRef.current?.abort();
    const controller = new AbortController();
    checkoutControllerRef.current = controller;
    SoundService.play('checkout-tap');
    setCheckoutOverlayVisible(true);
    try {
      const res = await api.post('/api/subscription/checkout', { product_key: productKey },
        { signal: controller.signal });
      const { url } = res.data;
      sessionStorage.setItem('pendingStripeUrl', url);
      sessionStorage.setItem('pendingStripeType', 'one_time');
      sessionStorage.setItem('pendingStripeInitiatedAt', String(Date.now()));
      window.location.href = url;
    } catch (err: any) {
      setCheckoutOverlayVisible(false);
      throw err;
    }
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
        checkoutOverlayVisible,
        cancelCheckout,
      }}
    >
      {children}
    </StreakContext.Provider>
  );
};
