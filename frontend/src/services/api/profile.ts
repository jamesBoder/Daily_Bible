// Profile Service 

// imports 
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { UserProfile, UserStats } from '../../types/profile';

// init GetUserProfileParams interface
export interface GetUserProfileParams {
    userId: string;

}

// service object wit getProfile, updateProfile and getStats methods
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

