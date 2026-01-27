// Oauth Callback Handler

// import
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { oauthService } from "../../services/api/oauth";
import { useAuth } from "../../hooks/useAuth";

// init GoogleCallback component
//1. Extracts code and state from URL params
//2. Validates state (CSRF protection)
//3. Sends code to backend
//4. Receives JWT token
//5. Stores token in localStorage
//6. Updates auth context
//7. Redirects to dashboard/daily verse
export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code || !state) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const tokenResponse = await oauthService.exchangeGoogleCode(
          code,
          state,
        );
        const { token } = tokenResponse;

        // Store token in localStorage
        localStorage.setItem("authToken", token);

        // Update auth context
        await loginWithToken(token);

        // Redirect to dashboard or daily verse
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    handleGoogleCallback();
  }, [location.search, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700 dark:text-gray-300">
        Processing Google login...
      </p>
    </div>
  );
};
