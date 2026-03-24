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
  // loading state. This prevents a blank-screen flash at the root URL because
  // ProtectedRoute can render the Layout (and fire the /daily redirect) on the
  // very first paint instead of waiting for a useEffect round-trip.
  const [user, setUser] = useState<User | null>(() => {
    if (guestStorage.get()) return GUEST_USER;
    if (authService.isAuthenticated()) return null; // need async server verify
    // No session at all — auto-guest mode
    guestStorage.set();
    return GUEST_USER;
  });

  // Only show a loading state when we have a local token that needs server
  // verification. Pure guest / no-session cases are resolved synchronously above.
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !guestStorage.get() && authService.isAuthenticated()
  );

  // Async effect: only runs when there is a token to verify with the server.
  useEffect(() => {
    if (!authService.isAuthenticated()) return; // already resolved synchronously

    const verifyToken = async () => {
      try {
        const currentUser = await authService.getCurrentUser(true); // silent on init
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear the stale/invalid token. Swallow logout API errors (likely 401).
        try { await authService.logout(); } catch { /* clear localStorage only */ }
        guestStorage.set();
        setUser(GUEST_USER);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const loginAsGuest = () => {
    // Clear any stale real-user token so guest requests don't accidentally carry a valid JWT
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("auth_token_expiry");
    guestStorage.set();
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
      setUser(null);
      return;
    }
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user anyway
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
