# Daily Bible App - API Endpoints Documentation

**Document Status:** ✅ Approved  
**API Version:** v1  
**Base URL:** `http://localhost:8080/api/v1` (development)  
**Production URL:** `https://api.dailybible.app/api/v1`

---

## 🎯 API Overview

### **Design Principles:**

- RESTful architecture
- JSON request/response format
- JWT token authentication
- Consistent error handling
- Versioned endpoints (/api/v1)

### **Authentication:**

- Bearer token in Authorization header
- Access token (15 min expiry)
- Refresh token (7 day expiry)
- Public endpoints don't require auth

---

## 📋 Endpoint Summary

### **Authentication Endpoints**

```
POST   /api/v1/auth/signup          - Create new account
POST   /api/v1/auth/login           - Login to account
POST   /api/v1/auth/logout          - Logout (invalidate tokens)
POST   /api/v1/auth/refresh         - Refresh access token
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password  - Reset password with token
GET    /api/v1/auth/verify-email    - Verify email address
```

### **Verse Endpoints**

```
GET    /api/v1/verses/daily         - Get today's verse (public)
GET    /api/v1/verses/random        - Get random verse (public)
GET    /api/v1/verses/:id           - Get specific verse (public)
GET    /api/v1/verses/search        - Search verses (public)
```

### **Favorites Endpoints**

```
GET    /api/v1/favorites            - Get user's favorites (auth)
POST   /api/v1/favorites            - Add to favorites (auth)
DELETE /api/v1/favorites/:id        - Remove from favorites (auth)
GET    /api/v1/favorites/search     - Search favorites (auth)
```

### **History Endpoints**

```
GET    /api/v1/history              - Get reading history (auth)
POST   /api/v1/history              - Add to history (auth)
DELETE /api/v1/history              - Clear history (auth)
```

### **User/Profile Endpoints**

```
GET    /api/v1/user/profile         - Get user profile (auth)
PUT    /api/v1/user/profile         - Update profile (auth)
PUT    /api/v1/user/password        - Change password (auth)
DELETE /api/v1/user/account         - Delete account (auth)
GET    /api/v1/user/stats           - Get user statistics (auth)
```

---

## 🔐 Authentication Endpoints

### **POST /api/v1/auth/signup**

Create a new user account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "johndoe" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

**Errors:**

- `400` - Invalid email format
- `400` - Password too weak (min 8 chars)
- `409` - Email already exists

---

### **POST /api/v1/auth/login**

Login to existing account.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "emailVerified": true
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

**Errors:**

- `401` - Invalid credentials
- `404` - User not found

---

### **POST /api/v1/auth/refresh**

Refresh access token using refresh token.

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

**Errors:**

- `401` - Invalid or expired refresh token

---

### **POST /api/v1/auth/logout**

Logout and invalidate tokens.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📖 Verse Endpoints

### **GET /api/v1/verses/daily**

Get today's daily verse (public endpoint).

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "verse": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "reference": "John 3:16",
      "book": "John",
      "chapter": 3,
      "verseNumber": 16,
      "text": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      "translation": "KJV",
      "date": "2024-01-15",
      "theme": "Love"
    },
    "isFavorited": false // if authenticated
  }
}
```

**Errors:**

- `404` - No verse found for today
- `503` - Bible API unavailable

---

### **GET /api/v1/verses/:id**

Get specific verse by ID.

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "verse": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "reference": "Psalm 23:1",
      "book": "Psalms",
      "chapter": 23,
      "verseNumber": 1,
      "text": "The LORD is my shepherd; I shall not want.",
      "translation": "KJV"
    },
    "isFavorited": true // if authenticated
  }
}
```

**Errors:**

- `404` - Verse not found

---

### **GET /api/v1/verses/search**

Search verses by keyword or reference.

**Query Parameters:**

- `q` (required) - Search query
- `translation` (optional) - Bible translation (default: KJV)
- `limit` (optional) - Results per page (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Example:**

```
GET /api/v1/verses/search?q=love&translation=KJV&limit=10
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "verses": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "reference": "John 3:16",
        "text": "For God so loved the world...",
        "translation": "KJV"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## ⭐ Favorites Endpoints

### **GET /api/v1/favorites**

Get user's favorite verses.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `limit` (optional) - Results per page (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "verse": {
          "id": "660e8400-e29b-41d4-a716-446655440000",
          "reference": "John 3:16",
          "text": "For God so loved the world...",
          "translation": "KJV"
        },
        "notes": "My favorite verse",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**Errors:**

- `401` - Unauthorized (no token)

---

### **POST /api/v1/favorites**

Add verse to favorites.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "verseId": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "This verse inspires me" // optional
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "favorite": {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "verseId": "550e8400-e29b-41d4-a716-446655440000",
      "notes": "This verse inspires me",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Added to favorites"
}
```

**Errors:**

- `401` - Unauthorized
- `404` - Verse not found
- `409` - Already favorited

---

### **DELETE /api/v1/favorites/:id**

Remove verse from favorites.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Removed from favorites"
}
```

**Errors:**

- `401` - Unauthorized
- `404` - Favorite not found

---

## 📚 History Endpoints

### **GET /api/v1/history**

Get user's reading history.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `days` (optional) - Number of days (default: 30, max: 90)
- `limit` (optional) - Results per page (default: 20)
- `offset` (optional) - Pagination offset (default: 0)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "verse": {
          "id": "660e8400-e29b-41d4-a716-446655440000",
          "reference": "John 3:16",
          "text": "For God so loved the world...",
          "translation": "KJV"
        },
        "viewedAt": "2024-01-15T10:30:00Z",
        "deviceType": "mobile"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### **POST /api/v1/history**

Add verse to reading history (automatic tracking).

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "verseId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceType": "mobile" // optional: mobile, tablet, desktop
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Added to history"
}
```

---

### **DELETE /api/v1/history**

Clear all reading history.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "History cleared"
}
```

---

## 👤 User/Profile Endpoints

### **GET /api/v1/user/profile**

Get user profile information.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "johndoe",
      "emailVerified": true,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "preferredTranslation": "KJV",
      "timezone": "America/New_York",
      "notificationEnabled": true,
      "notificationTime": "08:00:00",
      "themePreference": "light",
      "readingStreakCurrent": 7,
      "readingStreakLongest": 28
    }
  }
}
```

---

### **PUT /api/v1/user/profile**

Update user profile.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Request:**

```json
{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "preferredTranslation": "NIV",
  "timezone": "America/New_York",
  "notificationEnabled": true,
  "notificationTime": "08:00:00",
  "themePreference": "dark"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "profile": {
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "preferredTranslation": "NIV",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  },
  "message": "Profile updated"
}
```

---

### **GET /api/v1/user/stats**

Get user statistics.

**Headers:**

```
Authorization: Bearer <access_token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalFavorites": 25,
      "totalVersesViewed": 150,
      "uniqueDaysRead": 45,
      "currentStreak": 7,
      "longestStreak": 28,
      "accountAge": 90,
      "lastReadDate": "2024-01-15"
    }
  }
}
```

---

## ⚠️ Error Response Format

All errors follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // optional additional info
  }
}
```

### **Common Error Codes:**

**Authentication Errors (401):**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Validation Errors (400):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Not Found Errors (404):**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**Server Errors (500):**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## 🔒 Authentication Flow

### **1. Sign Up Flow**

```
Client                          Server
  |                               |
  |-- POST /auth/signup --------->|
  |   (email, password)           |
  |                               |
  |<-- 201 Created ---------------|
  |   (user, tokens)              |
  |                               |
  |-- Store tokens -------------->|
  |                               |
```

### **2. Login Flow**

```
Client                          Server
  |                               |
  |-- POST /auth/login ---------->|
  |   (email, password)           |
  |                               |
  |<-- 200 OK -------------------|
  |   (user, tokens)              |
  |                               |
  |-- Store tokens -------------->|
  |                               |
```

### **3. Authenticated Request Flow**

```
Client                          Server
  |                               |
  |-- GET /favorites ------------>|
  |   Authorization: Bearer token |
  |                               |
  |<-- 200 OK -------------------|
  |   (favorites data)            |
  |                               |
```

### **4. Token Refresh Flow**

```
Client                          Server
  |                               |
  |-- POST /auth/refresh -------->|
  |   (refresh token)             |
  |                               |
  |<-- 200 OK -------------------|
  |   (new access token)          |
  |                               |
  |-- Update stored token ------->|
  |                               |
```

---

## 🚀 Quick Start Examples

### **Example 1: Get Daily Verse (No Auth)**

```bash
curl -X GET http://localhost:8080/api/v1/verses/daily
```

### **Example 2: Sign Up**

```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### **Example 3: Login**

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### **Example 4: Add to Favorites (Auth Required)**

```bash
curl -X POST http://localhost:8080/api/v1/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "verseId": "550e8400-e29b-41d4-a716-446655440000",
    "notes": "My favorite verse"
  }'
```

### **Example 5: Get Favorites**

```bash
curl -X GET http://localhost:8080/api/v1/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📊 Rate Limiting

**Limits:**

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 300 requests/minute
- Auth endpoints: 10 requests/minute (prevent brute force)

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

**Rate Limit Error (429):**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## ✅ API Implementation Checklist

**Backend (Go + Gin):**

- [ ] Setup Gin router
- [ ] Implement JWT middleware
- [ ] Create auth handlers
- [ ] Create verse handlers
- [ ] Create favorites handlers
- [ ] Create history handlers
- [ ] Create user/profile handlers
- [ ] Add error handling middleware
- [ ] Add CORS middleware
- [ ] Add rate limiting
- [ ] Add request logging

**Frontend (React):**

- [ ] Create API client service
- [ ] Implement auth service
- [ ] Implement verse service
- [ ] Implement favorites service
- [ ] Implement history service
- [ ] Implement user service
- [ ] Add token management
- [ ] Add error handling
- [ ] Add loading states

---

**Status:** ✅ Complete  
**Hours Completed:** 16 of 30  
**Next:** Start coding! Backend setup first, then frontend.
