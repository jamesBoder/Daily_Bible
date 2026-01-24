import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { AccountManagement } from "./AccountManagement";
import { StatsCard } from "./StatsCard";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { useTheme } from "../../contexts/ThemeContext";

interface SettingsState {
  emailNotifications: boolean;
  dailyVerseReminder: boolean;
  language: string;
}

type TabType = "profile" | "preferences" | "account";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    dailyVerseReminder: true,
    language: "en",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setProfileError(err.message || "Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (activeTab === "profile") {
      fetchProfile();
    }
  }, [activeTab]);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings((prev) => ({
      ...prev,
      language: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement settings API call when backend is ready
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "preferences"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600"
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "account"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600"
            }`}
          >
            Account Management
          </button>
        </nav>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "profile" ? (
        <>
          {/* Profile Content */}
          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600">Loading profile...</div>
            </div>
          ) : profileError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {profileError}
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Information Card */}
              <Card>
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Username
                    </label>
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.username}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <p className="mt-1 text-lg text-gray-900">
                      {profile.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Member Since
                    </label>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(profile.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Statistics Card */}
              <StatsCard />
            </div>
          ) : (
            <div className="text-gray-600">No profile data available.</div>
          )}
        </>
      ) : activeTab === "preferences" ? (
        <>
          {/* Preferences Content */}

          {/* Appearance Settings */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Dark Mode</h3>
                  <p className="text-sm text-gray-600">
                    Use dark theme throughout the app
                  </p>
                </div>
                <button
                  onClick={() => toggleTheme()}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card>
            <h2 className="text-2xl font mb-4 text-gray-900 dark:text-gray-100">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive updates via email
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("emailNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.emailNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">Daily Verse Reminder</h3>
                  <p className="text-sm text-gray-600">
                    Get reminded to read your daily verse
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("dailyVerseReminder")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.dailyVerseReminder ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.dailyVerseReminder
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Language</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Language
              </label>
              <select
                value={settings.language}
                onChange={handleLanguageChange}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </>
      ) : (
        /* Account Management Content */
        <AccountManagement />
      )}
    </div>
  );
};
