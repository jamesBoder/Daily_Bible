export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
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
  AUTH: '/api/oauth',
};

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DAILY: '/daily',
  FAVORITES: '/favorites',
  HISTORY: '/history',
  PROFILE: '/profile',
};