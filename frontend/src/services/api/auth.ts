import apiClient from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';
import { AuthResponse, LoginCredentials, SignupCredentials, User } from '../../types/user';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Signup
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.SIGNUP,
      credentials
    );
    
    // Store token and user data
    if (response.data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.ME);
    return response.data.user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
};