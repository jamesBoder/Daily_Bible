import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import apiClient from "../../services/api/api";
import { showToast } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/constants";

export const VerifyEmailPending: React.FC = () => {
  const location = useLocation();
  const stateEmail = (location.state as { email?: string })?.email || "";
  const [emailInput, setEmailInput] = useState(stateEmail);
  const [emailError, setEmailError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const validateEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleResend = async () => {
    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsResending(true);
    try {
      await apiClient.post(API_ENDPOINTS.RESEND_VERIFICATION, { email: emailInput });
      setResent(true);
      showToast.success("Verification email resent!");
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We sent a verification link to{" "}
              {stateEmail ? (
                <strong className="text-gray-900 dark:text-gray-100">
                  {stateEmail}
                </strong>
              ) : (
                "your email address"
              )}
              . Click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              The link expires in 24 hours.
            </p>

            {!resent ? (
              <div className="pt-2 space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Didn't receive it?
                </p>

                {/* Show email input only when we don't have it from state */}
                {!stateEmail && (
                  <Input
                    label="Your email address"
                    type="email"
                    name="email"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    placeholder="your@email.com"
                    error={emailError}
                    autoComplete="email"
                  />
                )}

                <Button
                  variant="secondary"
                  onClick={handleResend}
                  isLoading={isResending}
                  disabled={isResending}
                  className="w-full"
                >
                  Resend verification email
                </Button>
              </div>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Verification email resent!
              </p>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/login"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
