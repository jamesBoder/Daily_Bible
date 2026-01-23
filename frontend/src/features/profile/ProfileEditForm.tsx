// form for editing user profile information

// imports
import React, { useState } from "react";
import { UserProfile } from "../../types/profile";
import { profileService } from "../../services/api/profile";
import { Button } from "../../components/common/Button";

interface ProfileEditFormProps {
  initialProfile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

// ProfileEditForm component
//- Username field
//- Email field (with verification)
//- Password change section
//- Form validation
//- Save/Cancel buttons

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialProfile,
  onUpdate,
}) => {
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    username: initialProfile.username,
    email: initialProfile.email,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(profileData);
      onUpdate(updatedProfile);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-red-500">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={profileData.username || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          value={profileData.email || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          required
        />
      </div>

      <div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};
