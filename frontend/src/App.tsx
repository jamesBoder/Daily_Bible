import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Login } from "./features/auth/Login";
import { Signup } from "./features/auth/Signup";
import { DailyVerse } from "./features/verse/DailyVerse";
import { FavoritesList } from "./features/favorites/FavoritesList";
import { HistoryList } from "./features/history/HistoryList";
import { Layout } from "./components/layout/Layout";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DailyVerse />} />
            <Route path="daily" element={<DailyVerse />} />
            <Route path="favorites" element={<FavoritesList />} />
            <Route path="history" element={<HistoryList />} />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
