import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, SignupCredentials } from "../types/user";
import { authService } from "../services/api/authService";
import { queryClient } from "../lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthToken: (token: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user synchronously from localStorage so returning users see
  // their data immediately. Unauthenticated visitors start as null.
  const [user, setUser] = useState<User | null>(() => {
    if (authService.isAuthenticated()) {
      // Pre-populate from cache. The async verifyToken effect will confirm/update.
      return authService.getStoredUser(); // null if no cached user data yet
    }
    return null;
  });

  // Only show a loading state when we have a token but no cached user data yet
  // (first login on a new device). Returning users with cached data skip this.
  const [isLoading, setIsLoading] = useState<boolean>(
    () => authService.isAuthenticated() && !authService.getStoredUser()
  );

  // Async effect: verify the stored token with the server.
  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    const verifyToken = async () => {
      try {
        const currentUser = await authService.getCurrentUser(true); // silent on init
        setUser(currentUser);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // Server rejected the token — clear session.
          // Swallow logout API errors (the token is already invalid).
          try { await authService.logout(); } catch { /* clear localStorage only */ }
          setUser(null);
        }
        // For network errors / timeouts (device waking up, slow connection): keep
        // whatever user we pre-populated from localStorage. Do NOT log the user out
        // — they have a valid token and will succeed once connectivity is restored.
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Listen for the session-expired event dispatched by the API interceptors when
  // a 401 is received mid-session. Setting user to null lets route guards handle
  // the transition naturally — open routes remain visible, protected routes show
  // the inline auth upsell.
  useEffect(() => {
    const handleSessionExpired = () => {
      queryClient.clear();
      setUser(null);
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    queryClient.clear();
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    await authService.signup(credentials);
    // DO NOT call setUser() — user is not verified yet
    // Signup.tsx handles navigation to /verify-email-pending
  };

  const logout = async () => {
    // Clear Stripe-related sessionStorage on every logout path
    sessionStorage.removeItem('pendingStripeUrl');
    sessionStorage.removeItem('pendingStripeType');
    sessionStorage.removeItem('pendingStripeInitiatedAt');
    sessionStorage.removeItem('paymentAlertSounded');
    sessionStorage.removeItem('welcomeCeremonyPlayed');

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      queryClient.clear();
      setUser(null);
    }
  };

  const loginWithToken = async (token: string) => {
    const response = await authService.loginWithToken(token);
    queryClient.clear();
    setUser(response.user);
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    setAuthToken: authService.setAuthToken,
    loginWithToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
