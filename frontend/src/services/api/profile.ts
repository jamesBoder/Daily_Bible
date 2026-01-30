// Profile Service 

// imports 
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { UpdateUserSettingsRequest, UserProfile, UserSettingsResponse, UserStats } from '../../types/profile';
import { showToast } from '../../utils/toast';

// init GetUserProfileParams interface
export interface GetUserProfileParams {
    userId: string;

}

// service object wit getProfile, updateProfile and getStats methods
export const profileService = {
    // Remove userId parameter - use JWT token
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>(
                API_ENDPOINTS.PROFILE
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load profile');
            throw error;
        }
    },

    // Remove userId parameter - use JWT token
    updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            const response = await apiClient.put<UserProfile>(
                API_ENDPOINTS.PROFILE,
                profileData
            );
            showToast.success('Profile updated successfully!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('Invalid profile data');
            } else if (error.response?.status === 409) {
                showToast.error('Username or email already taken');
            } else {
                showToast.error('Failed to update profile');
            }
            throw error;
        }
    },

    // Remove userId parameter - use JWT token
    getStats: async (): Promise<UserStats> => {
        try {
            const response = await apiClient.get<UserStats>(
                `${API_ENDPOINTS.PROFILE}/stats`
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load statistics');
            throw error;
        }
    },

    // getUserSettings method
    getUserSettings: async (): Promise<UserSettingsResponse> => {
        try {
            const response = await apiClient.get<UserSettingsResponse>(
                `${API_ENDPOINTS.PROFILE}/settings`
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load settings');
            throw error;
        }
    },

    // updateUserSettings method
    updateUserSettings: async (settings: UpdateUserSettingsRequest): Promise<UserSettingsResponse> => {
        try {
            const response = await apiClient.put<UserSettingsResponse>(
                `${API_ENDPOINTS.PROFILE}/settings`,
                settings
            );
            showToast.success('Settings saved!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('Invalid settings data');
            } else {
                showToast.error('Failed to save settings');
            }
            throw error;
        }
    }
};

