import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, LoginCredentials, SignupCredentials } from "../types/user";
import { authService } from "../services/api/authService";
import { queryClient } from "../lib/queryClient";

const GUEST_SESSION_KEY = "is_guest";

const GUEST_USER: User = {
  id: 0,
  email: "",
  username: "Guest",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_guest: true,
};

// Guest state is stored in localStorage so it survives page reloads.
// It is set automatically when no valid real-user session exists (auto-guest mode).
const guestStorage = {
  get: () => localStorage.getItem(GUEST_SESSION_KEY) === "true",
  set: () => localStorage.setItem(GUEST_SESSION_KEY, "true"),
  clear: () => localStorage.removeItem(GUEST_SESSION_KEY),
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setAuthToken: (token: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsGuest: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user synchronously from localStorage so guests never start in a
  // loading state and returning users see their data immediately.
  const [user, setUser] = useState<User | null>(() => {
    if (guestStorage.get()) return GUEST_USER;
    if (authService.isAuthenticated()) {
      // Pre-populate from cache. The async verifyToken effect will confirm/update.
      return authService.getStoredUser(); // null if no cached user data yet
    }
    // No valid session — auto-guest mode
    guestStorage.set();
    return GUEST_USER;
  });

  // Only show a loading state when we have a token but no cached user data yet
  // (first login on a new device). Returning users with cached data skip this.
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !guestStorage.get() && authService.isAuthenticated() && !authService.getStoredUser()
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
          // Server rejected the token — clear session and fall back to guest.
          // Swallow logout API errors (the token is already invalid).
          try { await authService.logout(); } catch { /* clear localStorage only */ }
          guestStorage.set();
          setUser(GUEST_USER);
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
  // a 401 is received. This lets us transition state within React instead of
  // doing a full page reload (window.location.href), which caused "parts stop
  // loading" because the React tree was torn down mid-render.
  useEffect(() => {
    const handleSessionExpired = () => {
      queryClient.clear();
      guestStorage.set();
      setUser(GUEST_USER);
    };
    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const loginAsGuest = () => {
    // Clear any stale real-user token so guest requests don't accidentally carry a valid JWT
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_token_expiry");
    guestStorage.set();
    queryClient.clear();
    setUser(GUEST_USER);
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    // Clear any guest session before setting real user
    guestStorage.clear();
    queryClient.clear();
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    await authService.signup(credentials);
    // DO NOT call setUser() — user is not verified yet
    // DO NOT clear guest session — user isn't logged in
    // DO NOT clear queryClient — nothing to clear
    // Signup.tsx handles navigation to /verify-email-pending
  };

  const logout = async () => {
    // Clear Stripe-related sessionStorage on every logout path
    sessionStorage.removeItem('pendingStripeUrl');
    sessionStorage.removeItem('pendingStripeType');
    sessionStorage.removeItem('pendingStripeInitiatedAt');
    sessionStorage.removeItem('paymentAlertSounded');
    sessionStorage.removeItem('welcomeCeremonyPlayed');

    // Guest logout: skip API call, just clear guest state
    if (user?.is_guest) {
      guestStorage.clear();
      queryClient.clear();
      setUser(null);
      return;
    }
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
    // Clear any guest session before setting real user (OAuth flow)
    guestStorage.clear();
    queryClient.clear();
    setUser(response.user);
  };

  const refreshUser = async () => {
    // Guests have no real user to refresh — skip silently
    if (user?.is_guest) return;
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
    isGuest: user?.is_guest === true,
    isLoading,
    login,
    signup,
    logout,
    setAuthToken: authService.setAuthToken,
    loginWithToken,
    refreshUser,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
