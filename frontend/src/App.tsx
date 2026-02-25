import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestBlockedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import { VerseCardSkeleton } from "./components/common/Skeleton";
import "./App.css";


// Eager load critical authentication components
import { Login } from "./features/auth/Login";
import { Signup } from "./features/auth/Signup";

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

const HistoryList = lazy(() =>
  import("./features/history/HistoryList").then((module) => ({
    default: module.HistoryList,
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

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
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
            <Routes>
              {/* Public routes - no Suspense needed for eager-loaded components */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<VerseCardSkeleton />}>
                    <About />
                  </Suspense>
                }
              />
              {/* Lazy-loaded public route */}
              <Route
                path="/auth/google/callback"
                element={
                  <Suspense fallback={<VerseCardSkeleton />}>
                    <GoogleCallback />
                  </Suspense>
                }
              />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout  />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <DailyVerse />
                    </Suspense>
                  }
                />
                <Route
                  path="daily"
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <DailyVerse />
                    </Suspense>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <GuestBlockedRoute>
                      <Suspense fallback={<VerseCardSkeleton />}>
                        <FavoritesList />
                      </Suspense>
                    </GuestBlockedRoute>
                  }
                />
                <Route
                  path="history"
                  element={
                    <GuestBlockedRoute>
                      <Suspense fallback={<VerseCardSkeleton />}>
                        <HistoryList />
                      </Suspense>
                    </GuestBlockedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <GuestBlockedRoute>
                      <Suspense fallback={<VerseCardSkeleton />}>
                        <Profile />
                      </Suspense>
                    </GuestBlockedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <Settings />
                    </Suspense>
                  }
                />
                
              </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
