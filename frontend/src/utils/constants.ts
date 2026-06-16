// Remove trailing slash if present to avoid double slashes in URL concatenation
export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost').replace(/\/$/, '');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',

  // Email verification & password reset
  VERIFY_EMAIL: '/api/auth/verify-email',
  VERIFY_PENDING_EMAIL: '/api/auth/verify-pending-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  FORGOT_USERNAME: '/api/auth/forgot-username',
  RESET_PASSWORD: '/api/auth/reset-password',
  PROFILE_RESEND_VERIFICATION: '/api/profile/resend-verification',
  
  // Verses
  DAILY_VERSE: '/api/verses/daily',
  VERSE_BY_REFERENCE: '/api/verses',
  SEARCH_VERSES: '/api/verses/search',
  
  // Favorites
  FAVORITES: '/api/favorites',
  
  // History
  HISTORY: '/api/history',

  // Comments
  COMMENTS: '/api/comments',

  // Profile
  PROFILE: '/api/profile',

  // OAuth
  AUTH: '/api/auth',
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  EXPIRY: 'auth_token_expiry',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DAILY: '/daily',
  FAVORITES: '/favorites',
  HISTORY: '/history',
  PROFILE: '/profile',
  VERIFY_EMAIL_PENDING: '/verify-email-pending',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  FORGOT_USERNAME: '/forgot-username',
  RESET_PASSWORD: '/reset-password',
};
