# Week 2: Database Schema & Authentication Implementation

**Goal:** Implement database models, authentication system, and user management

**Timeline:** 5-7 days (25-30 hours)  
**Status:** 📋 Planning Phase

---

## 🎯 Week 2 Overview

### **What We'll Build:**
1. Complete database schema
2. Repository pattern implementation
3. JWT authentication system
4. User registration & login
5. Password security
6. Protected route implementation

### **By End of Week 2:**
- ✅ Users can register accounts
- ✅ Users can login/logout
- ✅ JWT tokens working
- ✅ Protected routes enforced
- ✅ Database fully operational
- ✅ All auth endpoints functional

---

## 📅 Week 2 Schedule

### **Day 1-2: Database Schema & Models (8-10 hours)**

**Step 1: Design Complete Database Schema (2-3 hours)**
- Define all tables (users, verses, favorites, history)
- Define relationships
- Define indexes
- Plan migrations

**Step 2: Implement User Model (2-3 hours)**
- Create user struct
- Add validation
- Add password hashing
- Add timestamps

**Step 3: Implement Verse Models (2-3 hours)**
- Create verse struct
- Create favorite struct
- Create history struct
- Add relationships

**Step 4: Create Database Migrations (1-2 hours)**
- Write SQL migrations
- Test migrations
- Add rollback support

---

### **Day 3-4: Repository Pattern (8-10 hours)**

**Step 5: Implement User Repository (3-4 hours)**
- Create user repository interface
- Implement CRUD operations
- Add query methods
- Add error handling

**Step 6: Implement Verse Repository (2-3 hours)**
- Create verse repository interface
- Implement fetch operations
- Add caching logic

**Step 7: Implement Favorites Repository (2-3 hours)**
- Create favorites repository interface
- Implement add/remove/list
- Add user association

**Step 8: Implement History Repository (1-2 hours)**
- Create history repository interface
- Implement tracking
- Add cleanup logic

---

### **Day 5-6: Authentication System (8-10 hours)**

**Step 9: JWT Token Generation (2-3 hours)**
- Install JWT library
- Create token service
- Implement token generation
- Add token validation

**Step 10: Password Security (2-3 hours)**
- Implement bcrypt hashing
- Add password validation
- Add password strength checks
- Test security

**Step 11: Register Endpoint (2-3 hours)**
- Implement registration logic
- Add email validation
- Add duplicate checking
- Return JWT token

**Step 12: Login Endpoint (2-3 hours)**
- Implement login logic
- Verify credentials
- Generate JWT token
- Handle errors

---

### **Day 7: Auth Middleware & Testing (4-6 hours)**

**Step 13: Implement Auth Middleware (2-3 hours)**
- Extract JWT from header
- Validate token
- Load user from database
- Set user in context

**Step 14: Update Protected Routes (1-2 hours)**
- Apply auth middleware
- Test protection
- Handle unauthorized access

**Step 15: Integration Testing (1-2 hours)**
- Test registration flow
- Test login flow
- Test protected routes
- Test token expiration

---

## 📋 Detailed Step Breakdown

### **Step 1: Design Complete Database Schema**

**Tables to Create:**

**1. users**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**2. verses**
```sql
CREATE TABLE verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse INTEGER NOT NULL,
    translation VARCHAR(10) NOT NULL DEFAULT 'KJV',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(reference, translation)
);
```

**3. favorites**
```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);
```

**4. history**
```sql
CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Indexes:**
```sql
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_viewed_at ON history(viewed_at);
CREATE INDEX idx_verses_reference ON verses(reference);
```

---

### **Step 2: Implement User Model**

**File:** `internal/domain/models/user.go`

**User Struct:**
```go
type User struct {
    ID           string    `json:"id"`
    Email        string    `json:"email"`
    Username     string    `json:"username"`
    PasswordHash string    `json:"-"` // Never expose in JSON
    CreatedAt    time.Time `json:"created_at"`
    UpdatedAt    time.Time `json:"updated_at"`
}
```

**Methods to Implement:**
- `ValidateEmail()` - Email format validation
- `ValidateUsername()` - Username rules
- `ValidatePassword()` - Password strength
- `HashPassword()` - Bcrypt hashing
- `CheckPassword()` - Verify password

---

### **Step 3: Implement Verse Models**

**Verse Struct:**
```go
type Verse struct {
    ID          string    `json:"id"`
    Reference   string    `json:"reference"`
    Text        string    `json:"text"`
    Book        string    `json:"book"`
    Chapter     int       `json:"chapter"`
    Verse       int       `json:"verse"`
    Translation string    `json:"translation"`
    CreatedAt   time.Time `json:"created_at"`
}
```

**Favorite Struct:**
```go
type Favorite struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    VerseID   string    `json:"verse_id"`
    Verse     *Verse    `json:"verse,omitempty"`
    CreatedAt time.Time `json:"created_at"`
}
```

**History Struct:**
```go
type History struct {
    ID       string    `json:"id"`
    UserID   string    `json:"user_id"`
    VerseID  string    `json:"verse_id"`
    Verse    *Verse    `json:"verse,omitempty"`
    ViewedAt time.Time `json:"viewed_at"`
}
```

---

### **Step 5: Implement User Repository**

**Interface:**
```go
type UserRepository interface {
    Create(user *User) error
    GetByID(id string) (*User, error)
    GetByEmail(email string) (*User, error)
    GetByUsername(username string) (*User, error)
    Update(user *User) error
    Delete(id string) error
}
```

**Implementation Location:**
- `internal/repository/user_repository.go`

---

### **Step 9: JWT Token Generation**

**Token Service Interface:**
```go
type TokenService interface {
    GenerateToken(userID string, email string) (string, error)
    ValidateToken(token string) (*TokenClaims, error)
    RefreshToken(token string) (string, error)
}
```

**Token Claims:**
```go
type TokenClaims struct {
    UserID string `json:"user_id"`
    Email  string `json:"email"`
    jwt.StandardClaims
}
```

**Configuration:**
- Token expiration: 7 days
- Secret key: From environment variable
- Algorithm: HS256

---

### **Step 11: Register Endpoint Implementation**

**Request:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Logic:**
1. Validate input
2. Check email not taken
3. Check username not taken
4. Hash password
5. Create user in database
6. Generate JWT token
7. Return user + token

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2026-01-09T..."
  },
  "token": "jwt-token-here"
}
```

---

### **Step 12: Login Endpoint Implementation**

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Logic:**
1. Validate input
2. Find user by email
3. Verify password
4. Generate JWT token
5. Return user + token

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe"
  },
  "token": "jwt-token-here"
}
```

---

### **Step 13: Implement Auth Middleware**

**Middleware Logic:**
1. Extract Authorization header
2. Parse "Bearer <token>"
3. Validate JWT token
4. Extract user ID from claims
5. Load user from database
6. Set user in Gin context
7. Call next handler


**If Invalid:**
- Return 401 Unauthorized
- Clear error message
- Don't call next handler

---

## 🧪 Testing Strategy

### **Unit Tests:**
- User model validation
- Password hashing/verification
- Token generation/validation
- Repository operations


### **Integration Tests:**
- Registration flow
- Login flow
- Protected route access
- Token expiration
- Invalid credentials

### **Test Cases:**

**Registration:**
- ✅ Valid registration
- ❌ Duplicate email
- ❌ Duplicate username
- ❌ Invalid email format
- ❌ Weak password
- ❌ Missing fields

**Login:**
- ✅ Valid credentials
- ❌ Invalid email
- ❌ Invalid password
- ❌ Non-existent user
- ❌ Missing fields

**Protected Routes:**
- ✅ Valid token
- ❌ Missing token
- ❌ Invalid token
- ❌ Expired token
- ❌ Malformed token

---

## 📦 Dependencies to Install

```bash
# JWT library
go get github.com/golang-jwt/jwt/v5

# Password hashing (already have)
# bcrypt is in Go standard library: golang.org/x/crypto/bcrypt

# UUID generation
go get github.com/google/uuid

# Database driver (already have)
# github.com/lib/pq
```

---

## 🔒 Security Considerations

### **Password Security:**
- ✅ Use bcrypt (cost factor 12)
- ✅ Never store plain passwords
- ✅ Never log passwords
- ✅ Validate password strength

### **JWT Security:**
- ✅ Use strong secret key (32+ characters)
- ✅ Store secret in environment variable
- ✅ Set reasonable expiration (7 days)
- ✅ Validate token signature
- ✅ Check token expiration

### **API Security:**
- ✅ Rate limiting (future)
- ✅ HTTPS only (production)
- ✅ CORS configured
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)

---

## 📁 File Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go (updated)
├── internal/
│   ├── domain/
│   │   └── models/
│   │       ├── user.go (new)
│   │       ├── verse.go (new)
│   │       ├── favorite.go (new)
│   │       └── history.go (new)
│   ├── repository/
│   │   ├── user_repository.go (update)
│   │   ├── verse_repository.go (update)
│   │   ├── favorite_repository.go (update)
│   │   └── history_repository.go (new)
│   ├── services/
│   │   ├── auth_service.go (update)
│   │   ├── token_service.go (new)
│   │   └── user_service.go (new)
│   ├── handlers/
│   │   ├── auth.go (update - implement real logic)
│   │   ├── users.go (new)
│   │   └── ... (others stay placeholder)
│   ├── middleware/
│   │   └── auth.go (update - implement real logic)
│   └── database/
│       ├── migrations/ (new)
│       │   ├── 001_create_users.sql
│       │   ├── 002_create_verses.sql
│       │   ├── 003_create_favorites.sql
│       │   └── 004_create_history.sql
│       └── migrations.go (update)
└── .env (update with JWT_SECRET)
```

---

## 🎯 Success Criteria

**By end of Week 2, you should be able to:**

1. **Register a new user:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"testuser","password":"SecurePass123!"}'
   ```
   Response: User object + JWT token

2. **Login with credentials:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"SecurePass123!"}'
   ```
   Response: User object + JWT token

3. **Access protected route:**
   ```bash
   curl http://localhost:8080/api/auth/me \
     -H "Authorization: Bearer <your-jwt-token>"
   ```
   Response: User profile

4. **Get blocked without token:**
   ```bash
   curl http://localhost:8080/api/favorites/
   ```
   Response: 401 Unauthorized

---

## 💡 Tips for Success

### **Day 1-2 (Database):**
- Start with simple schema
- Test migrations thoroughly
- Use database GUI tool (pgAdmin, DBeaver)
- Keep models simple initially

### **Day 3-4 (Repositories):**
- Write interfaces first
- Test each method individually
- Use transactions where needed
- Handle errors gracefully

### **Day 5-6 (Authentication):**
- Test JWT generation first
- Verify token validation works
- Test password hashing separately
- Use Postman/curl for testing

### **Day 7 (Integration):**
- Test complete flows
- Verify token in database
- Check error messages
- Test edge cases

---

## 🚀 Getting Started Tomorrow

### **First Thing Tomorrow:**

**1. Review Week 2 Plan (15 min)**
- Read this document
- Understand the flow
- Note any questions

**2. Setup Environment (15 min)**
- Ensure PostgreSQL running
- Install JWT library
- Create migrations folder

**3. Start Step 1 (2-3 hours)**
- Design database schema
- Write migration files
- Test migrations

**4. Continue with Step 2**
- Implement User model
- Add validation
- Test thoroughly

---

## 📊 Week 2 Checklist

### **Day 1-2: Database**
- [ ] Step 1: Database schema designed
- [ ] Step 2: User model implemented
- [ ] Step 3: Verse models implemented
- [ ] Step 4: Migrations created and tested

### **Day 3-4: Repositories**
- [ ] Step 5: User repository implemented
- [ ] Step 6: Verse repository implemented
- [ ] Step 7: Favorites repository implemented
- [ ] Step 8: History repository implemented

### **Day 5-6: Authentication**
- [ ] Step 9: JWT token service implemented
- [ ] Step 10: Password security implemented
- [ ] Step 11: Register endpoint working
- [ ] Step 12: Login endpoint working

### **Day 7: Integration**
- [ ] Step 13: Auth middleware implemented
- [ ] Step 14: Protected routes enforced
- [ ] Step 15: Integration tests passing

---

## 🎊 Week 2 Goals

**Technical Goals:**
- ✅ Complete database schema
- ✅ Working authentication system
- ✅ Secure password handling
- ✅ JWT tokens functional
- ✅ Protected routes enforced

**Learning Goals:**
- ✅ Database design patterns
- ✅ Repository pattern
- ✅ JWT authentication
- ✅ Security best practices
- ✅ Integration testing

**Outcome:**
- ✅ Users can register and login
- ✅ Authentication fully functional
- ✅ Database operational
- ✅ Ready for Week 3 (Bible API integration)

---

## 📝 Notes

**Remember:**
- Take breaks every 2 hours
- Test frequently
- Commit often
- Ask questions if stuck
- Focus on one step at a time

**Don't worry about:**
- Perfect code (refactor later)
- All edge cases (add incrementally)
- Performance optimization (premature)
- Advanced features (stick to plan)

**Do focus on:**
- Getting it working
- Testing thoroughly
- Understanding concepts
- Following the plan
- Building incrementally

---

**Status:** 📋 Ready to Start  
**Next Step:** Day 1, Step 1 - Design Database Schema  
**Estimated Time:** 25-30 hours total  
**Target Completion:** End of Week 2

**Good luck with Week 2! You've got this! 🚀**
