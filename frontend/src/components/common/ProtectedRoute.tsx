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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute — wraps routes that authenticated users should NOT access.
 * Redirects logged-in users to "/daily". Unauthenticated users pass through.
 * Used for /login and /signup.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (isAuthenticated) {
    return <Navigate to="/daily" replace />;
  }

  return <>{children}</>;
};

/**
 * AuthRequiredUpsell — inline sign-up prompt shown within the Layout when an
 * unauthenticated visitor tries to access a feature that requires an account.
 * Renders within the Layout so the tab bar stays visible and the selected
 * tab remains highlighted, giving context for what the user is unlocking.
 */
const AuthRequiredUpsell: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6 pb-20">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-3xl select-none">
        🔒
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Sign up for free
        </h2>
        <p className="text-[var(--journal-text-muted)] max-w-xs mx-auto text-sm leading-relaxed">
          Create a free account to unlock this feature and track your spiritual journey.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate('/signup', { state: { from: location } })}
          className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 transition-colors"
        >
          Sign Up Free
        </button>
        <button
          onClick={() => navigate('/login', { state: { from: location } })}
          className="w-full py-3 px-6 rounded-xl font-semibold text-[var(--foreground)] bg-[var(--journal-surface)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};

/**
 * AuthRequiredRoute — wraps routes that require an account.
 * Shows an inline sign-up upsell screen for unauthenticated visitors instead
 * of redirecting away, so the selected tab stays highlighted and context is clear.
 * Authenticated users pass through normally.
 */
export const AuthRequiredRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (!isAuthenticated) {
    return <AuthRequiredUpsell />;
  }

  return <>{children}</>;
};
