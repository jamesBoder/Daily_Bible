import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';



const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Safety net: do NOT clear session for guests — they have no token to clear
      const isGuestSession = localStorage.getItem('is_guest') === 'true';
      if (!isGuestSession) {
        // Clear token and notify the app via event so React Router can handle
        // the redirect gracefully (no full page reload).
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user_data');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
