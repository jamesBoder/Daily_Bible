# Priority 4: Google OAuth Implementation Plan

**App Name:** Words of Praise  
**Estimated Time:** 2-3 days  
**Status:** Planning Phase  
**Last Updated:** December 2024

---

## 📋 Overview

Implement Google OAuth 2.0 authentication to allow users to sign up and log in to Words of Praise using their Google accounts. This provides a better user experience and increases conversion rates.

---

## 🎯 Goals

1. **Allow users to sign up with Google** - One-click registration
2. **Allow users to log in with Google** - Quick authentication
3. **Link Google account to existing accounts** - For users who signed up with email
4. **Unlink Google account** - Allow users to disconnect Google
5. **Maintain security** - Proper token validation and user data protection

---

## ✅ What Already Exists

### Backend:
- ✅ User model with authentication
- ✅ JWT token service
- ✅ Auth handlers (Register, Login, GetMe)
- ✅ User repository with CRUD operations
- ✅ Middleware for authentication

### Frontend:
- ✅ Auth context and hooks
- ✅ Login/Signup pages
- ✅ Settings page structure
- ✅ Account Management page

---

## 🚀 What Needs to Be Built

### **Phase 1: Google OAuth Setup** (30 minutes)
1. Create Google Cloud Project
2. Configure OAuth 2.0 credentials
3. Set up authorized redirect URIs
4. Get Client ID and Client Secret

### **Phase 2: Backend Implementation** (1 day)
1. Update User model for Google OAuth
2. Create OAuth handlers
3. Add OAuth routes
4. Implement token exchange
5. Handle account linking/unlinking

### **Phase 3: Frontend Implementation** (1 day)
1. Create Google Login button component
2. Add OAuth flow to Login page
3. Add OAuth flow to Signup page
4. Add account linking to Settings
5. Handle OAuth callbacks

### **Phase 4: Testing & Polish** (4-6 hours)
1. Test OAuth flow end-to-end
2. Test account linking
3. Test error scenarios
4. Add loading states
5. Improve error messages

---

## 📝 Detailed Implementation Plan

---

## **PHASE 1: Google OAuth Setup** (30 minutes)

### Step 1.1: Create Google Cloud Project

**Actions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Words of Praise"
3. Enable Google+ API (for user profile data)

### Step 1.2: Configure OAuth 2.0 Credentials

**Actions:**
1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Configure OAuth consent screen:
   - App name: "Words of Praise"
   - User support email: your email
   - Developer contact: your email
   - Scopes: email, profile, openid
4. Create OAuth Client ID:
   - **Application type: Web application** ✅
   - Name: "Words of Praise Web Client"

**Important Note about Application Type:**
- ✅ **Web application** is CORRECT for this project
- This works for:
  - Desktop browsers (Chrome, Firefox, Safari, Edge)
  - Mobile browsers (iOS Safari, Chrome Mobile, etc.)
  - Progressive Web Apps (PWAs)
  - Responsive web apps accessed on mobile devices

**When to use other types:**
- **Android** - Only if building a native Android app (not needed for web)
- **iOS** - Only if building a native iOS app (not needed for web)
- **Chrome App** - Deprecated, don't use
- **Desktop App** - Only for Electron or native desktop apps

**For this project:** Since Words of Praise is a React web application that works on both desktop and mobile browsers, "Web application" is the correct and only choice needed.

**Future Consideration:** If you later decide to build native mobile apps (React Native, Flutter, etc.), you would create ADDITIONAL OAuth clients for Android and iOS, but keep the web client for the browser-based app.

### Step 1.3: Set Authorized Redirect URIs

**Development:**
```
http://localhost:3000/auth/google/callback
http://localhost:8080/api/auth/google/callback
```

**Production (when deployed):**
```
https://yourdomain.com/auth/google/callback
https://api.yourdomain.com/api/auth/google/callback
```

### Step 1.4: Save Credentials

**What you'll get:**
- Client ID: `xxxxx.apps.googleusercontent.com`
- Client Secret: `xxxxx`

**Where to store:**
- Backend: `.env` file (never commit to git!)
- Frontend: Environment variable

---

## **PHASE 2: Backend Implementation** (1 day)

### Step 2.1: Update User Model (15 minutes)

**File:** `backend/internal/models/user.go`

**Changes needed:**
```go
type User struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
    
    // Existing fields
    Email    string `gorm:"uniqueIndex;not null" json:"email"`
    Username string `gorm:"size:50" json:"username"`
    Password string `gorm:"not null" json:"-"` // Make nullable for OAuth users
    
    // NEW: Google OAuth fields
    GoogleID       string `gorm:"uniqueIndex" json:"google_id,omitempty"`
    GoogleEmail    string `json:"google_email,omitempty"`
    GooglePicture  string `json:"google_picture,omitempty"`
    IsGoogleLinked bool   `gorm:"default:false" json:"is_google_linked"`
    
    // Relationships
    Favorites []Favorite `gorm:"foreignKey:UserID" json:"favorites,omitempty"`
    History   []History  `gorm:"foreignKey:UserID" json:"history,omitempty"`
}
```

**Why these fields:**
- `GoogleID`: Unique identifier from Google (used for login)
- `GoogleEmail`: Email from Google account
- `GooglePicture`: Profile picture URL from Google
- `IsGoogleLinked`: Flag to track if account is linked to Google

### Step 2.2: Create Database Migration (10 minutes)

**File:** `backend/internal/database/migrations/005_add_google_oauth.sql`

```sql
-- Add Google OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN google_email VARCHAR(255);
ALTER TABLE users ADD COLUMN google_picture VARCHAR(500);
ALTER TABLE users ADD COLUMN is_google_linked BOOLEAN DEFAULT FALSE;

-- Make password nullable for OAuth-only users
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add index for faster Google ID lookups
CREATE INDEX idx_users_google_id ON users(google_id);
```

### Step 2.3: Add Environment Variables (5 minutes)

**File:** `backend/.env`

```env
# Existing variables...
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url

# NEW: Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

### Step 2.4: Install OAuth Library (5 minutes)

**Command:**
```bash
cd backend
go get golang.org/x/oauth2
go get golang.org/x/oauth2/google
```

### Step 2.5: Create OAuth Config (15 minutes)

**File:** `backend/internal/config/oauth.go` (NEW FILE)

```go
package config

import (
    "os"
    "golang.org/x/oauth2"
    "golang.org/x/oauth2/google"
)

func GetGoogleOAuthConfig() *oauth2.Config {
    return &oauth2.Config{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
        Scopes: []string{
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        },
        Endpoint: google.Endpoint,
    }
}
```

### Step 2.6: Create OAuth Service (30 minutes)

**File:** `backend/internal/services/oauth_service.go` (NEW FILE)

**What it does:**
- Generates OAuth URL for Google login
- Exchanges authorization code for access token
- Fetches user info from Google
- Creates or updates user in database
- Handles account linking

**Key methods:**
```go
type OAuthService struct {
    userRepo repository.UserRepository
    tokenService *TokenService
    config *oauth2.Config
}

// GetGoogleLoginURL - Generate URL to redirect user to Google
func (s *OAuthService) GetGoogleLoginURL(state string) string

// HandleGoogleCallback - Process callback from Google
func (s *OAuthService) HandleGoogleCallback(code string) (*User, string, error)

// LinkGoogleAccount - Link Google to existing account
func (s *OAuthService) LinkGoogleAccount(userID uint, googleID string) error

// UnlinkGoogleAccount - Remove Google link from account
func (s *OAuthService) UnlinkGoogleAccount(userID uint) error
```

### Step 2.7: Create OAuth Handlers (45 minutes)

**File:** `backend/internal/handlers/oauth.go` (NEW FILE)

**Handlers needed:**

1. **GoogleLogin** - Redirect to Google OAuth
   - Generates state token (CSRF protection)
   - Redirects to Google login page
   - Endpoint: `GET /api/auth/google/login`

2. **GoogleCallback** - Handle Google's response
   - Validates state token
   - Exchanges code for token
   - Gets user info from Google
   - Creates/updates user
   - Returns JWT token
   - Endpoint: `GET /api/auth/google/callback`

3. **LinkGoogle** - Link Google to existing account
   - Requires authentication
   - Links Google ID to current user
   - Endpoint: `POST /api/auth/google/link`

4. **UnlinkGoogle** - Unlink Google from account
   - Requires authentication
   - Removes Google ID from user
   - Ensures user has password set
   - Endpoint: `POST /api/auth/google/unlink`

### Step 2.8: Add OAuth Routes (10 minutes)

**File:** `backend/internal/routes/routes.go`

**Add routes:**
```go
// OAuth routes (public)
auth.GET("/google/login", oauthHandler.GoogleLogin)
auth.GET("/google/callback", oauthHandler.GoogleCallback)

// OAuth routes (protected)
authProtected := r.Group("/api/auth")
authProtected.Use(authMiddleware.RequireAuth())
{
    authProtected.POST("/google/link", oauthHandler.LinkGoogle)
    authProtected.POST("/google/unlink", oauthHandler.UnlinkGoogle)
}
```

### Step 2.9: Update User Repository (15 minutes)

**File:** `backend/internal/repository/user_repo.go`

**Add methods:**
```go
// GetByGoogleID - Find user by Google ID
func (r *UserRepository) GetByGoogleID(googleID string) (*models.User, error)

// UpdateGoogleInfo - Update user's Google OAuth info
func (r *UserRepository) UpdateGoogleInfo(userID uint, googleID, email, picture string) error

// RemoveGoogleLink - Remove Google OAuth link
func (r *UserRepository) RemoveGoogleLink(userID uint) error
```

---

## **PHASE 3: Frontend Implementation** (1 day)

### Step 3.1: Add Environment Variables (5 minutes)

**File:** `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Step 3.2: Create OAuth API Service (15 minutes)

**File:** `frontend/src/services/api/oauth.ts` (NEW FILE)

```typescript
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';

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

export const oauthService = {
  // Get Google login URL
  getGoogleLoginURL: (): string => {
    return `${API_ENDPOINTS.AUTH}/google/login`;
  },

  // Link Google account
  linkGoogle: async (code: string): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.AUTH}/google/link`, { code });
  },

  // Unlink Google account
  unlinkGoogle: async (): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.AUTH}/google/unlink`);
  },
};
```

### Step 3.3: Create Google Login Button Component (30 minutes)

**File:** `frontend/src/components/common/GoogleLoginButton.tsx` (NEW FILE)

**Features:**
- Beautiful Google-branded button
- Loading state
- Error handling
- Redirects to Google OAuth
- Dark mode support

**Props:**
```typescript
interface GoogleLoginButtonProps {
  mode: 'login' | 'signup' | 'link';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}
```

### Step 3.4: Update Login Page (20 minutes)

**File:** `frontend/src/features/auth/Login.tsx`

**Changes:**
1. Import GoogleLoginButton
2. Add "OR" divider
3. Add GoogleLoginButton below email/password form
4. Handle OAuth callback

**Layout:**
```
┌─────────────────────────────┐
│  Login to Words of Praise   │
├─────────────────────────────┤
│  Email: [____________]      │
│  Password: [____________]   │
│  [Login Button]             │
│                             │
│  ────────── OR ──────────   │
│                             │
│  [🔵 Continue with Google]  │
│                             │
│  Don't have account? Signup │
└─────────────────────────────┘
```

### Step 3.5: Update Signup Page (20 minutes)

**File:** `frontend/src/features/auth/Signup.tsx`

**Changes:**
1. Import GoogleLoginButton
2. Add "OR" divider
3. Add GoogleLoginButton above email/password form
4. Handle OAuth callback

**Layout:**
```
┌─────────────────────────────┐
│  Create Account             │
├─────────────────────────────┤
│  [🔵 Sign up with Google]   │
│                             │
│  ────────── OR ──────────   │
│                             │
│  Email: [____________]      │
│  Username: [____________]   │
│  Password: [____________]   │
│  [Sign Up Button]           │
│                             │
│  Have account? Login        │
└─────────────────────────────┘
```

### Step 3.6: Create OAuth Callback Handler (30 minutes)

**File:** `frontend/src/features/auth/GoogleCallback.tsx` (NEW FILE)

**What it does:**
1. Extracts code and state from URL params
2. Validates state (CSRF protection)
3. Sends code to backend
4. Receives JWT token
5. Stores token in localStorage
6. Updates auth context
7. Redirects to dashboard/daily verse

**Error handling:**
- Invalid state
- Code exchange failure
- Network errors
- User cancellation

### Step 3.7: Add OAuth Callback Route (5 minutes)

**File:** `frontend/src/App.tsx`

**Add route:**
```typescript
<Route path="/auth/google/callback" element={<GoogleCallback />} />
```

### Step 3.8: Update Account Management (45 minutes)

**File:** `frontend/src/features/profile/AccountManagement.tsx`

**Add new section: "Connected Accounts"**

**Features:**
1. Show if Google is linked
2. Display Google email and profile picture
3. "Link Google Account" button (if not linked)
4. "Unlink Google Account" button (if linked)
5. Warning before unlinking

**Layout:**
```
┌─────────────────────────────────────┐
│  Connected Accounts                 │
├─────────────────────────────────────┤
│  Google Account                     │
│  ┌───────────────────────────────┐ │
│  │ [👤] user@gmail.com           │ │
│  │ Connected on: Jan 1, 2024     │ │
│  │ [Unlink Account]              │ │
│  └───────────────────────────────┘ │
│                                     │
│  OR (if not linked):                │
│  ┌───────────────────────────────┐ │
│  │ Link your Google account for  │ │
│  │ easier sign-in                │ │
│  │ [🔵 Link Google Account]      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Step 3.9: Update Auth Context (15 minutes)

**File:** `frontend/src/contexts/AuthContext.tsx`

**Add:**
- `isGoogleLinked` to user state
- `googlePicture` to user state
- Handle OAuth login flow

---

## **PHASE 4: Testing & Polish** (4-6 hours)

### Test Cases

#### Test 1: New User Sign Up with Google
**Steps:**
1. Go to Signup page
2. Click "Sign up with Google"
3. Select Google account
4. Verify redirected to app
5. Verify user is logged in
6. Verify user data saved

**Expected:**
- ✅ User created with Google ID
- ✅ JWT token generated
- ✅ Redirected to daily verse
- ✅ Profile shows Google email

#### Test 2: Existing User Login with Google
**Steps:**
1. Sign up with Google
2. Logout
3. Go to Login page
4. Click "Continue with Google"
5. Select same Google account

**Expected:**
- ✅ User logged in
- ✅ Same user ID as before
- ✅ JWT token generated

#### Test 3: Link Google to Existing Email Account
**Steps:**
1. Create account with email/password
2. Login
3. Go to Settings → Account Management
4. Click "Link Google Account"
5. Select Google account
6. Verify linked

**Expected:**
- ✅ Google ID added to user
- ✅ `is_google_linked` = true
- ✅ Can now login with Google

#### Test 4: Unlink Google Account
**Steps:**
1. Have account linked to Google
2. Go to Settings → Account Management
3. Click "Unlink Google Account"
4. Confirm action
5. Verify unlinked

**Expected:**
- ✅ Google ID removed
- ✅ `is_google_linked` = false
- ✅ Can still login with email/password

#### Test 5: Error Handling - User Cancels OAuth
**Steps:**
1. Click "Sign up with Google"
2. Cancel on Google consent screen

**Expected:**
- ✅ Redirected back to app
- ✅ Error message shown
- ✅ No user created

#### Test 6: Error Handling - Invalid State Token
**Steps:**
1. Manually craft callback URL with wrong state
2. Try to complete OAuth

**Expected:**
- ✅ Error: "Invalid state token"
- ✅ User not logged in
- ✅ Security maintained

#### Test 7: Duplicate Google Account
**Steps:**
1. Sign up with Google (user@gmail.com)
2. Logout
3. Try to sign up again with same Google account

**Expected:**
- ✅ Logs in existing user
- ✅ Does not create duplicate

#### Test 8: Email Conflict
**Steps:**
1. Sign up with email: user@gmail.com
2. Try to link Google account with same email

**Expected:**
- ✅ Links successfully (same email)
- ✅ OR shows error if different user

---

## 🔒 Security Considerations

### 1. State Token (CSRF Protection)
**What:** Random token generated before OAuth flow  
**Why:** Prevents CSRF attacks  
**How:** Store in session, validate on callback

### 2. Token Validation
**What:** Verify Google's access token  
**Why:** Ensure token is legitimate  
**How:** Use Google's token info endpoint

### 3. Secure Storage
**What:** Never expose Client Secret  
**Why:** Prevents unauthorized access  
**How:** Store in environment variables, never in code

### 4. HTTPS Only (Production)
**What:** Use HTTPS for all OAuth flows  
**Why:** Prevents token interception  
**How:** Configure redirect URLs with https://

### 5. Password Requirement
**What:** Require password before unlinking Google  
**Why:** Prevent account lockout  
**How:** Check if user has password set

---

## 📁 Files to Create/Modify

### Backend Files to CREATE:
1. `backend/internal/config/oauth.go` - OAuth configuration
2. `backend/internal/services/oauth_service.go` - OAuth business logic
3. `backend/internal/handlers/oauth.go` - OAuth HTTP handlers
4. `backend/internal/database/migrations/005_add_google_oauth.sql` - Database migration

### Backend Files to MODIFY:
1. `backend/internal/models/user.go` - Add Google OAuth fields
2. `backend/internal/repository/user_repo.go` - Add Google-related methods
3. `backend/internal/routes/routes.go` - Add OAuth routes
4. `backend/.env` - Add Google credentials

### Frontend Files to CREATE:
1. `frontend/src/services/api/oauth.ts` - OAuth API calls
2. `frontend/src/components/common/GoogleLoginButton.tsx` - Google button component
3. `frontend/src/features/auth/GoogleCallback.tsx` - OAuth callback handler

### Frontend Files to MODIFY:
1. `frontend/src/features/auth/Login.tsx` - Add Google login option
2. `frontend/src/features/auth/Signup.tsx` - Add Google signup option
3. `frontend/src/features/profile/AccountManagement.tsx` - Add account linking
4. `frontend/src/contexts/AuthContext.tsx` - Handle OAuth state
5. `frontend/src/App.tsx` - Add callback route
6. `frontend/.env` - Add Google Client ID

**Total Files:**
- Create: 7 new files
- Modify: 10 existing files

---

## ⏱️ Time Breakdown

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Google OAuth Setup | 30 min |
| **Phase 2** | Backend Implementation | 6-8 hours |
| | - Update User model | 15 min |
| | - Database migration | 10 min |
| | - Environment setup | 5 min |
| | - Install libraries | 5 min |
| | - OAuth config | 15 min |
| | - OAuth service | 30 min |
| | - OAuth handlers | 45 min |
| | - Routes | 10 min |
| | - Repository methods | 15 min |
| | - Testing backend | 1 hour |
| **Phase 3** | Frontend Implementation | 6-8 hours |
| | - Environment setup | 5 min |
| | - OAuth API service | 15 min |
| | - Google button component | 30 min |
| | - Update Login page | 20 min |
| | - Update Signup page | 20 min |
| | - Callback handler | 30 min |
| | - Add route | 5 min |
| | - Update Account Management | 45 min |
| | - Update Auth context | 15 min |
| | - Testing frontend | 1 hour |
| **Phase 4** | Testing & Polish | 4-6 hours |
| | - End-to-end testing | 2 hours |
| | - Error handling | 1 hour |
| | - UI polish | 1 hour |
| | - Documentation | 30 min |
| **Total** | | **18-24 hours (2-3 days)** |

---

## 🎨 UI/UX Design

### Google Login Button Design

**Colors:**
- Background: White (#FFFFFF)
- Border: Light gray (#E0E0E0)
- Text: Dark gray (#3C4043)
- Google logo: Official colors

**Dark Mode:**
- Background: Dark gray (#2D2D2D)
- Border: Medium gray (#5F6368)
- Text: Light gray (#E8EAED)

**States:**
- Default: White background
- Hover: Light gray background (#F8F9FA)
- Active: Slightly darker gray
- Loading: Spinner + disabled state
- Error: Red border

**Size:**
- Height: 44px (touch-friendly)
- Width: 100% (full width)
- Border radius: 8px
- Font size: 16px

---

## 🚨 Potential Issues & Solutions

### Issue 1: Email Already Exists
**Problem:** User tries to sign up with Google, but email already exists  
**Solution:** 
- Check if email exists
- If yes, link Google to existing account (with confirmation)
- If no, create new account

### Issue 2: User Has No Password
**Problem:** User signed up with Google, tries to unlink  
**Solution:**
- Require user to set password before unlinking
- Show warning: "Set a password first to unlink Google"

### Issue 3: OAuth Callback Fails
**Problem:** Network error during token exchange  
**Solution:**
- Show clear error message
- Provide "Try Again" button
- Log error for debugging

### Issue 4: State Token Mismatch
**Problem:** CSRF attack or session expired  
**Solution:**
- Reject request
- Show security error
- Redirect to login

### Issue 5: Google Account Already Linked
**Problem:** User tries to link Google account that's already linked to another user  
**Solution:**
- Show error: "This Google account is already linked to another user"
- Suggest logging in with Google instead

---

## ✅ Definition of Done

This feature is complete when:

1. ✅ Users can sign up with Google
2. ✅ Users can log in with Google
3. ✅ Users can link Google to existing account
4. ✅ Users can unlink Google from account
5. ✅ Google profile picture displays in UI
6. ✅ All security measures implemented (state token, token validation)
7. ✅ Error handling works for all scenarios
8. ✅ UI is polished and matches design
9. ✅ Dark mode support
10. ✅ All test cases pass
11. ✅ Documentation updated
12. ✅ No console errors or warnings

---

## 📚 Resources

### Documentation:
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [golang.org/x/oauth2 Package](https://pkg.go.dev/golang.org/x/oauth2)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

### Libraries:
- Backend: `golang.org/x/oauth2`
- Frontend: Native fetch API (no library needed)

### Design:
- [Google Sign-In Button](https://developers.google.com/identity/branding-guidelines#sign-in-button)
- [Material Design Icons](https://fonts.google.com/icons)

---

## 🎯 Success Metrics

After implementation, track:
- **Conversion Rate:** % of users who sign up with Google vs email
- **Login Speed:** Time to complete OAuth flow
- **Error Rate:** % of failed OAuth attempts
- **Adoption:** % of existing users who link Google

**Expected Results:**
- 40-60% of new users will use Google sign-up
- 30-50% faster registration process
- Higher user retention (easier login)

---

## 💡 Future Enhancements

After basic OAuth is working, consider:

1. **Multiple OAuth Providers**
   - Facebook Login
   - Apple Sign In
   - GitHub (for developers)

2. **Profile Picture Sync**
   - Use Google profile picture as avatar
   - Auto-update when changed

3. **Google Calendar Integration**
   - Add daily verse reminders to calendar
   - Schedule Bible reading time

4. **Google Drive Backup**
   - Backup favorites/notes to Drive
   - Sync across devices

---

**Status:** ✅ READY TO IMPLEMENT  
**Complexity:** MEDIUM-HIGH  
**Risk:** MEDIUM (OAuth can be tricky)  
**Impact:** HIGH (Better UX, higher conversion)  
**Estimated Time:** 2-3 days  
**Dependencies:** Google Cloud account, OAuth credentials

---

**Next Action:** Get user approval to proceed with implementation
