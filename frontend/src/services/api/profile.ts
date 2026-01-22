// Profile Service 

// imports 
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { UserProfile } from '../../types/profile';

// init GetUserProfileParams interface
export interface GetUserProfileParams {
    userId: string;

}

// service object wit getProfile, updateProfile and getStats methods
export const profileService = {
    // fetch user profile by userId
    getProfile: async (userId: string): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>(
                `${API_ENDPOINTS.PROFILE}/${userId}`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching user profile:', error);
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    },

    // update user profile
    updateProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            const response = await apiClient.put<UserProfile>(
                `${API_ENDPOINTS.PROFILE}/${userId}`,
                profileData
            );
            return response.data;
        } catch (error: any) {
            console.error('Error updating user profile:', error);
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    },

    // get user statistics
    getStats: async (userId: string): Promise<any> => {
        try {
            const response = await apiClient.get<any>(
                `${API_ENDPOINTS.PROFILE}/${userId}/stats`
            );
            return response.data;
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }
};

