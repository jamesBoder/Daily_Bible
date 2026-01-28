# Google OAuth Testing Plan

**App Name:** Words of Praise (Daily Bible)  
**Feature:** Google OAuth Authentication  
**Status:** Ready for Testing  
**Last Updated:** December 2024

---

## 📋 Overview

This document provides a comprehensive testing plan for the Google OAuth implementation. The goal is to verify that all core OAuth features work correctly before moving to additional features.

---

## ✅ What Has Been Implemented

### Backend (Go):
- ✅ User model with Google OAuth fields (`google_id`, `google_email`, `google_picture`, `is_google_linked`)
- ✅ OAuth configuration (`backend/internal/config/oauth.go`)
- ✅ OAuth service (`backend/internal/services/oauth_service.go`)
- ✅ OAuth handlers (`backend/internal/handlers/oauth.go`)
- ✅ OAuth routes:
  - `GET /api/auth/google/login` - Redirect to Google
  - `GET /api/auth/google/callback` - Handle Google callback
  - `POST /api/auth/google/link` - Link Google to existing account
  - `POST /api/auth/google/unlink` - Unlink Google from account
- ✅ State token generation and validation (CSRF protection)
- ✅ Database migration for Google OAuth fields

### Frontend (React):
- ✅ OAuth API service (`frontend/src/services/api/oauth.ts`)
- ✅ Google Login Button component (`frontend/src/components/common/GoogleLoginButton.tsx`)
- ✅ Google Callback handler (`frontend/src/features/auth/GoogleCallback.tsx`)
- ✅ Updated Login page with Google OAuth option
- ✅ Updated Signup page with Google OAuth option
- ✅ Account Management page with Connected Accounts section
- ✅ Auth context updated to handle OAuth state

---

## 🎯 Core Features to Test

### 1. **New User Sign Up with Google**
### 2. **Existing User Login with Google**
### 3. **Link Google to Existing Email/Password Account**
### 4. **Unlink Google from Account**
### 5. **Error Handling & Edge Cases**

---

## 🧪 Detailed Test Cases

---

## **TEST 1: New User Sign Up with Google**

### Objective:
Verify that a new user can create an account using Google OAuth.

### Prerequisites:
- Backend server running on `http://localhost:8080`
- Frontend server running on `http://localhost:3000`
- Google OAuth credentials configured in `.env`
- Database is accessible

### Steps:

1. **Navigate to Signup Page**
   - Open browser: `http://localhost:3000/signup`
   - Verify page loads correctly
   - Verify "Sign up with Google" button is visible

2. **Click Google Sign Up Button**
   - Click the "Continue with Google" button
   - Verify redirected to Google login page
   - URL should contain `accounts.google.com`

3. **Select Google Account**
   - Choose a Google account (use a test account)
   - Grant permissions if prompted
   - Verify redirected back to app

4. **Verify Successful Signup**
   - Check URL: Should be `/` or `/daily` (daily verse page)
   - Check header: Should show username/email
   - Check if logged in: Profile icon should be visible
   - No error messages should appear

5. **Verify User Data in Profile**
   - Navigate to Profile → Settings → Account Management
   - Verify "Connected Accounts" section shows:
     - ✅ "Google Account" with your email
     - ✅ Google profile picture (if available)
     - ✅ "Connected on" date
     - ✅ "Unlink Google Account" button visible

6. **Verify Database Entry**
   ```bash
   # If using SQLite
   sqlite3 backend/daily_bible.db
   SELECT id, email, username, google_id, google_email, is_google_linked FROM users ORDER BY id DESC LIMIT 1;
   ```
   
   Expected output:
   - `google_id`: Should have a value (Google's user ID)
   - `google_email`: Should match your Google email
   - `is_google_linked`: Should be `1` (true)
   - `email`: Should match Google email
   - `username`: Should be auto-generated from email

### Expected Results:
- ✅ User created successfully
- ✅ JWT token generated and stored in localStorage
- ✅ Redirected to daily verse page
- ✅ User is logged in
- ✅ Google account shows as linked in Account Management
- ✅ Database has correct Google OAuth data

### Pass Criteria:
- [ ] Successfully redirected to Google
- [ ] Successfully redirected back to app
- [ ] User is logged in
- [ ] Google email shows in Account Management
- [ ] No console errors
- [ ] Database entry is correct

---

## **TEST 2: Existing User Login with Google**

### Objective:
Verify that a user who signed up with Google can log in again using Google.

### Prerequisites:
- User already signed up with Google (from Test 1)
- User is currently logged out

### Steps:

1. **Logout**
   - If logged in, click logout
   - Verify redirected to login page

2. **Navigate to Login Page**
   - Go to `http://localhost:3000/login`
   - Verify "Continue with Google" button is visible

3. **Click Google Login Button**
   - Click "Continue with Google"
   - Verify redirected to Google
   - URL should contain `accounts.google.com`

4. **Select Same Google Account**
   - Choose the same Google account used in Test 1
   - May not need to grant permissions again (already authorized)

5. **Verify Successful Login**
   - Check URL: Should be `/` or `/daily`
   - Check header: Should show same username as before
   - Verify logged in state

6. **Verify User Data Unchanged**
   - Navigate to Profile → Account Management
   - Verify Google account still linked
   - Verify same email and profile picture

7. **Verify Database Entry**
   ```bash
   sqlite3 backend/daily_bible.db
   SELECT id, email, google_id, is_google_linked FROM users WHERE google_id IS NOT NULL;
   ```
   
   Expected:
   - Same user ID as Test 1
   - Same Google ID
   - `is_google_linked` still `1`

### Expected Results:
- ✅ User logged in successfully
- ✅ Same user account as before (not a new user)
- ✅ JWT token generated
- ✅ Redirected to daily verse
- ✅ No duplicate users created

### Pass Criteria:
- [ ] Successfully logged in with Google
- [ ] Same user ID as signup
- [ ] No new user created
- [ ] Google account still linked
- [ ] No console errors

---

## **TEST 3: Link Google to Existing Email/Password Account**

### Objective:
Verify that a user who signed up with email/password can link their Google account.

### Prerequisites:
- Create a new user with email/password (not Google)
- User is logged in

### Steps:

1. **Create Email/Password Account**
   - Go to `http://localhost:3000/signup`
   - Fill in email, username, password
   - Click "Sign Up"
   - Verify account created and logged in

2. **Navigate to Account Management**
   - Go to Profile → Settings → Account Management
   - Scroll to "Connected Accounts" section
   - Verify shows "No Google Account Connected"
   - Verify "Link Google Account" button is visible

3. **Click Link Google Account**
   - Click the "Link Google Account" button
   - Verify redirected to Google OAuth
   - URL should contain `accounts.google.com`

4. **Authorize Google Account**
   - Select a Google account
   - Grant permissions
   - Verify redirected back to app

5. **Verify Google Account Linked**
   - Should be on Account Management page
   - Verify "Connected Accounts" section now shows:
     - ✅ "Google Account" with email
     - ✅ Google profile picture
     - ✅ "Unlink Google Account" button
   - Verify success message (if implemented)

6. **Test Login with Google**
   - Logout
   - Go to Login page
   - Click "Continue with Google"
   - Select the linked Google account
   - Verify logs into the SAME account (not a new one)

7. **Verify Database Entry**
   ```bash
   sqlite3 backend/daily_bible.db
   SELECT id, email, google_id, google_email, is_google_linked FROM users WHERE email = 'your_test_email@example.com';
   ```
   
   Expected:
   - `google_id`: Should now have a value
   - `google_email`: Should match Google account
   - `is_google_linked`: Should be `1`
   - Same user ID as before linking

### Expected Results:
- ✅ Google account linked successfully
- ✅ Can now login with either email/password OR Google
- ✅ Same user account (not duplicated)
- ✅ Database updated correctly

### Pass Criteria:
- [ ] Successfully linked Google account
- [ ] Google info shows in Account Management
- [ ] Can login with Google
- [ ] Can still login with email/password
- [ ] No duplicate users created
- [ ] No console errors

---

## **TEST 4: Unlink Google from Account**

### Objective:
Verify that a user can unlink their Google account.

### Prerequisites:
- User has Google account linked (from Test 3)
- User has a password set (important!)

### Steps:

1. **Navigate to Account Management**
   - Login if needed
   - Go to Profile → Settings → Account Management
   - Verify Google account is linked

2. **Click Unlink Google Account**
   - Click "Unlink Google Account" button
   - Verify confirmation dialog appears
   - Dialog should warn about needing email/password

3. **Confirm Unlink**
   - Click "Yes, Unlink" button
   - Verify loading state shows
   - Wait for completion

4. **Verify Google Account Unlinked**
   - Verify "Connected Accounts" section now shows:
     - ✅ "No Google Account Connected"
     - ✅ "Link Google Account" button visible
   - Verify success message (if implemented)

5. **Test Login with Email/Password**
   - Logout
   - Go to Login page
   - Login with email and password
   - Verify successful login

6. **Test Login with Google (Should Fail or Create New Link)**
   - Logout
   - Try to login with Google
   - Should either:
     - Create a new link (if same email)
     - OR show error (if different email)

7. **Verify Database Entry**
   ```bash
   sqlite3 backend/daily_bible.db
   SELECT id, email, google_id, google_email, is_google_linked FROM users WHERE email = 'your_test_email@example.com';
   ```
   
   Expected:
   - `google_id`: Should be NULL or empty
   - `google_email`: Should be NULL or empty
   - `is_google_linked`: Should be `0` (false)
   - Same user ID as before

### Expected Results:
- ✅ Google account unlinked successfully
- ✅ Can still login with email/password
- ✅ Database updated correctly
- ✅ No data loss

### Pass Criteria:
- [ ] Successfully unlinked Google account
- [ ] Can still login with email/password
- [ ] Google info removed from Account Management
- [ ] Database updated correctly
- [ ] No console errors

---

## **TEST 5: Error Handling - User Cancels OAuth**

### Objective:
Verify proper handling when user cancels Google OAuth flow.

### Steps:

1. **Start OAuth Flow**
   - Go to Signup or Login page
   - Click "Continue with Google"
   - Verify redirected to Google

2. **Cancel on Google**
   - On Google consent screen, click "Cancel" or close window
   - OR click browser back button

3. **Verify Error Handling**
   - Should redirect back to app
   - Should show error message (if implemented)
   - Should NOT create a user
   - Should NOT log in

### Expected Results:
- ✅ Redirected back to app
- ✅ Error message shown (optional)
- ✅ No user created
- ✅ User not logged in

### Pass Criteria:
- [ ] Graceful handling of cancellation
- [ ] No user created
- [ ] No console errors (or expected errors only)

---

## **TEST 6: Error Handling - Invalid State Token**

### Objective:
Verify CSRF protection works correctly.

### Steps:

1. **Manually Craft Invalid Callback URL**
   - Get a valid OAuth callback URL
   - Change the `state` parameter to something random
   - Example: `http://localhost:3000/auth/google/callback?code=xxx&state=invalid123`

2. **Try to Complete OAuth**
   - Navigate to the crafted URL
   - Verify error handling

### Expected Results:
- ✅ Error: "Invalid state token" or similar
- ✅ User not logged in
- ✅ Security maintained

### Pass Criteria:
- [ ] Invalid state rejected
- [ ] Error message shown
- [ ] User not logged in

---

## **TEST 7: Duplicate Google Account**

### Objective:
Verify that the same Google account cannot be linked to multiple users.

### Steps:

1. **Create User A with Google**
   - Sign up with Google using account `test@gmail.com`
   - Verify successful signup

2. **Create User B with Email/Password**
   - Logout
   - Sign up with email/password using different email
   - Login as User B

3. **Try to Link Same Google Account**
   - Go to Account Management
   - Click "Link Google Account"
   - Select the same Google account (`test@gmail.com`)

### Expected Results:
- ✅ Error: "This Google account is already linked to another user"
- ✅ Account not linked
- ✅ User B remains unchanged

### Pass Criteria:
- [ ] Duplicate Google account rejected
- [ ] Error message shown
- [ ] No data corruption

---

## **TEST 8: Email Conflict Resolution**

### Objective:
Verify handling when Google email matches existing user email.

### Steps:

1. **Create User with Email/Password**
   - Sign up with email: `test@gmail.com`
   - Password: `password123`

2. **Try to Sign Up with Google (Same Email)**
   - Logout
   - Go to Signup page
   - Click "Sign up with Google"
   - Select Google account with email: `test@gmail.com`

### Expected Results:
- ✅ Should link Google to existing account (preferred)
- ✅ OR show error asking to login first then link
- ✅ Should NOT create duplicate user

### Pass Criteria:
- [ ] No duplicate users created
- [ ] Clear messaging to user
- [ ] Data integrity maintained

---

## **TEST 9: Unlink Without Password (Edge Case)**

### Objective:
Verify that users who signed up with Google only cannot unlink without setting a password first.

### Prerequisites:
- User signed up with Google only (no password set)

### Steps:

1. **Sign Up with Google Only**
   - Create new user via Google OAuth
   - Do NOT set a password

2. **Try to Unlink Google**
   - Go to Account Management
   - Click "Unlink Google Account"

### Expected Results:
- ✅ Error: "Please set a password before unlinking"
- ✅ Unlink prevented
- ✅ Suggestion to set password first

### Pass Criteria:
- [ ] Unlink prevented
- [ ] Clear error message
- [ ] User not locked out

---

## 🔍 What to Check During Testing

### Frontend Checks:
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Loading states display correctly
- [ ] Error messages are clear and helpful
- [ ] Dark mode works correctly
- [ ] Responsive design works on mobile
- [ ] Buttons are disabled during loading
- [ ] Success messages appear when appropriate

### Backend Checks:
- [ ] No server errors in logs
- [ ] State tokens are validated
- [ ] JWT tokens are generated correctly
- [ ] Database transactions complete successfully
- [ ] CORS headers are correct
- [ ] OAuth redirects work correctly

### Database Checks:
- [ ] User records created correctly
- [ ] Google OAuth fields populated
- [ ] No duplicate users
- [ ] Foreign key relationships intact
- [ ] Timestamps updated correctly

### Security Checks:
- [ ] State tokens prevent CSRF
- [ ] JWT tokens are secure
- [ ] Passwords are hashed (for email/password users)
- [ ] Google Client Secret not exposed
- [ ] HTTPS used in production

---

## 📊 Testing Checklist

### Pre-Testing Setup:
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Database accessible
- [ ] Google OAuth credentials configured
- [ ] Environment variables set correctly
- [ ] Test Google account available

### Core Features:
- [ ] Test 1: New User Sign Up with Google
- [ ] Test 2: Existing User Login with Google
- [ ] Test 3: Link Google to Email/Password Account
- [ ] Test 4: Unlink Google from Account

### Error Handling:
- [ ] Test 5: User Cancels OAuth
- [ ] Test 6: Invalid State Token
- [ ] Test 7: Duplicate Google Account
- [ ] Test 8: Email Conflict Resolution
- [ ] Test 9: Unlink Without Password

### Additional Checks:
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Loading states
- [ ] Error messages
- [ ] Success messages
- [ ] Database integrity
- [ ] No console errors
- [ ] No server errors

---

## 🐛 Common Issues & Solutions

### Issue 1: "Redirect URI Mismatch"
**Cause:** Google OAuth redirect URI not configured correctly  
**Solution:** 
- Check Google Cloud Console → Credentials
- Ensure redirect URI matches exactly: `http://localhost:8080/api/auth/google/callback`
- No trailing slash!

### Issue 2: "Invalid State Token"
**Cause:** State token expired or not stored correctly  
**Solution:**
- Check state token generation in backend
- Verify state storage mechanism
- Check token expiration time

### Issue 3: "User Not Logged In After OAuth"
**Cause:** JWT token not stored or auth context not updated  
**Solution:**
- Check GoogleCallback component
- Verify token storage in localStorage
- Check AuthContext update logic

### Issue 4: "Google Account Already Linked"
**Cause:** Trying to link Google account that's already linked to another user  
**Solution:**
- This is expected behavior
- Show clear error message
- Suggest logging in with Google instead

### Issue 5: "Cannot Unlink Google Account"
**Cause:** User has no password set  
**Solution:**
- Check if user has password
- Show error message
- Require password setup first

---

## 📝 Test Results Template

Use this template to record test results:

```
Test: [Test Name]
Date: [Date]
Tester: [Your Name]
Environment: [Development/Staging/Production]

Steps Completed:
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
...

Results:
✅ Pass / ❌ Fail

Issues Found:
- [Issue 1 description]
- [Issue 2 description]

Screenshots:
- [Attach screenshots if needed]

Notes:
[Any additional observations]
```

---

## 🎯 Success Criteria

The Google OAuth implementation is considered successful when:

1. ✅ All 9 test cases pass
2. ✅ No critical bugs found
3. ✅ No console errors
4. ✅ No server errors
5. ✅ Database integrity maintained
6. ✅ Security measures working (state token validation)
7. ✅ User experience is smooth
8. ✅ Error messages are clear
9. ✅ Dark mode works
10. ✅ Mobile responsive

---

## 📈 Next Steps After Testing

Once all tests pass:

1. **Document any issues found**
   - Create bug reports
   - Prioritize fixes

2. **Fix critical bugs**
   - Address any blocking issues
   - Re-test after fixes

3. **Optional Enhancements**
   - Add more detailed error messages
   - Improve loading states
   - Add analytics tracking
   - Add email notifications

4. **Prepare for Production**
   - Update redirect URIs for production domain
   - Set up production environment variables
   - Test on production-like environment
   - Create deployment checklist

5. **Move to Next Feature**
   - Comments on Favorites
   - Dark Theme improvements
   - Profile Statistics
   - etc.

---

## 🔗 Related Documentation

- [Priority 4: Google OAuth Plan](./PRIORITY_4_GOOGLE_OAUTH_PLAN.md)
- [Step 3.8: Connected Accounts Implementation](./STEP_3.8_CONNECTED_ACCOUNTS_IMPLEMENTATION_PLAN.md)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Status:** ✅ READY FOR TESTING  
**Priority:** HIGH  
**Estimated Testing Time:** 2-3 hours  
**Last Updated:** December 2024

---

## 💡 Testing Tips

1. **Use Incognito/Private Browsing**
   - Prevents cookie/cache issues
   - Clean slate for each test

2. **Use Multiple Google Accounts**
   - Test with different accounts
   - Verify account isolation

3. **Test on Different Browsers**
   - Chrome, Firefox, Safari, Edge
   - Verify cross-browser compatibility

4. **Test on Mobile Devices**
   - iOS Safari
   - Chrome Mobile
   - Verify responsive design

5. **Keep Developer Tools Open**
   - Monitor console for errors
   - Check network requests
   - Inspect localStorage

6. **Document Everything**
   - Take screenshots
   - Record videos if needed
   - Note any unexpected behavior

7. **Test Edge Cases**
   - Slow network
   - Network interruption
   - Browser back button
   - Multiple tabs

---

**Happy Testing! 🚀**
