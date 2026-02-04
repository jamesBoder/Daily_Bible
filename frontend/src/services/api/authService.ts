import apiClient from './api';
import { User } from '../../types/user';
import { showToast } from '../../utils/toast';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';



export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/login',
        credentials
      );
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      
      showToast.success('Welcome back!');
      return response.data;
    } catch (error: any) {
      // throw error
      throw error;
    }
  },

  // Signup
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/register',
        credentials
      );
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
      
      showToast.success('Account created successfully! Welcome!');
      return response.data;
    } catch (error: any) {
      // throw error
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
      showToast.success('Logged out successfully');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{"user": User}>('/api/auth/me');
      return response.data.user;
    } catch (error: any) {
      showToast.error('Failed to load user data');
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Login with token (for OAuth)
  loginWithToken: async (token: string): Promise<AuthResponse> => {
    // Store the token first
    localStorage.setItem(TOKEN_KEY, token);
    
    // Fetch user data using the token
    const user = await authService.getCurrentUser();
    
    // Store user data
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return {
      token,
      user
    };
  },


  // Set auth token manually
  setAuthToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
};
