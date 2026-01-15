# Week 5: Frontend Foundation & React Setup

**Goal:** Build the React frontend foundation and connect it to the backend API

**Timeline:** 5-6 days (20-25 hours)  
**Status:** 📋 Ready to Start

---

## 🎯 Week 5 Overview

### **What We're Building:**
1. React application setup with TypeScript
2. Authentication UI (Login/Signup)
3. Protected routing system
4. API service layer for backend communication
5. State management for user authentication
6. Daily verse display page
7. Basic layout and navigation

### **What You Already Have:**
- ✅ Backend API fully functional
- ✅ Authentication endpoints working
- ✅ Favorites & History endpoints tested
- ✅ Verse endpoints operational
- ✅ Database schema complete
- ✅ API documentation ready

### **By End of Week 5:**
- ✅ React app running locally
- ✅ Users can signup and login
- ✅ Protected routes working
- ✅ Daily verse displays beautifully
- ✅ Navigation between pages
- ✅ Responsive mobile-first design
- ✅ Connected to backend API

---

## ⚠️ Important Setup Notes

**Before You Start:**

1. **Node Version Compatibility:**
   - You're running Node v18.19.1
   - React Router v7 requires Node 20+
   - **Solution:** Use React Router v6 (compatible with Node 18)
   - Install with: `npm install react-router-dom@6`

2. **Tailwind CSS Setup:**
   - If `npx tailwindcss init -p` fails, manually create config files
   - See detailed instructions in Step 2 below

3. **Security Vulnerabilities:**
   - The 9 vulnerabilities shown are mostly in dev dependencies
   - They won't affect your production build
   - You can safely ignore them for development
   - Or run `npm audit fix` to fix non-breaking issues

**Quick Fix Commands:**
```bash
# If you already installed react-router-dom@7, downgrade to v6:
npm uninstall react-router-dom
npm install react-router-dom@6

# If tailwindcss init failed, try:
npx tailwindcss@latest init -p

# Or manually create the config files (see Step 2)
```

---

## 📅 Week 5 Schedule

### **Day 1: React Setup & Project Structure (4-5 hours)**
- Step 1: Initialize React Project with TypeScript (1 hour)
- Step 2: Install Dependencies & Configure Tailwind CSS (1 hour)
- Step 3: Create Project Structure & Base Components (2-3 hours)

### **Day 2: API Service Layer & Authentication State (4-5 hours)**
- Step 4: Build API Client & Service Layer (2 hours)
- Step 5: Implement Authentication Context & State Management (2-3 hours)

### **Day 3: Authentication UI (4-5 hours)**
- Step 6: Create Login Page (2 hours)
- Step 7: Create Signup Page (2 hours)
- Step 8: Implement Protected Routes (1 hour)

### **Day 4: Daily Verse Display (4-5 hours)**
- Step 9: Create Daily Verse Page & Components (2-3 hours)
- Step 10: Implement Verse Card Design (1-2 hours)
- Step 11: Add Loading & Error States (1 hour)

### **Day 5: Navigation & Layout (3-4 hours)**
- Step 12: Build Navigation Component (1-2 hours)
- Step 13: Create Layout System (1-2 hours)
- Step 14: Add Responsive Design (1 hour)

### **Day 6: Testing & Polish (3-4 hours)**
- Step 15: Integration Testing (2 hours)
- Step 16: Bug Fixes & Polish (1-2 hours)

---

## 🎯 Success Criteria

**By end of Week 5, you should be able to:**

```bash
# Start the frontend
cd frontend
npm start

# Then in browser:
1. Visit http://localhost:3000
2. See the daily verse (no login required)
3. Click "Sign Up" and create an account
4. Login with your credentials
5. See authenticated navigation
6. Navigate between pages
7. Logout successfully
```

---

## 📊 Week 5 Detailed Implementation Plan

### **Day 1: React Setup & Project Structure**

#### **Step 1: Initialize React Project with TypeScript (1 hour)**

**Create React App:**

```bash
# Navigate to project root
cd go_proj/Daily_Bible

# Create React app with TypeScript
npx create-react-app frontend --template typescript

# Navigate to frontend
cd frontend

# Test that it works
npm start
```

**Verify Setup:**
- App runs at http://localhost:3000
- No errors in console
- Default React page displays

**Clean Up Default Files:**

```bash
# Remove unnecessary files
rm src/App.test.tsx
rm src/logo.svg
rm src/reportWebVitals.ts
rm src/setupTests.ts
```

**Update `src/App.tsx`:**

```typescript
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Daily Bible App</h1>
      <p>Coming soon...</p>
    </div>
  );
}

export default App;
```

---

#### **Step 2: Install Dependencies & Configure Tailwind CSS (1 hour)**

**Install Core Dependencies:**

```bash
# React Router for navigation (use v6 for Node 18 compatibility)
npm install react-router-dom@6

# Axios for API calls
npm install axios

# TypeScript types for React Router v6
npm install --save-dev @types/react-router-dom

# Tailwind CSS for styling
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Initialize Tailwind CSS (creates tailwind.config.js and postcss.config.js)
npx tailwindcss init -p
```

**Note on Node Version:**
- If you see `EBADENGINE` warnings about React Router requiring Node 20+, don't worry! We're using React Router v6 which is compatible with Node 18.
- React Router v7 requires Node 20+, but v6 works perfectly fine with Node 18.19.1
- If the `npx tailwindcss init -p` command fails, try running it with the full path:
  ```bash
  npx tailwindcss@latest init -p
  ```
  Or manually create the config files (see below).

**If Tailwind Init Fails, Create Config Files Manually:**

If `npx tailwindcss init -p` doesn't work, create these files manually:

**Create `tailwind.config.js` in the frontend root:**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Create `postcss.config.js` in the frontend root:**
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Configure Tailwind CSS:**

**Update `tailwind.config.js`:**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
```

**Update `src/index.css`:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors;
  }
  
  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

**Install Google Fonts:**

**Update `public/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0ea5e9" />
    <meta name="description" content="Daily Bible verses for inspiration" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
    
    <title>Daily Bible - Inspiration Every Day</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

---

#### **Step 3: Create Project Structure & Base Components (2-3 hours)**

**Create Folder Structure:**

```bash
cd src

# Create main directories
mkdir components features hooks services types utils contexts

# Create subdirectories
mkdir components/common components/layout
mkdir features/auth features/verse features/favorites features/history features/profile
mkdir services/api
```

**Final Structure:**

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   │
│   └── layout/          # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
│
├── features/
│   ├── auth/            # Authentication feature
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── types.ts
│   │
│   ├── verse/           # Verse feature
│   │   ├── DailyVerse.tsx
│   │   ├── VerseCard.tsx
│   │   └── types.ts
│   │
│   ├── favorites/       # Favorites feature
│   │   └── FavoritesList.tsx
│   │
│   ├── history/         # History feature
│   │   └── HistoryList.tsx
│   │
│   └── profile/         # Profile feature
│       └── Profile.tsx
│
├── contexts/
│   └── AuthContext.tsx  # Authentication context
│
├── hooks/
│   ├── useAuth.ts       # Auth hook
│   └── useVerse.ts      # Verse hook
│
├── services/
│   └── api/
│       ├── client.ts    # Axios client
│       ├── auth.ts      # Auth API calls
│       └── verse.ts     # Verse API calls
│
├── types/
│   ├── user.ts          # User types
│   ├── verse.ts         # Verse types
│   └── api.ts           # API response types
│
├── utils/
│   ├── constants.ts     # Constants
│   └── helpers.ts       # Helper functions
│
├── App.tsx
├── index.tsx
└── index.css
```

**Create Base Types:**

**File: `src/types/user.ts`**

```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

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
```

**File: `src/types/verse.ts`**

```typescript
export interface Verse {
  id: number;
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  translation?: string;
}

export interface DailyVerseResponse {
  verse: Verse;
}
```

**File: `src/types/api.ts`**

```typescript
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
```

**Create Base Components:**

**File: `src/components/common/Button.tsx`**

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
```

**File: `src/components/common/Input.tsx`**

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
```

**File: `src/components/common/Card.tsx`**

```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};
```

**File: `src/components/common/Loading.tsx`**

```typescript
import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};
```

**Create Constants:**

**File: `src/utils/constants.ts`**

```typescript
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
```

---

### **Day 2: API Service Layer & Authentication State**

#### **Step 4: Build API Client & Service Layer (2 hours)**

**Create Axios Client:**

**File: `src/services/api/client.ts`**

```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../../utils/constants';

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
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
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
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Create Auth Service:**

**File: `src/services/api/auth.ts`**

```typescript
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
```

**Create Verse Service:**

**File: `src/services/api/verse.ts`**

```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Verse, DailyVerseResponse } from '../../types/verse';

export const verseService = {
  // Get daily verse
  getDailyVerse: async (): Promise<Verse> => {
    const response = await apiClient.get<DailyVerseResponse>(
      API_ENDPOINTS.DAILY_VERSE
    );
    return response.data.verse;
  },

  // Get verse by reference
  getVerseByReference: async (reference: string): Promise<Verse> => {
    const response = await apiClient.get<{ verse: Verse }>(
      `${API_ENDPOINTS.VERSE_BY_REFERENCE}/${reference}`
    );
    return response.data.verse;
  },

  // Search verses
  searchVerses: async (query: string): Promise<Verse[]> => {
    const response = await apiClient.get<{ verses: Verse[] }>(
      API_ENDPOINTS.SEARCH_VERSES,
      { params: { q: query } }
    );
    return response.data.verses;
  },
};
```

---

#### **Step 5: Implement Authentication Context & State Management (2-3 hours)**

**Create Auth Context:**

**File: `src/contexts/AuthContext.tsx`**

```typescript
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types/user';
import { authService } from '../services/api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Fetch user data from API
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid token
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await authService.signup(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear user anyway
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**Create useAuth Hook:**

**File: `src/hooks/useAuth.ts`**

```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

**Update App.tsx to use AuthProvider:**

**File: `src/App.tsx`**

```typescript
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <h1 className="text-3xl font-bold text-primary-600">
            Daily Bible App
          </h1>
          <p className="text-gray-600 mt-4">
            Frontend foundation is ready!
          </p>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

---

### **Day 3: Authentication UI**

#### **Step 6: Create Login Page (2 hours)**

**File: `src/features/auth/Login.tsx`**

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to continue your spiritual journey
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

---

#### **Step 7: Create Signup Page (2 hours)**

**File: `src/features/auth/Signup.tsx`**

```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        name: formData.name,
      });
      navigate('/');
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.error || 'Signup failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600">
            Join us on your spiritual journey
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.general}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              error={errors.username}
              required
              autoComplete="username"
            />

            <Input
              label="Name (Optional)"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              required
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

---

#### **Step 8: Implement Protected Routes (1 hour)**

**Create ProtectedRoute Component:**

**File: `src/components/common/ProtectedRoute.tsx`**

```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

**Create Routes Configuration:**

**File: `src/App.tsx`** (Updated)

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { DailyVerse } from './features/verse/DailyVerse';
import { Layout } from './components/layout/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes with layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DailyVerse />} />
            <Route path="daily" element={<DailyVerse />} />
            {/* More routes will be added in future weeks */}
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

---

### **Day 4: Daily Verse Display**

#### **Step 9: Create Daily Verse Page & Components (2-3 hours)**

**Create useVerse Hook:**

**File: `src/hooks/useVerse.ts`**

```typescript
import { useState, useEffect } from 'react';
import { Verse } from '../types/verse';
import { verseService } from '../services/api/verse';

export const useVerse = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyVerse = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await verseService.getDailyVerse();
      setVerse(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  return {
    verse,
    isLoading,
    error,
    refetch: fetchDailyVerse,
  };
};
```

**Create Daily Verse Page:**

**File: `src/features/verse/DailyVerse.tsx`**

```typescript
import React from 'react';
import { useVerse } from '../../hooks/useVerse';
import { VerseCard } from './VerseCard';
import { Loading } from '../../components/common/Loading';
import { Button } from '../../components/common/Button';

export const DailyVerse: React.FC = () => {
  const { verse, isLoading, error, refetch } = useVerse();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refetch} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-700">No verse available today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Today's Verse
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      <VerseCard verse={verse} />
    </div>
  );
};
```

---

#### **Step 10: Implement Verse Card Design (1-2 hours)**

**File: `src/features/verse/VerseCard.tsx`**

```typescript
import React, { useState } from 'react';
import { Verse } from '../../types/verse';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface VerseCardProps {
  verse: Verse;
}

export const VerseCard: React.FC<VerseCardProps> = ({ verse }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleFavorite = async () => {
    // TODO: Implement favorite functionality in Week 6
    setIsFavorited(!isFavorited);
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: verse.reference,
          text: `${verse.text}\n\n- ${verse.reference}`,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(
          `${verse.text}\n\n- ${verse.reference}`
        );
        alert('Verse copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="relative">
      {/* Decorative quote mark */}
      <div className="absolute top-4 left-4 text-6xl text-primary-100 font-serif">
        "
      </div>

      {/* Verse text */}
      <div className="relative z-10 mb-6">
        <p className="text-xl md:text-2xl text-gray-800 font-serif leading-relaxed text-center px-8 py-4">
          {verse.text}
        </p>
      </div>

      {/* Reference */}
      <div className="text-center mb-6">
        <p className="text-lg font-semibold text-primary-700">
          {verse.reference}
        </p>
        {verse.version && (
          <p className="text-sm text-gray-500 mt-1">
            {verse.version}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleFavorite}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <svg
            className={`w-5 h-5 ${isFavorited ? 'fill-red-500' : 'fill-none'}`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {isFavorited ? 'Favorited' : 'Favorite'}
        </Button>

        <Button
          onClick={handleShare}
          variant="secondary"
          isLoading={isSharing}
          className="flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </Button>
      </div>
    </Card>
  );
};
```

---

#### **Step 11: Add Loading & Error States (1 hour)**

**Already implemented in:**
- `Loading.tsx` component
- `DailyVerse.tsx` with error handling
- `Button.tsx` with loading state

---

### **Day 5: Navigation & Layout**

#### **Step 12: Build Navigation Component (1-2 hours)**

**File: `src/components/layout/Header.tsx`**

```typescript
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              Daily Bible
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/daily"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Daily Verse
            </Link>
            <Link
              to="/favorites"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              Favorites
            </Link>
            <Link
              to="/history"
              className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
            >
              History
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700">
              Welcome, {user?.username}
            </span>
            <Button onClick={handleLogout} variant="secondary" className="text-sm">
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/daily"
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Daily Verse
              </Link>
              <Link
                to="/favorites"
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Favorites
              </Link>
              <Link
                to="/history"
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                History
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 mb-2">
                  Welcome, {user?.username}
                </p>
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
```

---

#### **Step 13: Create Layout System (1-2 hours)**

**File: `src/components/layout/Footer.tsx`**

```typescript
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Daily Bible. All rights reserved.</p>
          <p className="mt-2">
            Bringing you daily inspiration through God's Word
          </p>
        </div>
      </div>
    </footer>
  );
};
```

**File: `src/components/layout/Layout.tsx`**

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
```

---

#### **Step 14: Add Responsive Design (1 hour)**

**Responsive design is already implemented through:**
- Tailwind CSS responsive utilities (`sm:`, `md:`, `lg:`)
- Mobile-first approach in all components
- Responsive navigation with mobile menu
- Flexible layouts using Flexbox and Grid

**Test responsive design:**
1. Open browser DevTools
2. Toggle device toolbar
3. Test on different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px+)

---

### **Day 6: Testing & Polish**

#### **Step 15: Integration Testing (2 hours)**

**Manual Testing Checklist:**

```markdown
## Authentication Flow
- [ ] Can signup with valid credentials
- [ ] Cannot signup with invalid email
- [ ] Cannot signup with short password
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Token is stored in localStorage
- [ ] User data is stored in localStorage

## Protected Routes
- [ ] Redirects to login when not authenticated
- [ ] Can access protected routes when authenticated
- [ ] Logout clears token and redirects to login

## Daily Verse
- [ ] Daily verse loads correctly
- [ ] Loading state displays while fetching
- [ ] Error state displays on API failure
- [ ] Can retry on error
- [ ] Verse displays with proper formatting

## Navigation
- [ ] All navigation links work
- [ ] Mobile menu opens and closes
- [ ] Active route is highlighted
- [ ] Logout button works

## Responsive Design
- [ ] Works on mobile (375px)
- [ ] Works on tablet (768px)
- [ ] Works on desktop (1024px+)
- [ ] No horizontal scroll
- [ ] Touch targets are adequate on mobile
```

**Create Test Script:**

**File: `frontend/TEST_PLAN.md`**

```markdown
# Week 5 Testing Plan

## Setup
1. Start backend: `cd backend && go run cmd/api/main.go`
2. Start frontend: `cd frontend && npm start`
3. Open browser at http://localhost:3000

## Test Cases

### 1. Signup Flow
**Steps:**
1. Navigate to /signup
2. Fill in all fields with valid data
3. Click "Create Account"

**Expected:**
- Redirects to home page
- User is authenticated
- Daily verse is displayed

### 2. Login Flow
**Steps:**
1. Logout if logged in
2. Navigate to /login
3. Enter valid credentials
4. Click "Sign In"

**Expected:**
- Redirects to home page
- User is authenticated
- Welcome message shows username

### 3. Protected Routes
**Steps:**
1. Logout
2. Try to access /daily directly

**Expected:**
- Redirects to /login
- After login, redirects back to /daily

### 4. Daily Verse Display
**Steps:**
1. Login
2. Navigate to /daily

**Expected:**
- Verse loads and displays
- Reference is shown
- Favorite and Share buttons work

### 5. Navigation
**Steps:**
1. Click each navigation link
2. Test mobile menu on small screen

**Expected:**
- All links navigate correctly
- Mobile menu opens/closes properly

### 6. Logout
**Steps:**
1. Click logout button

**Expected:**
- Redirects to login page
- Token is cleared
- Cannot access protected routes
```

---

#### **Step 16: Bug Fixes & Polish (1-2 hours)**

**Common Issues to Check:**

1. **CORS Issues:**
   - Ensure backend CORS is configured correctly
   - Check browser console for CORS errors

2. **API Connection:**
   - Verify `REACT_APP_API_URL` in `.env`
   - Test API endpoints with Postman first

3. **Token Expiration:**
   - Handle expired tokens gracefully
   - Redirect to login on 401 errors

4. **Loading States:**
   - Ensure all async operations show loading
   - Prevent multiple simultaneous requests

5. **Error Messages:**
   - Display user-friendly error messages
   - Log detailed errors to console

**Create Environment File:**

**File: `frontend/.env`**

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_NAME=Daily Bible
```

**File: `frontend/.env.example`**

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_NAME=Daily Bible
```

---

## 🎉 Week 5 Complete!

### **What You've Built:**

✅ **React Application:**
- TypeScript setup
- Tailwind CSS styling
- Project structure

✅ **Authentication System:**
- Login page
- Signup page
- Protected routes
- Auth context & state management

✅ **API Integration:**
- Axios client with interceptors
- Auth service
- Verse service
- Error handling

✅ **Daily Verse Feature:**
- Verse display page
- Beautiful verse card
- Loading & error states
- Share functionality

✅ **Navigation & Layout:**
- Header with navigation
- Footer
- Responsive mobile menu
- Layout system

### **How to Run:**

```bash
# Terminal 1: Start Backend
cd backend
go run cmd/api/main.go

# Terminal 2: Start Frontend
cd frontend
npm start

# Open browser at http://localhost:3000
```

### **Next Steps (Week 6):**

1. **Favorites Feature:**
   - Add/remove favorites
   - View favorites list
   - Favorites API integration

2. **History Feature:**
   - Track viewed verses
   - Display history list
   - Pagination

3. **Profile Page:**
   - View user info
   - Update profile
   - Change password

4. **Search Feature:**
   - Search verses by keyword
   - Filter by book/chapter
   - Search results page

---

## 📝 Notes & Tips

### **Development Workflow:**

1. **Always run backend first** before starting frontend
2. **Check browser console** for errors
3. **Use React DevTools** for debugging
4. **Test on multiple devices** for responsive design

### **Common Commands:**

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests (when added)
npm test
```

### **Troubleshooting:**

**Issue: EBADENGINE warnings for React Router**
- **Cause:** React Router v7 requires Node 20+, but you have Node 18.19.1
- **Solution:** Use React Router v6 instead:
  ```bash
  npm uninstall react-router-dom
  npm install react-router-dom@6
  ```
- **Note:** The warnings won't affect functionality if using v6

**Issue: `npx tailwindcss init -p` fails with "tailwind: not found"**
- **Solution 1:** Try with explicit version:
  ```bash
  npx tailwindcss@latest init -p
  ```
- **Solution 2:** Manually create config files (see Step 2 above)
- **Solution 3:** Clear npm cache and reinstall:
  ```bash
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
  npx tailwindcss init -p
  ```

**Issue: Security vulnerabilities (9 vulnerabilities)**
- **Note:** These are mostly in development dependencies and won't affect production
- **To fix non-breaking issues:**
  ```bash
  npm audit fix
  ```
- **To fix all (may cause breaking changes):**
  ```bash
  npm audit fix --force
  ```
- **Recommended:** Review each vulnerability before forcing fixes:
  ```bash
  npm audit
  ```

**Issue: CORS errors**
- Solution: Check backend CORS configuration
- Ensure `AllowOrigins` includes `http://localhost:3000`

**Issue: API not connecting**
- Solution: Verify backend is running on port 8080
- Check `.env` file has correct `REACT_APP_API_URL`

**Issue: Token not persisting**
- Solution: Check localStorage in DevTools
- Verify token is being saved in auth service

**Issue: Routes not working**
- Solution: Check React Router configuration
- Verify all routes are defined in `App.tsx`

**Issue: Tailwind styles not applying**
- Solution 1: Verify `tailwind.config.js` content paths are correct
- Solution 2: Check that `index.css` has the Tailwind directives
- Solution 3: Restart the development server
  ```bash
  # Stop the server (Ctrl+C) then:
  npm start
  ```

---

## 🚀 Success Metrics

By the end of Week 5, you should be able to:

- ✅ Run the frontend application locally
- ✅ Create a new user account
- ✅ Login with credentials
- ✅ View the daily verse
- ✅ Navigate between pages
- ✅ Logout successfully
- ✅ See responsive design on mobile

**Congratulations! Your frontend foundation is complete!** 🎊

Next week, we'll add more features like favorites, history, and search functionality.
