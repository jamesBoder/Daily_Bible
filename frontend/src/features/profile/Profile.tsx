import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { StatsCard } from "./StatsCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { VerseCardSkeleton } from "../../components/common/Skeleton";

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

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

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      await profileService.resendVerification();
      // toast shown inside resendVerification()
    } catch {
      // toast shown inside resendVerification()
    } finally {
      setIsResendingVerification(false);
    }
  };

  if (isLoading) {
      return <VerseCardSkeleton />;
    }
    
  if (error)
    return (
      <Card>
        <div className="text-red-500">Error: {error}</div>
      </Card>
    );
  if (!profile)
    return (
      <Card>
      <div>No profile data available</div>
      </Card>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Email verification banner */}
      {profile.email_verified === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                Email not verified
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Please verify your email address. Check your inbox for a verification link.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
            className="text-sm font-medium text-yellow-800 dark:text-yellow-300 underline hover:no-underline disabled:opacity-50 whitespace-nowrap"
          >
            {isResendingVerification ? "Sending..." : "Resend email"}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">My Profile</h1>
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
              <p className="text-sm font-medium text-gray-500 dark:text-gray-600">Username</p>
              <p className="text-lg dark:text-gray-200">{profile.username}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-600">Email</p>
              <p className="text-lg dark:text-gray-200">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-600">
                Member Since
              </p>
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
