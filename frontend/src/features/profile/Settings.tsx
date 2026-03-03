import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { AccountManagement } from "./AccountManagement";
import { GuestAccountManagement } from "./GuestAccountManagement";
import { StatsCard } from "./StatsCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { settingsService } from "../../services/api/settings";

interface SettingsState {
  emailNotifications: boolean;
  dailyVerseReminder: boolean;
}

type TabType = "profile" | "preferences" | "account";

export const Settings: React.FC = () => {
  const { isGuest } = useAuth();

  // Guests skip "profile" tab (no API call needed)
  const [activeTab, setActiveTab] = useState<TabType>(() =>
    isGuest ? "preferences" : "profile"
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // Guests never fetch profile data, so start as false; non-guests start as true
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!isGuest);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    dailyVerseReminder: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Fetch profile data — skip entirely for guests
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

    if (activeTab === "profile" && !isGuest) {
      fetchProfile();
    }
  }, [activeTab, isGuest]);

  // Load user settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!isGuest) {
        try {
          const userSettings = await settingsService.getSettings();
          setSettings({
            emailNotifications: userSettings.email_notifications,
            dailyVerseReminder: userSettings.daily_verse_reminder,
          });
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      }
    };

    loadSettings();
  }, [isGuest]);

  const handleToggle = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditingProfile(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!isGuest) {
        await settingsService.updateSettings({
          email_notifications: settings.emailNotifications,
          daily_verse_reminder: settings.dailyVerseReminder,
        });
      }
      setSuccessMessage("Settings saved!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 hover:brightness-125 hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.3)] dark:hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.3)] cursor-default">
        Settings
      </h1>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          {/* Profile tab hidden for guests */}
          {!isGuest && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              Profile
            </button>
          )}
          <button
            onClick={() => setActiveTab("preferences")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "preferences"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "account"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
            }`}
          >
            Account
          </button>
        </nav>
      </div>

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* ── Profile Tab ─────────────────────────────────────────────────────── */}
      {activeTab === "profile" ? (
        <>
          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : profileError ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error: {profileError}
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Profile Information Card */}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
                    Profile Information
                  </h2>
                  <Button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant="secondary"
                  >
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {isEditingProfile ? (
                  <ProfileEditForm
                    initialProfile={profile}
                    onUpdate={handleProfileUpdate}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Username
                      </label>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 text-center">
                        {profile.username}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Email
                      </label>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 text-center">
                        {profile.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                        Member Since
                      </label>
                      <p className="mt-1 text-lg text-gray-900 dark:text-gray-100 text-center">
                        {new Date(profile.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Statistics Card */}
              <StatsCard />
            </div>
          ) : (
            <div className="text-gray-600 text-center">No profile data available</div>
          )}
        </>
      ) : activeTab === "preferences" ? (
        <>
          {/* ── Appearance ──────────────────────────────────────────────────── */}
          <Card>
            <h2 className="text-2xl font mb-4 text-gray-900 dark:text-gray-100 text-center">
              Appearance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dark Mode</h3>
                  <p className="text-sm text-gray-600">
                    Switch between light and dark theme
                  </p>
                </div>
                <button
                  onClick={() => toggleTheme()}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isDarkMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isDarkMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* ── Notifications ───────────────────────────────────────────────── */}
          <Card>
            <h2 className="text-2xl font mb-4 text-gray-900 dark:text-gray-100 text-center">
              Notifications
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Email Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive email updates and announcements
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
                      settings.emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Daily Verse Reminder</h3>
                  <p className="text-sm text-gray-600">
                    Get a daily reminder to read your verse
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
                      settings.dailyVerseReminder ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
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
        /* ── Account Tab ──────────────────────────────────────────────────── */
        isGuest ? <GuestAccountManagement /> : <AccountManagement />
      )}
    </div>
  );
};
