import React, { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestBlockedRoute, PublicOnlyRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { StreakProvider } from "./contexts/StreakContext";
import { Toaster } from "react-hot-toast";
import { VerseCardSkeleton } from "./components/common/Skeleton";
import BlessingsToast from "./components/BlessingsToast";
import { SoundService } from "./services/SoundService";
import "./App.css";


// Lazy-load auth pages — authenticated users never visit these
const Login = lazy(() =>
  import("./features/auth/Login").then((m) => ({ default: m.Login }))
);
const Signup = lazy(() =>
  import("./features/auth/Signup").then((m) => ({ default: m.Signup }))
);
const VerifyEmailPending = lazy(() =>
  import("./features/auth/VerifyEmailPending").then((m) => ({ default: m.VerifyEmailPending }))
);
const VerifyEmail = lazy(() =>
  import("./features/auth/VerifyEmail").then((m) => ({ default: m.VerifyEmail }))
);
const ForgotPassword = lazy(() =>
  import("./features/auth/ForgotPassword").then((m) => ({ default: m.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import("./features/auth/ResetPassword").then((m) => ({ default: m.ResetPassword }))
);

// Lazy load non-critical components (with named export handling)
const DailyVerse = lazy(() =>
  import("./features/verse/DailyVerse").then((module) => ({
    default: module.DailyVerse,
  }))
);

const FavoritesList = lazy(() =>
  import("./features/favorites/FavoritesList").then((module) => ({
    default: module.FavoritesList,
  }))
);

const Profile = lazy(() =>
  import("./features/profile/Profile").then((module) => ({
    default: module.Profile,
  }))
);

const Settings = lazy(() =>
  import("./features/profile/Settings").then((module) => ({
    default: module.Settings,
  }))
);

const GoogleCallback = lazy(() =>
  import("./features/auth/GoogleCallback").then((module) => ({
    default: module.GoogleCallback,
  }))
);

// lazy load About page for non-authenticated users
const About = lazy(() =>
  import("./features/about/About").then((module) => ({
    default: module.About,
  }))
);

const JournalList = lazy(() =>
  import("./features/journal/JournalList").then((module) => ({
    default: module.JournalList,
  }))
);

const JournalEditor = lazy(() =>
  import("./features/journal/JournalEditor").then((module) => ({
    default: module.JournalEditor,
  }))
);

const SearchResultsPage = lazy(() =>
  import("./features/search/SearchResultsPage").then((module) => ({
    default: module.SearchResultsPage,
  }))
);

const RewardsShop = lazy(() =>
  import("./features/shop/RewardsShop").then((module) => ({
    default: module.RewardsShop,
  }))
);

const router = createBrowserRouter([
  // Public-only routes — redirect authenticated users to home
  {
    path: "/login",
    element: <PublicOnlyRoute><Suspense fallback={<VerseCardSkeleton />}><Login /></Suspense></PublicOnlyRoute>,
  },
  {
    path: "/signup",
    element: <PublicOnlyRoute><Suspense fallback={<VerseCardSkeleton />}><Signup /></Suspense></PublicOnlyRoute>,
  },
  // Email verification & password reset — public routes
  {
    path: "/verify-email-pending",
    element: <Suspense fallback={<VerseCardSkeleton />}><VerifyEmailPending /></Suspense>,
  },
  {
    path: "/verify-email",
    element: <Suspense fallback={<VerseCardSkeleton />}><VerifyEmail /></Suspense>,
  },
  {
    path: "/forgot-password",
    element: <Suspense fallback={<VerseCardSkeleton />}><ForgotPassword /></Suspense>,
  },
  {
    path: "/reset-password",
    element: <Suspense fallback={<VerseCardSkeleton />}><ResetPassword /></Suspense>,
  },
  {
    path: "/about",
    element: <Suspense fallback={<VerseCardSkeleton />}><About /></Suspense>,
  },
  {
    path: "/auth/google/callback",
    element: <Suspense fallback={<VerseCardSkeleton />}><GoogleCallback /></Suspense>,
  },
  // Protected routes with layout
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        index: true,
        element: <Suspense fallback={<VerseCardSkeleton />}><DailyVerse /></Suspense>,
      },
      {
        path: "daily",
        element: <Suspense fallback={<VerseCardSkeleton />}><DailyVerse /></Suspense>,
      },
      {
        path: "favorites",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><FavoritesList /></Suspense></GuestBlockedRoute>,
      },
      {
        path: "profile",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><Profile /></Suspense></GuestBlockedRoute>,
      },
      {
        path: "settings",
        element: <Suspense fallback={<VerseCardSkeleton />}><Settings /></Suspense>,
      },
      // Search route (Phase 5) — authenticated users only
      {
        path: "search",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><SearchResultsPage /></Suspense></GuestBlockedRoute>,
      },
      // Rewards Shop (Phase 6) — authenticated users only
      {
        path: "shop",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><RewardsShop /></Suspense></GuestBlockedRoute>,
      },
      // Journal routes (Phase 3)
      {
        path: "journal",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><JournalList /></Suspense></GuestBlockedRoute>,
      },
      {
        path: "journal/new",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><JournalEditor /></Suspense></GuestBlockedRoute>,
      },
      {
        path: "journal/:id",
        element: <GuestBlockedRoute><Suspense fallback={<VerseCardSkeleton />}><JournalEditor /></Suspense></GuestBlockedRoute>,
      },
    ],
  },
  // Catch all - redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  useEffect(() => {
    SoundService.loadPreference();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <StreakProvider>
          <LanguageProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <BlessingsToast />
            <RouterProvider router={router} />
          </LanguageProvider>
        </StreakProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
