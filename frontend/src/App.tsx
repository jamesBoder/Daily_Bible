import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Loading } from "./components/common/Loading";
import { ThemeProvider } from "./contexts/ThemeContext";
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

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes - no Suspense needed for eager-loaded components */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Lazy-loaded public route */}
            <Route
              path="/auth/google/callback"
              element={
                <Suspense fallback={<Loading />}>
                  <GoogleCallback />
                </Suspense>
              }
            />

            {/* Protected routes with layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <Suspense fallback={<Loading />}>
                    <DailyVerse />
                  </Suspense>
                }
              />
              <Route
                path="daily"
                element={
                  <Suspense fallback={<Loading />}>
                    <DailyVerse />
                  </Suspense>
                }
              />
              <Route
                path="favorites"
                element={
                  <Suspense fallback={<Loading />}>
                    <FavoritesList />
                  </Suspense>
                }
              />
              <Route
                path="history"
                element={
                  <Suspense fallback={<Loading />}>
                    <HistoryList />
                  </Suspense>
                }
              />
              <Route
                path="profile"
                element={
                  <Suspense fallback={<Loading />}>
                    <Profile />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<Loading />}>
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
