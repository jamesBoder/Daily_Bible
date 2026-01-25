import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const AccountManagement: React.FC = () => {
  const { logout } = useAuth();
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Change Password */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300">
          Change Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">
          Update your password to keep your account secure.
        </p>

        {!showPasswordForm ? (
          <Button onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
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

      {/* Export Data */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300">
          Export Your Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Download all your data including favorites, history, and comments.
        </p>
        <Button onClick={handleExportData} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </Card>

      {/* Delete Account */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          <strong>Warning:</strong> This action is irreversible. All your data
          will be permanently deleted.
        </p>

        {!showDeleteConfirm ? (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete Account
          </Button>
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
