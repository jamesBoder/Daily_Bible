import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Loading } from "../../components/common/Loading";
import apiClient from "../../services/api/api";
import { showToast } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/constants";

type VerifyStatus = "verifying" | "success" | "expired" | "error";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  // For expired/error — inline resend state
  const [resendEmail, setResendEmail] = useState("");
  const [resendEmailError, setResendEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in the link.");
      return;
    }
    const isPending = searchParams.get("type") === "pending";
    verifyToken(token, isPending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (token: string, isPending: boolean) => {
    try {
      const endpoint = isPending
        ? API_ENDPOINTS.VERIFY_PENDING_EMAIL
        : API_ENDPOINTS.VERIFY_EMAIL;
      const response = await apiClient.post<{ message: string; token: string }>(
        endpoint,
        { token }
      );
      await loginWithToken(response.data.token);
      setStatus("success");
      showToast.success(
        isPending
          ? "New email confirmed! Your email address has been updated."
          : "Email verified! Welcome to Words of Praise 🎉"
      );
      // 2 seconds — gives users time to read the confirmation before redirect
      setTimeout(() => navigate("/", { replace: true }), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Verification failed.";
      if (msg.toLowerCase().includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
      }
      setErrorMessage(msg);
    }
  };

  const handleResend = async () => {
    if (!/\S+@\S+\.\S+/.test(resendEmail)) {
      setResendEmailError("Please enter a valid email address.");
      return;
    }
    setResendEmailError("");
    setIsResending(true);
    try {
      await apiClient.post(API_ENDPOINTS.RESEND_VERIFICATION, { email: resendEmail });
      setResent(true);
      showToast.success("Verification email resent! Check your inbox.");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to resend. Please try again.";
      showToast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4 py-4">
              <Loading />
              <p className="text-gray-600 dark:text-gray-400">
                Verifying your email...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {searchParams.get("type") === "pending" ? "Email Updated!" : "Email Verified!"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {searchParams.get("type") === "pending"
                  ? "Your email address has been changed successfully. Redirecting..."
                  : "Your account is now active. Redirecting you to the app..."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">⏰</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Link Expired
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Verification links expire after 24 hours. Enter your email below to get a new one.
              </p>

              {!resent ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleResend(); }}
                  className="space-y-3 text-left"
                >
                  <Input
                    label="Email address"
                    type="email"
                    name="resendEmail"
                    value={resendEmail}
                    onChange={(e) => {
                      setResendEmail(e.target.value);
                      if (resendEmailError) setResendEmailError("");
                    }}
                    placeholder="your@email.com"
                    error={resendEmailError}
                    autoComplete="email"
                  />
                  <Button
                    type="submit"
                    isLoading={isResending}
                    disabled={isResending}
                    className="w-full"
                  >
                    Send new verification email
                  </Button>
                </form>
              ) : (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  ✓ New verification email sent! Check your inbox.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Back to login
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // status === "error"
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 break-words">{errorMessage}</p>
            <Button type="button" onClick={() => navigate("/login")} className="w-full">
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
