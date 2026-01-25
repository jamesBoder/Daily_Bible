# Google OAuth Implementation - Detailed Step-by-Step Guide

**Current Status:** Partial implementation complete  
**What's Done:** Basic structure, models, migration, config  
**What's Needed:** Fix critical issues and complete implementation

---

## 📋 Overview of Current State

### ✅ What You've Already Done:
1. Created `oauth.go` handler with basic structure
2. Created `oauth_service.go` with OAuth logic
3. Created `oauth.go` config file
4. Added Google OAuth fields to User model
5. Created database migration (005_add_google_oauth.sql)
6. Made password nullable in database

### ⚠️ What Needs to Be Fixed/Completed:
1. Security issues (state token, validation)
2. Missing functionality (JWT token, username generation)
3. Repository methods for Google OAuth
4. User model hooks for OAuth users
5. Complete handler implementations
6. Service constructor and improvements

---

## 🎯 Implementation Order (Follow This Sequence)

---

## **STEP 1: Fix Config File** (5 minutes)

### File: `backend/internal/config/oauth.go`

### Issue:
```go
var GoogleOAuthConfig () *oauth2.Config {  // Wrong syntax!
```

### What to Fix:
Change `var` to `func` - it should be a function, not a variable

### Correct Structure:
```go
func GoogleOAuthConfig() *oauth2.Config {
    return &oauth2.Config{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),      // Fix env var name
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),  // Fix env var name
        RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
        Scopes: []string{
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
        },
        Endpoint: google.Endpoint,
    }
}
```

### Changes Needed:
1. Change `var` to `func`
2. Fix environment variable names to match plan:
   - `CLIENT_ID` → `GOOGLE_CLIENT_ID`
   - `CLIENT_SECRET` → `GOOGLE_CLIENT_SECRET`

---

## **STEP 2: Add Repository Methods** (15 minutes)

### File: `backend/internal/repository/user_repo.go`

### What to Add:

#### 2.1: Update Interface
Add these methods to `UserRepository` interface:
```go
type UserRepository interface {
    // Existing methods...
    Create(user *models.User) error
    GetByID(id uint) (*models.User, error)
    GetByEmail(email string) (*models.User, error)
    GetByUsername(username string) (*models.User, error)
    Update(user *models.User) error
    Delete(id uint) error
    List(limit, offset int) ([]models.User, error)
    
    // NEW: Add these three methods
    GetByGoogleID(googleID string) (*models.User, error)
    UpdateGoogleInfo(userID uint, googleID, email, picture string) error
    RemoveGoogleLink(userID uint) error
}
```

#### 2.2: Implement GetByGoogleID
Add this method to `userRepository` struct:
```go
func (r *userRepository) GetByGoogleID(googleID string) (*models.User, error) {
    var user models.User
    err := r.db.Where("google_id = ?", googleID).First(&user).Error
    if err == gorm.ErrRecordNotFound {
        return nil, nil  // Return nil, nil (not an error, just not found)
    }
    if err != nil {
        return nil, err
    }
    return &user, nil
}
```

#### 2.3: Implement UpdateGoogleInfo
```go
func (r *userRepository) UpdateGoogleInfo(userID uint, googleID, email, picture string) error {
    return r.db.Model(&models.User{}).
        Where("id = ?", userID).
        Updates(map[string]interface{}{
            "google_id":       googleID,
            "google_email":    email,
            "google_picture":  picture,
            "is_google_linked": true,
        }).Error
}
```

#### 2.4: Implement RemoveGoogleLink
```go
func (r *userRepository) RemoveGoogleLink(userID uint) error {
    return r.db.Model(&models.User{}).
        Where("id = ?", userID).
        Updates(map[string]interface{}{
            "google_id":       "",
            "google_email":    "",
            "google_picture":  "",
            "is_google_linked": false,
        }).Error
}
```

---

## **STEP 3: Fix User Model Hooks** (10 minutes)

### File: `backend/internal/models/user.go`

### Issue:
BeforeCreate and BeforeUpdate hooks will fail for OAuth users who have no password.

### What to Fix:

#### 3.1: Update BeforeCreate Hook
Change from:
```go
func (u *User) BeforeCreate(tx *gorm.DB) error {
    return u.SetPassword(u.Password)  // Fails if Password is empty!
}
```

To:
```go
func (u *User) BeforeCreate(tx *gorm.DB) error {
    // Only hash password if it's provided (not empty)
    if u.Password != "" {
        return u.SetPassword(u.Password)
    }
    return nil  // Skip hashing for OAuth-only users
}
```

#### 3.2: Update BeforeUpdate Hook
Change from:
```go
func (u *User) BeforeUpdate(tx *gorm.DB) error {
    if tx.Statement.Changed("Password") {
        if len(u.Password) > 0 && (u.Password[:4] == "$2a$" || u.Password[:4] == "$2b$") {
            return nil
        }
        return u.SetPassword(u.Password)
    }
    return nil
}
```

To:
```go
func (u *User) BeforeUpdate(tx *gorm.DB) error {
    if tx.Statement.Changed("Password") {
        // Skip if password is empty (OAuth users)
        if u.Password == "" {
            return nil
        }
        // Check if already hashed
        if len(u.Password) > 4 && (u.Password[:4] == "$2a$" || u.Password[:4] == "$2b$") {
            return nil
        }
        return u.SetPassword(u.Password)
    }
    return nil
}
```

#### 3.3: Update Password Field Tag
Change from:
```go
Password string `gorm:"not null" json:"-"`
```

To:
```go
Password string `json:"-"`  // Remove "not null" constraint
```

---

## **STEP 4: Create State Management Utility** (20 minutes)

### File: `backend/internal/utils/state.go` (NEW FILE)

### Purpose:
Generate and validate CSRF state tokens for OAuth

### What to Create:

#### 4.1: Create the File
Create new file: `backend/internal/utils/state.go`

#### 4.2: Add Package and Imports
```go
package utils

import (
    "crypto/rand"
    "encoding/base64"
    "errors"
    "time"
)
```

#### 4.3: Add State Token Structure
```go
// StateToken represents an OAuth state token with expiration
type StateToken struct {
    Token     string
    ExpiresAt time.Time
}
```

#### 4.4: Add GenerateStateToken Function
```go
// GenerateStateToken creates a cryptographically secure random state token
func GenerateStateToken() (string, error) {
    b := make([]byte, 32)  // 32 bytes = 256 bits
    _, err := rand.Read(b)
    if err != nil {
        return "", err
    }
    return base64.URLEncoding.EncodeToString(b), nil
}
```

#### 4.5: Add State Storage (Simple In-Memory)
```go
// Simple in-memory state storage (for production, use Redis or database)
var stateStore = make(map[string]time.Time)

// StoreState saves a state token with 10-minute expiration
func StoreState(state string) {
    stateStore[state] = time.Now().Add(10 * time.Minute)
}

// ValidateState checks if state token is valid and not expired
func ValidateState(state string) error {
    expiresAt, exists := stateStore[state]
    if !exists {
        return errors.New("invalid state token")
    }
    
    if time.Now().After(expiresAt) {
        delete(stateStore, state)  // Clean up expired token
        return errors.New("state token expired")
    }
    
    delete(stateStore, state)  // Use once and delete
    return nil
}
```

**Note:** This is a simple in-memory implementation. For production with multiple servers, use Redis or database.

---

## **STEP 5: Add Service Constructor** (10 minutes)

### File: `backend/internal/services/oauth_service.go`

### What to Add:

#### 5.1: Add Constructor Function
Add this at the top of the file (after the struct definition):

```go
// NewOAuthService creates a new instance of OAuthService
func NewOAuthService(userRepo repository.UserRepository, tokenService *TokenService, config *oauth2.Config) *OAuthService {
    return &OAuthService{
        userRepo:     userRepo,
        tokenService: tokenService,
        oauthConfig:  config,
    }
}
```

#### 5.2: Update Import
Change:
```go
import "io/ioutil"
```

To:
```go
import "io"
```

#### 5.3: Update ReadAll Call
Change:
```go
body, err := ioutil.ReadAll(resp.Body)
```

To:
```go
body, err := io.ReadAll(resp.Body)
```

---

## **STEP 6: Fix OAuth Service Logic** (30 minutes)

### File: `backend/internal/services/oauth_service.go`

### What to Fix:

#### 6.1: Add Username Generation Helper
Add this helper function at the bottom of the file:

```go
// generateUsername creates a unique username from email
func (s *OAuthService) generateUsername(email string) (string, error) {
    // Extract username from email (before @)
    parts := strings.Split(email, "@")
    if len(parts) == 0 {
        return "", errors.New("invalid email format")
    }
    
    baseUsername := parts[0]
    username := baseUsername
    
    // Check if username exists, if so, add number suffix
    counter := 1
    for {
        existingUser, _ := s.userRepo.GetByUsername(username)
        if existingUser == nil {
            break  // Username is available
        }
        username = fmt.Sprintf("%s%d", baseUsername, counter)
        counter++
    }
    
    return username, nil
}
```

#### 6.2: Add Import for strings
Add to imports:
```go
import (
    "strings"
    "fmt"
    // ... other imports
)
```

#### 6.3: Update HandleGoogleCallback
Replace the entire `HandleGoogleCallback` function with this improved version:

```go
func (s *OAuthService) HandleGoogleCallback(code string) (*models.User, string, error) {
    // Exchange code for token
    token, err := s.oauthConfig.Exchange(context.Background(), code)
    if err != nil {
        return nil, "", fmt.Errorf("failed to exchange token: %w", err)
    }

    // Fetch user info from Google
    client := s.oauthConfig.Client(context.Background(), token)
    resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
    if err != nil {
        return nil, "", fmt.Errorf("failed to get user info: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return nil, "", fmt.Errorf("failed to read user info response: %w", err)
    }

    var googleUser struct {
        ID      string `json:"id"`
        Email   string `json:"email"`
        Picture string `json:"picture"`
        Name    string `json:"name"`
    }
    if err := json.Unmarshal(body, &googleUser); err != nil {
        return nil, "", fmt.Errorf("failed to unmarshal user info: %w", err)
    }

    // Check if user exists by Google ID
    user, err := s.userRepo.GetByGoogleID(googleUser.ID)
    if err != nil {
        return nil, "", fmt.Errorf("failed to get user by Google ID: %w", err)
    }

    if user != nil {
        // User exists, update their info
        user.GoogleEmail = googleUser.Email
        user.GooglePicture = googleUser.Picture
        user.IsGoogleLinked = true
        if err := s.userRepo.Update(user); err != nil {
            return nil, "", fmt.Errorf("failed to update user: %w", err)
        }
    } else {
        // Check if email already exists (user signed up with email/password)
        existingUser, _ := s.userRepo.GetByEmail(googleUser.Email)
        if existingUser != nil {
            // Email exists - link Google to existing account
            existingUser.GoogleID = googleUser.ID
            existingUser.GoogleEmail = googleUser.Email
            existingUser.GooglePicture = googleUser.Picture
            existingUser.IsGoogleLinked = true
            if err := s.userRepo.Update(existingUser); err != nil {
                return nil, "", fmt.Errorf("failed to link Google account: %w", err)
            }
            user = existingUser
        } else {
            // Create new user
            username, err := s.generateUsername(googleUser.Email)
            if err != nil {
                return nil, "", fmt.Errorf("failed to generate username: %w", err)
            }

            user = &models.User{
                Email:          googleUser.Email,
                Username:       username,
                Password:       "",  // No password for OAuth-only users
                GoogleID:       googleUser.ID,
                GoogleEmail:    googleUser.Email,
                GooglePicture:  googleUser.Picture,
                IsGoogleLinked: true,
            }
            if err := s.userRepo.Create(user); err != nil {
                return nil, "", fmt.Errorf("failed to create user: %w", err)
            }
        }
    }

    // Generate JWT token
    jwtToken, err := s.tokenService.GenerateToken(user.ID, user.Email)
    if err != nil {
        return nil, "", fmt.Errorf("failed to generate JWT token: %w", err)
    }

    return user, jwtToken, nil
}
```

**Key Changes:**
- Returns JWT token as second parameter
- Generates username for new users
- Handles duplicate email scenario (links to existing account)
- Uses `io.ReadAll` instead of `ioutil.ReadAll`
- Better error messages

#### 6.4: Update UnlinkGoogleAccount
Replace with this safer version:

```go
func (s *OAuthService) UnlinkGoogleAccount(userID uint) error {
    user, err := s.userRepo.GetByID(userID)
    if err != nil {
        return fmt.Errorf("failed to get user: %w", err)
    }
    if user == nil {
        return fmt.Errorf("user not found")
    }

    // Safety check: ensure user has a password before unlinking
    if user.Password == "" {
        return errors.New("cannot unlink Google account: please set a password first")
    }

    // Remove Google link
    if err := s.userRepo.RemoveGoogleLink(userID); err != nil {
        return fmt.Errorf("failed to unlink Google account: %w", err)
    }

    return nil
}
```

**Key Change:** Checks if user has password before allowing unlink

---

## **STEP 7: Fix OAuth Handlers** (30 minutes)

### File: `backend/internal/handlers/oauth.go`

### What to Fix:

#### 7.1: Add Imports
Add these imports at the top:
```go
import (
    "net/http"
    "os"
    "dailybible/internal/services"
    "dailybible/internal/utils"  // NEW: For state token
    "github.com/gin-gonic/gin"
)
```

#### 7.2: Fix GoogleLogin Handler
Replace the entire function:

```go
func (h *OAuthHandler) GoogleLogin(c *gin.Context) {
    // Generate secure random state token
    state, err := utils.GenerateStateToken()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate state token"})
        return
    }

    // Store state token for validation
    utils.StoreState(state)

    // Get Google OAuth URL
    url := h.oauthService.GetGoogleLoginURL(state)

    // Redirect to Google OAuth consent page
    c.Redirect(http.StatusTemporaryRedirect, url)
}
```

**Key Changes:**
- Generates cryptographically secure state token
- Stores state for later validation
- Proper error handling

#### 7.3: Fix GoogleCallback Handler
Replace the entire function:

```go
func (h *OAuthHandler) GoogleCallback(c *gin.Context) {
    // Get state and code from query params
    state := c.Query("state")
    code := c.Query("code")

    // Validate state token (CSRF protection)
    if err := utils.ValidateState(state); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired state token"})
        return
    }

    // Check if code exists
    if code == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not found"})
        return
    }

    // Handle Google OAuth callback
    user, token, err := h.oauthService.HandleGoogleCallback(code)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate with Google: " + err.Error()})
        return
    }

    // Get frontend URL from environment
    frontendURL := os.Getenv("FRONTEND_URL")
    if frontendURL == "" {
        frontendURL = "http://localhost:3000"  // Default for development
    }

    // Redirect to frontend with token
    redirectURL := fmt.Sprintf("%s/auth/google/callback?token=%s", frontendURL, token)
    c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}
```

**Key Changes:**
- Validates state token (CSRF protection)
- Gets JWT token from service
- Redirects to frontend with token
- Proper error handling

#### 7.4: Implement LinkGoogle Handler
Replace the stub with full implementation:

```go
func (h *OAuthHandler) LinkGoogle(c *gin.Context) {
    // Get authenticated user ID from context
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // Get Google authorization code from request
    var req struct {
        Code string `json:"code" binding:"required"`
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code is required"})
        return
    }

    // Exchange code for Google user info
    user, _, err := h.oauthService.HandleGoogleCallback(req.Code)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to link Google account: " + err.Error()})
        return
    }

    // Verify the Google account isn't already linked to another user
    if user.ID != userID.(uint) {
        c.JSON(http.StatusConflict, gin.H{"error": "This Google account is already linked to another user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Google account linked successfully",
        "user":    user,
    })
}
```

**Key Changes:**
- Gets authenticated user from context
- Validates authorization code
- Prevents linking Google account to multiple users
- Returns success message

#### 7.5: Implement UnlinkGoogle Handler
Replace the stub with full implementation:

```go
func (h *OAuthHandler) UnlinkGoogle(c *gin.Context) {
    // Get authenticated user ID from context
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // Unlink Google account
    if err := h.oauthService.UnlinkGoogleAccount(userID.(uint)); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Google account unlinked successfully",
    })
}
```

**Key Changes:**
- Gets authenticated user from context
- Calls service to unlink
- Returns appropriate error if user has no password

---

## **STEP 8: Wire Up Dependencies** (15 minutes)

### File: `backend/cmd/api/main.go`

### What to Add:

#### 8.1: Import OAuth Config
Add to imports:
```go
import (
    // ... existing imports
    "dailybible/internal/config"
)
```

#### 8.2: Initialize OAuth Config
After initializing other services, add:

```go
// Initialize OAuth config
googleOAuthConfig := config.GoogleOAuthConfig()
```

#### 8.3: Initialize OAuth Service
After creating token service, add:

```go
// Initialize OAuth service
oauthService := services.NewOAuthService(userRepo, tokenService, googleOAuthConfig)
```

#### 8.4: Initialize OAuth Handler
After creating other handlers, add:

```go
// Initialize OAuth handler
oauthHandler := handlers.NewOAuthHandler(oauthService)
```

#### 8.5: Pass to Routes
Update routes initialization to include OAuth handler:

```go
routes.SetupRoutes(router, authHandler, verseHandler, favoriteHandler, historyHandler, commentHandler, profileHandler, oauthHandler, authMiddleware)
```

---

## **STEP 9: Add OAuth Routes** (10 minutes)

### File: `backend/internal/routes/routes.go`

### What to Add:

#### 9.1: Update Function Signature
Change from:
```go
func SetupRoutes(r *gin.Engine, authHandler, verseHandler, favoriteHandler, historyHandler, commentHandler, profileHandler *handlers.XxxHandler, authMiddleware *middleware.AuthMiddleware)
```

To:
```go
func SetupRoutes(r *gin.Engine, authHandler, verseHandler, favoriteHandler, historyHandler, commentHandler, profileHandler, oauthHandler *handlers.XxxHandler, authMiddleware *middleware.AuthMiddleware)
```

#### 9.2: Add OAuth Routes
Add these routes in the auth section:

```go
// OAuth routes (public)
auth.GET("/google/login", oauthHandler.GoogleLogin)
auth.GET("/google/callback", oauthHandler.GoogleCallback)

// OAuth routes (protected) - add after other protected routes
authProtected := r.Group("/api/auth")
authProtected.Use(authMiddleware.RequireAuth())
{
    authProtected.POST("/google/link", oauthHandler.LinkGoogle)
    authProtected.POST("/google/unlink", oauthHandler.UnlinkGoogle)
}
```

---

## **STEP 10: Update Environment Variables** (5 minutes)

### File: `backend/.env`

### What to Add:

```env
# Existing variables...
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url

# Google OAuth (ADD THESE)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

**Note:** You'll get the actual Client ID and Secret from Google Cloud Console

---

## **STEP 11: Run Database Migration** (2 minutes)

### Command:
```bash
cd backend
go run cmd/api/main.go
```

The migration should run automatically and add the Google OAuth columns to the users table.

### Verify Migration:
Check your database to ensure these columns exist in `users` table:
- `google_id` (VARCHAR, UNIQUE)
- `google_email` (VARCHAR)
- `google_picture` (VARCHAR)
- `is_google_linked` (BOOLEAN)
- `password` (should now be nullable)

---

## **STEP 12: Test the Implementation** (30 minutes)

### 12.1: Test OAuth Login Flow

#### Start Backend:
```bash
cd backend
go run cmd/api/main.go
```

#### Test Endpoints:

**1. Test Google Login Redirect:**
```bash
curl -v http://localhost:8080/api/auth/google/login
```

Expected: Should redirect to Google OAuth consent page

**2. Test Callback (after Google auth):**
- Go to the Google login URL in browser
- Complete OAuth flow
- Should redirect back to frontend with token

### 12.2: Test with Postman/Thunder Client

**1. Test Link Google (Protected):**
```bash
POST http://localhost:8080/api/auth/google/link
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
Body:
{
  "code": "google_authorization_code"
}
```

**2. Test Unlink Google (Protected):**
```bash
POST http://localhost:8080/api/auth/google/unlink
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 12.3: Test Error Scenarios

**1. Invalid State Token:**
- Manually craft callback URL with wrong state
- Should return 400 error

**2. Expired State Token:**
- Wait 11 minutes after login redirect
- Try to complete callback
- Should return "state token expired"

**3. Unlink Without Password:**
- Create OAuth-only user
- Try to unlink
- Should return "set password first" error

---

## 📋 **CHECKLIST - Complete These in Order**

### Phase 1: Foundation (30 minutes)
- [ ] Step 1: Fix config file syntax
- [ ] Step 2: Add repository methods (3 methods)
- [ ] Step 3: Fix user model hooks (2 hooks + field tag)
- [ ] Step 4: Create state management utility (new file)

### Phase 2: Service Layer (40 minutes)
- [ ] Step 5: Add service constructor
- [ ] Step 6: Fix OAuth service logic (4 changes)

### Phase 3: Handler Layer (40 minutes)
- [ ] Step 7: Fix OAuth handlers (5 functions)

### Phase 4: Integration (30 minutes)
- [ ] Step 8: Wire up dependencies in main.go
- [ ] Step 9: Add OAuth routes
- [ ] Step 10: Update environment variables
- [ ] Step 11: Run database migration

### Phase 5: Testing (30 minutes)
- [ ] Step 12: Test OAuth flow end-to-end

**Total Time: ~3 hours**

---

## 🚨 **CRITICAL REMINDERS**

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use HTTPS in production** - HTTP is only for development
3. **State tokens are single-use** - They're deleted after validation
4. **Password is optional** - OAuth users don't need passwords
5. **Email uniqueness** - Handled by linking to existing accounts

---

## 🎯 **AFTER COMPLETION**

Once all steps are done:
1. Test OAuth flow thoroughly
2. Test error scenarios
3. Move to frontend implementation
4. Deploy to production with HTTPS
5. Update redirect URLs in Google Console

---

## 💡 **TIPS**

- **Work in order** - Don't skip steps
- **Test after each phase** - Catch errors early
- **Read error messages** - They tell you what's wrong
- **Use logging** - Add `fmt.Println()` for debugging
- **Check environment variables** - Common source of errors

---

**Status:** Ready to implement  
**Next Action:** Start with Step 1 and work through sequentially
