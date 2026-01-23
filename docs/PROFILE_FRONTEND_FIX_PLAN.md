# Profile & Settings Frontend Fix Plan

**Status:** 🎯 Ready to Implement  
**Backend Status:** ✅ All 9 tests passing  
**Created:** January 2026  
**Priority:** HIGH

---

## 📊 Current Status

### ✅ Backend (COMPLETE)
- All profile API endpoints working correctly
- GET /api/profile - Returns current user profile
- PUT /api/profile - Updates user profile with validation
- GET /api/profile/stats - Returns user statistics
- All endpoints use JWT authentication (no userId in URL)

### ❌ Frontend (NEEDS FIXING)
Multiple issues identified across Profile, Settings, and related components.

---

## 🐛 Issues Identified

### **Issue 1: Profile Service API Pattern** ⚠️ CRITICAL
**File:** `frontend/src/services/api/profile.ts`

**Problem:**
- Service methods accept `userId` parameter
- Makes API calls with userId in URL: `/api/profile/${userId}`
- Backend expects JWT token authentication only

**Current Code:**
```typescript
getProfile: async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(
        `${API_ENDPOINTS.PROFILE}/${userId}`  // ❌ WRONG
    );
    return response.data;
}
```

**Should Be:**
```typescript
getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(
        API_ENDPOINTS.PROFILE  // ✅ CORRECT - uses JWT
    );
    return response.data;
}
```

**Impact:** HIGH - All profile API calls will fail

---

### **Issue 2: Profile.tsx Component** ⚠️ CRITICAL
**File:** `frontend/src/features/profile/Profile.tsx`

**Problems:**
1. Uses URL params for userId instead of auth context
2. No integration with StatsCard component
3. No integration with ProfileEditForm component
4. Poor loading/error UI (just text)
5. No edit mode toggle
6. Missing proper layout

**Current Issues:**
```typescript
const { userId } = useParams<{ userId: string }>();  // ❌ Wrong approach
const data = await profileService.getProfile(userId!);  // ❌ Passes userId
```

**Should Use:**
```typescript
const { user } = useAuth();  // ✅ Get from auth context
const data = await profileService.getProfile();  // ✅ No userId needed
```

**Impact:** HIGH - Profile page won't work correctly

---

### **Issue 3: Settings.tsx is Empty** ⚠️ CRITICAL
**File:** `frontend/src/features/profile/Settings.tsx`

**Problem:**
- File exists but has no content
- No settings UI implemented

**Needs:**
- Dark mode toggle
- Notification preferences
- Email preferences
- Language/translation settings
- Save/Cancel buttons

**Impact:** HIGH - Settings page is non-functional

---

### **Issue 4: AccountManagement.tsx No Functionality** ⚠️ HIGH
**File:** `frontend/src/features/profile/AccountManagement.tsx`

**Problems:**
1. Buttons are static (no onClick handlers)
2. No API integration
3. No confirmation dialogs for dangerous actions
4. No password change form
5. No account deletion flow
6. No data export functionality

**Impact:** HIGH - Account management features don't work

---

### **Issue 5: StatsCard Field Name Mismatch** ⚠️ HIGH
**File:** `frontend/src/features/profile/StatsCard.tsx`

**Problem:**
Frontend expects different field names than backend returns

**Frontend Expects:**
```typescript
stats.totalVersesRead     // ❌ Doesn't exist
stats.dailyStreak         // ❌ Doesn't exist
stats.favoritesCount      // ❌ Doesn't exist
stats.notesCount          // ❌ Doesn't exist
```

**Backend Returns:**
```json
{
  "favorite_count": 5,
  "history_count": 10,
  "comment_count": 3,
  "account_age_days": 7
}
```

**Impact:** HIGH - Stats won't display correctly

---

### **Issue 6: Type Definitions Mismatch** ⚠️ MEDIUM
**File:** `frontend/src/types/profile.ts`

**Problem:**
- UserStats interface doesn't match backend response
- Many unused interfaces defined

**Current:**
```typescript
interface UserStats {
    totalVersesRead: number;      // ❌ Backend doesn't return this
    dailyReadingStreak: number;   // ❌ Backend doesn't return this
    favoritesCount: number;       // ❌ Wrong field name
    notesTaken: number;           // ❌ Wrong field name
}
```

**Should Be:**
```typescript
interface UserStats {
    favorite_count: number;       // ✅ Matches backend
    history_count: number;        // ✅ Matches backend
    comment_count: number;        // ✅ Matches backend
    account_age_days: number;     // ✅ Matches backend
}
```

**Impact:** MEDIUM - Type safety issues

---

### **Issue 7: Missing Routes in App.tsx** ⚠️ HIGH
**File:** `frontend/src/App.tsx`

**Problem:**
- No routes defined for Profile or Settings pages
- Users can't navigate to these pages

**Needs:**
```typescript
<Route path="profile" element={<Profile />} />
<Route path="settings" element={<Settings />} />
```

**Impact:** HIGH - Pages are inaccessible

---

### **Issue 8: ProfileEditForm Issues** ⚠️ MEDIUM
**File:** `frontend/src/features/profile/ProfileEditForm.tsx`

**Problems:**
1. Passes userId to updateProfile (should use JWT)
2. No password field (but has comment about it)
3. Limited validation
4. No success feedback

**Impact:** MEDIUM - Edit functionality partially broken

---

## 🎯 Implementation Plan

### **Phase 1: Fix Core API Integration** (30 minutes)

#### Step 1.1: Fix Profile Service
**File:** `frontend/src/services/api/profile.ts`

**Changes:**
```typescript
export const profileService = {
    // Remove userId parameter - use JWT token
    getProfile: async (): Promise<UserProfile> => {
        const response = await apiClient.get<UserProfile>(
            API_ENDPOINTS.PROFILE
        );
        return response.data;
    },

    // Remove userId parameter - use JWT token
    updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
        const response = await apiClient.put<UserProfile>(
            API_ENDPOINTS.PROFILE,
            profileData
        );
        return response.data;
    },

    // Remove userId parameter - use JWT token
    getStats: async (): Promise<UserStats> => {
        const response = await apiClient.get<UserStats>(
            `${API_ENDPOINTS.PROFILE}/stats`
        );
        return response.data;
    }
};
```

#### Step 1.2: Fix Type Definitions
**File:** `frontend/src/types/profile.ts`

**Changes:**
```typescript
// Update UserStats to match backend response
export interface UserStats {
    favorite_count: number;
    history_count: number;
    comment_count: number;
    account_age_days: number;
}

// Keep UserProfile as is (already correct)
export interface UserProfile {
    id: number;
    username: string;
    email: string;
    created_at: string;
}
```

---

### **Phase 2: Fix Profile Page** (45 minutes)

#### Step 2.1: Rewrite Profile.tsx
**File:** `frontend/src/features/profile/Profile.tsx`

**New Structure:**
```typescript
import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { StatsCard } from "./StatsCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { Loading } from "../../components/common/Loading";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

export const Profile: React.FC = () => {
  const { user } = useAuth();  // ✅ Get from auth context
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile();  // ✅ No userId
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (isLoading) return <Loading />;
  if (error) return <Card><div className="text-red-500">Error: {error}</div></Card>;
  if (!profile) return <Card><div>No profile data available.</div></Card>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {isEditing ? (
        <Card>
          <ProfileEditForm
            initialProfile={profile}
            onUpdate={handleUpdate}
          />
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Username</h2>
              <p className="text-lg">{profile.username}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Email</h2>
              <p className="text-lg">{profile.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Member Since</h2>
              <p className="text-lg">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {user && <StatsCard userId={user.id.toString()} />}
    </div>
  );
};
```

#### Step 2.2: Fix StatsCard.tsx
**File:** `frontend/src/features/profile/StatsCard.tsx`

**Changes:**
```typescript
// Remove userId prop - use auth context
export const StatsCard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  // ... rest of state

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await profileService.getStats();  // ✅ No userId
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ... loading/error handling

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Your Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Favorites</h3>
          <p className="text-3xl">{stats.favorite_count}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">History</h3>
          <p className="text-3xl">{stats.history_count}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Comments</h3>
          <p className="text-3xl">{stats.comment_count}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg text-center">
          <h3 className="text-lg font-semibold">Account Age</h3>
          <p className="text-3xl">{stats.account_age_days} days</p>
        </div>
      </div>
    </Card>
  );
};
```

#### Step 2.3: Fix ProfileEditForm.tsx
**File:** `frontend/src/features/profile/ProfileEditForm.tsx`

**Changes:**
```typescript
// Remove userId prop
interface ProfileEditFormProps {
  initialProfile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialProfile,
  onUpdate,
}) => {
  // ... state setup

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(profileData);  // ✅ No userId
      onUpdate(updatedProfile);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // ... rest of component
};
```

---

### **Phase 3: Implement Settings Page** (60 minutes)

#### Step 3.1: Create Settings Component
**File:** `frontend/src/features/profile/Settings.tsx`

**Full Implementation:**
```typescript
import React, { useState } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";

interface SettingsState {
  darkMode: boolean;
  emailNotifications: boolean;
  dailyVerseReminder: boolean;
  language: string;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: false,
    emailNotifications: true,
    dailyVerseReminder: true,
    language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold">Settings</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      {/* Appearance Settings */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Appearance</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Dark Mode</h3>
              <p className="text-sm text-gray-600">
                Use dark theme throughout the app
              </p>
            </div>
            <button
              onClick={() => handleToggle("darkMode")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
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
                  settings.emailNotifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Daily Verse Reminder</h3>
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
                  settings.dailyVerseReminder ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Language Settings */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Language</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Language
          </label>
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            className="block w-full border border-gray-300 rounded-md p-2"
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
    </div>
  );
};
```

---

### **Phase 4: Enhance Account Management** (45 minutes)

#### Step 4.1: Implement AccountManagement Features
**File:** `frontend/src/features/profile/AccountManagement.tsx`

**Full Implementation:**
```typescript
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
      <h1 className="text-3xl font-bold">Account Management</h1>

      {/* Change Password */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>
        <p className="text-gray-600 mb-4">
          Update your password to keep your account secure.
        </p>

        {!showPasswordForm ? (
          <Button onClick={() => setShowPasswordForm(true)}>
            Change Password
          </Button>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="text-green-500 text-sm">
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
        <h2 className="text-2xl font-bold mb-4">Export Your Data</h2>
        <p className="text-gray-600 mb-4">
          Download all your data including favorites, history, and comments.
        </p>
        <Button onClick={handleExportData} disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </Card>

      {/* Delete Account */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
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
              <div className="text-red-500 text-sm">{deleteError}</div>
            )}

            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="font-semibold text-red-800 mb-2">
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
```

---

### **Phase 5: Add Routes and Navigation** (15 minutes)

#### Step 5.1: Update App.tsx
**File:** `frontend/src/App.tsx`

**Add Routes:**
```typescript
import { Profile } from "./features/profile/Profile";
import { Settings } from "./features/profile/Settings";
import { AccountManagement } from "./features/profile/AccountManagement";

// Inside the protected routes section:
<Route path="profile" element={<Profile />} />
<Route path="settings" element={<Settings />} />
<Route path="account" element={<AccountManagement />} />
```

#### Step 5.2: Update Header Navigation
**File:** `frontend/src/components/layout/Header.tsx`

**Add Navigation Links:**
```typescript
<nav className="flex gap-4">
  <Link to="/daily">Daily</Link>
  <Link to="/favorites">Favorites</Link>
  <Link to="/history">History</Link>
  <Link to="/profile">Profile</Link>
  <Link to="/settings">Settings</Link>
</nav>
```

---

## 📋 Implementation Checklist

### Phase 1: Core API (30 min)
- [ ] Fix `profileService.getProfile()` - remove userId param
- [ ] Fix `profileService.updateProfile()` - remove userId param
- [ ] Fix `profileService.getStats()` - remove userId param
- [ ] Update `UserStats` interface in types/profile.ts
- [ ] Test API calls with browser console

### Phase 2: Profile Page (45 min)
- [ ] Rewrite Profile.tsx to use auth context
- [ ] Add edit mode toggle
- [ ] Integrate StatsCard component
- [ ] Integrate ProfileEditForm component
- [ ] Fix StatsCard to use correct field names
- [ ] Fix ProfileEditForm to remove userId param
- [ ] Add proper loading/error UI
- [ ] Test profile viewing
- [ ] Test profile editing

### Phase 3: Settings Page (60 min)
- [ ] Implement Settings.tsx component
- [ ] Add dark mode toggle
- [ ] Add notification settings
- [ ] Add language selector
- [ ] Add save functionality
- [ ] Add success/error feedback
- [ ] Test all settings toggles

### Phase 4: Account Management (45 min)
- [ ] Implement password change form
- [ ] Add password validation
- [ ] Implement delete account flow
- [ ] Add confirmation dialog
- [ ] Implement data export
- [ ] Add proper error handling
- [ ] Test all account management features

### Phase 5: Routes & Navigation (15 min)
- [ ] Add profile route to App.tsx
- [ ] Add settings route to App.tsx
- [ ] Add account route to App.tsx
- [ ] Update Header with navigation links
- [ ] Test navigation between pages

---

## 🧪 Testing Plan

### Manual Testing Checklist

#### Profile
