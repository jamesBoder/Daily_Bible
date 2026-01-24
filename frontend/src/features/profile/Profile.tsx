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
  const { user } = useAuth(); // ✅ Get from auth context
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
      const data = await profileService.getProfile(); // ✅ No userId
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
  if (error)
    return (
      <Card>
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  if (!profile)
    return (
      <Card>
        <div>No profile data available.</div>
      </Card>
    );

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
          <ProfileEditForm initialProfile={profile} onUpdate={handleUpdate} />
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-600">Username</h2>
              <p className="text-lg dark:text-gray-200">{profile.username}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-600">Email</h2>
              <p className="text-lg dark:text-gray-200">{profile.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-600">
                Member Since
              </h2>
              <p className="text-lg dark:text-gray-200">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      {user && <StatsCard />}
    </div>
  );
};
