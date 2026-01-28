import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { oauthService } from "../../services/api/oauth";

export const AccountManagement: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Export data state
  const [isExporting, setIsExporting] = useState(false);

  // Google account linking state
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  // Password change handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    try {
      // TODO: Implement password change API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to change password");
    }
  };

  // Delete account handlers
  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm");
      return;
    }

    try {
      // TODO: Implement delete account API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await logout();
      navigate("/signup");
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete account");
    }
  };

  // Export data handler
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement export data API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create mock data for now
      const data = {
        profile: { username: "user", email: "user@example.com" },
        favorites: [],
        history: [],
        comments: [],
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-bible-data-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Google OAuth handlers
  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    setGoogleError(null);

    try {
      // Redirect to Google OAuth for linking
      // This will use the standard OAuth flow
      window.location.href = oauthService.getGoogleLoginUrl();
    } catch (error: any) {
      setGoogleError(error.message || "Failed to initiate Google linking");
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setGoogleError(null);

    // Note: We can't check if user has password from frontend (it's hidden for security)
    // The backend will validate this when unlinking
    // If user has no password, backend will return an error

    setIsUnlinkingGoogle(true);

    try {
      // Call API to unlink Google account
      await oauthService.unlinkGoogle();

      // Refresh user data to show updated state
      await refreshUser();

      // Show success message
      alert("Google account unlinked successfully");

      // Reset state
      setShowUnlinkConfirm(false);
    } catch (error: any) {
      setGoogleError(error.message || "Failed to unlink Google account");
    } finally {
      setIsUnlinkingGoogle(false);
    }
  };

  /* add new Connected Accounts */
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 ">
      {/* Change Password */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          Change Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4 text-center">
          Update your password to keep your account secure.
        </p>

        {!showPasswordForm ? (
          <span className="flex items-center justify-center"
        >
            <Button onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          </span>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="text-red-500 dark:text-gray-400 text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="text-green-500 dark:text-green-400 text-sm">
                Password changed successfully!
              </div>
            )}

            <Input
              type="password"
              name="currentPassword"
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />

            <Input
              type="password"
              name="newPassword"
              label="New Password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />

            <div className="flex gap-2">
              <Button type="submit">Save Password</Button>
              <Button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Connected Accounts */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          Connected Accounts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Manage your connected social accounts for easy login.
        </p>

        {/* Error message */}
        {googleError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {googleError}
          </div>
        )}

        {/* Google Account - LINKED */}
        {user?.is_google_linked ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Google Logo */}
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>

                {/* Account Info */}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Google Account
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.google_email || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Connected on {new Date(user.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Profile Picture (if available) */}
              {user.google_picture && (
                <img
                  src={user.google_picture}
                  alt="Google Profile"
                  className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
              )}
            </div>

            {/* Unlink Button */}
            {!showUnlinkConfirm ? (
              <Button
                onClick={() => setShowUnlinkConfirm(true)}
                variant="secondary"
                className="mt-4 text-sm"
              >
                Unlink Google Account
              </Button>
            ) : (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                  Are you sure you want to unlink your Google account? You'll need to
                  use your email and password to log in.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUnlinkGoogle}
                    isLoading={isUnlinkingGoogle}
                    className="bg-yellow-600 hover:bg-yellow-700 text-sm"
                  >
                    Yes, Unlink
                  </Button>
                  <Button
                    onClick={() => setShowUnlinkConfirm(false)}
                    variant="secondary"
                    className="text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Google Account - NOT LINKED */
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Google Account Connected
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Link your Google account for faster and easier sign-in
            </p>
            <Button
              onClick={handleLinkGoogle}
              isLoading={isLinkingGoogle}
              
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </span>
              Link Google Account
            </Button>
          </div>
        )}
      </Card>
      {/* Export Data */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          Export Your Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          Download all your data including favorites, history, and comments.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleExportData} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </div>
      </Card>

      {/* Delete Account */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 text-center">
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          <strong>Warning:</strong> This action is irreversible. All your data
          will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <div className="flex justify-center">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deleteError && (
              <div className="text-red-500 dark:text-gray-400 text-sm">
                {deleteError}
              </div>
            )}

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Are you absolutely sure?
              </p>
              <p className="text-sm text-red-700 mb-4">
                This will permanently delete your account and all associated
                data. This action cannot be undone.
              </p>

              <Input
                type="password"
                label="Enter your password to confirm"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600"
              >
                Yes, Delete My Account
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setDeleteError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
