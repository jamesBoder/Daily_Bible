// outh api service 

// imports 

import apiClient from './client';
import { API_ENDPOINTS, API_BASE_URL } from '../../utils/constants';

// export GoogleAuthResponse interface
export interface GoogleAuthResponse {
    user: {
        id: number;
        email: string;
        username: string;
        google_id?: string;
        google_picture?: string;
        is_google_linked: boolean;
    };
    token: string;
}

// init oauthService function
export const oauthService = {
    // get Google OAuth login URL
    getGoogleLoginUrl: (): string => {
        // google oauth login
        return `${API_BASE_URL}${API_ENDPOINTS.AUTH}/google/login`;
    },

    // link Google account
    linkGoogle: async (code: string): Promise<void> => {
        await apiClient.post(`${API_ENDPOINTS.AUTH}/google/link`, { code });   

    },

    // unlink Google account
    unlinkGoogle: async (): Promise<void> => {
        await apiClient.post(`${API_ENDPOINTS.AUTH}/google/unlink`);
    },

    // exchange Google authorization code for token
    exchangeGoogleCode: async (code: string, state: string): Promise<GoogleAuthResponse> => {
        const response = await apiClient.post<GoogleAuthResponse>(`${API_ENDPOINTS.AUTH}/google/callback`, { code, state });
        return response.data;
    },

    loginWithToken: async (token: string): Promise<GoogleAuthResponse> => {
        const response = await apiClient.post<GoogleAuthResponse>(`${API_ENDPOINTS.AUTH}/token-login`, { token });
        return response.data;
    },
}