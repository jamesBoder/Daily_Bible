import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { VerseCardSkeleton } from "../../components/common/Skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute — wraps routes that authenticated (non-guest) users should NOT access.
 * Redirects logged-in users to "/" (home). Guests and unauthenticated users pass through.
 * Used for /login and /signup.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  // Authenticated non-guest users should not see login/signup
  if (isAuthenticated && !isGuest) {
    return <Navigate to="/daily" replace />;
  }

  return <>{children}</>;
};

/**
 * GuestUpsell — shown in place of locked content for guest users.
 * Renders within the Layout so the tab bar stays visible and the selected
 * tab remains highlighted, giving context for what the user is unlocking.
 */
const GuestUpsell: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6 pb-20">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl select-none">
        🔒
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Sign up for free
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
          Create a free account to unlock this feature and track your spiritual journey.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/signup')}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
        >
          Sign Up Free
        </button>
        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

/**
 * GuestBlockedRoute — wraps routes that guests cannot access.
 * Shows an inline sign-up upsell screen instead of redirecting away,
 * so the selected tab stays highlighted and context is clear.
 * Non-guests pass through normally.
 */
export const GuestBlockedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isGuest) {
    return <GuestUpsell />;
  }

  return <>{children}</>;
};
