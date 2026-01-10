# Week 2: GORM Integration & Authentication (Updated Plan)

**Goal:** Integrate GORM with existing models, implement authentication system

**Timeline:** 5-6 days (20-25 hours)  
**Status:** 📋 Ready to Start

---

## 🎯 Week 2 Overview (GORM Approach)

### **What We're Building:**
1. GORM database connection
2. Auto-migration from existing models
3. Repository layer with GORM queries
4. JWT authentication system
5. User registration & login
6. Protected route implementation

### **What You Already Have:**
- ✅ All 4 GORM models (User, Verse, Favorite, History)
- ✅ Proper relationships defined
- ✅ GORM tags configured
- ✅ PostgreSQL running in Docker

### **By End of Week 2:**
- ✅ GORM connected to PostgreSQL
- ✅ Tables auto-created from models
- ✅ Repository layer functional
- ✅ Users can register/login
- ✅ JWT tokens working
- ✅ Protected routes enforced

---

## 📅 Updated Week 2 Schedule

### **Day 1: GORM Setup & Auto-Migration (3-4 hours)**

**Step 1: Install GORM Dependencies (15 minutes)**
- Install GORM core
- Install PostgreSQL driver
- Update go.mod

**Step 2: Update Database Connection (1-2 hours)**
- Replace database/sql with GORM
- Configure GORM connection
- Set connection pool settings
- Add logging

**Step 3: Run Auto-Migration (30 minutes)**
- Import all models
- Run AutoMigrate
- Verify tables created
- Check relationships

**Step 4: Test GORM Connection (30-45 minutes)**
- Create test records
- Query test records
- Verify relationships work
- Clean up test data

---

### **Day 2: Repository Layer - Part 1 (4-5 hours)**

**Step 5: Create User Repository (2-3 hours)**
- Define repository interface
- Implement CRUD operations
- Add query methods (GetByEmail, GetByUsername)
- Add error handling
- Write unit tests

**Step 6: Create Verse Repository (1-2 hours)**
- Define repository interface
- Implement fetch operations
- Add search functionality
- Add caching logic (optional)
- Write unit tests

---

### **Day 3: Repository Layer - Part 2 (3-4 hours)**

**Step 7: Create Favorites Repository (1-2 hours)**
- Define repository interface
- Implement add/remove/list operations
- Add user association queries
- Handle duplicates
- Write unit tests

**Step 8: Create History Repository (1-2 hours)**
- Define repository interface
- Implement tracking operations
- Add cleanup logic (old entries)
- Add pagination
- Write unit tests

---

### **Day 4: Authentication - Part 1 (4-5 hours)**

**Step 9: JWT Token Service (2-3 hours)**
- Install JWT library
- Create token service interface
- Implement token generation
- Implement token validation
- Add refresh token logic
- Test token lifecycle

**Step 10: Password Security (1-2 hours)**
- Implement bcrypt hashing
- Add password validation rules
- Add password strength checker
- Test hashing/verification
- Add helper methods to User model

---

### **Day 5: Authentication - Part 2 (4-5 hours)**

**Step 11: Register Endpoint (2-3 hours)**
- Implement registration logic
- Add email validation
- Check for duplicates
- Hash password
- Create user in database
- Generate JWT token
- Return user + token
- Test with curl

**Step 12: Login Endpoint (1-2 hours)**
- Implement login logic
- Find user by email
- Verify password
- Generate JWT token
- Return user + token
- Handle errors
- Test with curl

---

### **Day 6: Auth Middleware & Integration (3-4 hours)**

**Step 13: Implement Auth Middleware (2-3 hours)**
- Extract JWT from header
- Validate token
- Load user from database (GORM)
- Set user in Gin context
- Handle unauthorized access
- Test middleware

**Step 14: Update Protected Routes (30 minutes)**
- Apply auth middleware to routes
- Test protection works
- Verify 401 responses
- Test with valid tokens

**Step 15: Integration Testing (1-2 hours)**
- Test complete registration flow
- Test complete login flow
- Test protected route access
- Test token expiration
- Test invalid credentials
- Document all tests

---

## 📋 Detailed Step Breakdown

### **Step 1: Install GORM Dependencies**

**What to Install:**
```bash
# GORM core
go get -u gorm.io/gorm

# PostgreSQL driver for GORM
go get -u gorm.io/driver/postgres

# JWT library
go get -u github.com/golang-jwt/jwt/v5

# Password hashing (already in Go stdlib)
# golang.org/x/crypto/bcrypt
```

**Verify Installation:**
```bash
go mod tidy
go mod verify
```

**What This Does:**
- Adds GORM to your project
- Adds PostgreSQL driver
- Adds JWT library
- Updates go.mod and go.sum

---

### **Step 2: Update Database Connection**

**Current Setup:**
```go
// You currently use database/sql
import "database/sql"
db, err := sql.Open("postgres", connStr)
```

**New GORM Setup:**
```go
// Switch to GORM
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

dsn := "host=localhost user=dailybible_user password=test123 dbname=daily_bible_dev port=5432 sslmode=disable"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Info),
})
```

**Where to Update:**
- `internal/database/database.go` (or wherever you initialize DB)
- Update connection string format
- Add GORM configuration
- Set up connection pooling

**Configuration Options:**
```go
&gorm.Config{
    Logger: logger.Default.LogMode(logger.Info),  // Log all SQL queries
    NowFunc: func() time.Time {
        return time.Now().UTC()  // Use UTC timestamps
    },
    PrepareStmt: true,  // Cache prepared statements
}
```

**Connection Pool Settings:**
```go
sqlDB, err := db.DB()
sqlDB.SetMaxIdleConns(10)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)
```

---

### **Step 3: Run Auto-Migration**

**What Auto-Migration Does:**
- Reads your GORM models
- Creates tables if they don't exist
- Adds missing columns
- Creates indexes
- Sets up foreign keys
- Does NOT delete columns (safe)

**How to Run:**
```go
// In your database initialization
import "your-project/internal/models"

err := db.AutoMigrate(
    &models.User{},
    &models.Verse{},
    &models.Favorite{},
    &models.History{},
)
```

**What Happens:**
1. GORM analyzes each model struct
2. Compares with existing database schema
3. Creates/updates tables as needed
4. Creates indexes from GORM tags
5. Sets up foreign key constraints

**Verification:**
```bash
# Connect to database
docker exec -it daily-bible-db psql -U dailybible_user -d daily_bible_dev

# List tables
\dt

# Describe a table
\d users

# Check indexes
\di
```

**Expected Tables:**
- `users` - From User model
- `verses` - From Verse model
- `favorites` - From Favorite model
- `histories` - From History model (GORM pluralizes)

---

### **Step 4: Test GORM Connection**

**Simple Test:**
```go
// Create a test user
user := models.User{
    Email:    "test@example.com",
    Username: "testuser",
    Password: "hashedpassword",
}
result := db.Create(&user)

// Check for errors
if result.Error != nil {
    log.Fatal(result.Error)
}

// Query the user
var foundUser models.User
db.Where("email = ?", "test@example.com").First(&foundUser)

// Delete test user
db.Delete(&foundUser)
```

**What to Verify:**
- ✅ Connection works
- ✅ Can create records
- ✅ Can query records
- ✅ Can delete records
- ✅ No errors

---

### **Step 5: Create User Repository**

**Repository Pattern:**
```
Handler → Service → Repository → Database
```

**Interface Definition:**
```go
// internal/repository/user_repository.go
type UserRepository interface {
    Create(user *models.User) error
    GetByID(id uint) (*models.User, error)
    GetByEmail(email string) (*models.User, error)
    GetByUsername(username string) (*models.User, error)
    Update(user *models.User) error
    Delete(id uint) error
    List(limit, offset int) ([]models.User, error)
}
```

**Implementation Structure:**
```go
type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}

// Implement each method using GORM
```

**GORM Query Examples:**
```go
// Create
func (r *userRepository) Create(user *models.User) error {
    return r.db.Create(user).Error
}

// Get by email
func (r *userRepository) GetByEmail(email string) (*models.User, error) {
    var user models.User
    err := r.db.Where("email = ?", email).First(&user).Error
    if err == gorm.ErrRecordNotFound {
        return nil, errors.New("user not found")
    }
    return &user, err
}

// Update
func (r *userRepository) Update(user *models.User) error {
    return r.db.Save(user).Error
}

// Delete (soft delete)
func (r *userRepository) Delete(id uint) error {
    return r.db.Delete(&models.User{}, id).Error
}
```

**Error Handling:**
- Check for `gorm.ErrRecordNotFound`
- Return custom errors
- Log database errors
- Handle constraint violations

---

### **Step 6: Create Verse Repository**

**Interface:**
```go
type VerseRepository interface {
    Create(verse *models.Verse) error
    GetByID(id uint) (*models.Verse, error)
    GetByReference(reference string) (*models.Verse, error)
    Search(query string, limit int) ([]models.Verse, error)
    GetDailyVerse() (*models.Verse, error)
    List(limit, offset int) ([]models.Verse, error)
}
```

**GORM Query Examples:**
```go
// Search verses
func (r *verseRepository) Search(query string, limit int) ([]models.Verse, error) {
    var verses []models.Verse
    err := r.db.Where("text ILIKE ?", "%"+query+"%").
        Limit(limit).
        Find(&verses).Error
    return verses, err
}

// Get daily verse (random)
func (r *verseRepository) GetDailyVerse() (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Order("RANDOM()").First(&verse).Error
    return &verse, err
}
```

---

### **Step 7: Create Favorites Repository**

**Interface:**
```go
type FavoriteRepository interface {
    Add(userID, verseID uint) error
    Remove(userID, verseID uint) error
    List(userID uint) ([]models.Favorite, error)
    Exists(userID, verseID uint) (bool, error)
}
```

**GORM Query Examples:**
```go
// Add favorite (with duplicate check)
func (r *favoriteRepository) Add(userID, verseID uint) error {
    favorite := models.Favorite{
        UserID:  userID,
        VerseID: verseID,
    }
    return r.db.Create(&favorite).Error
}

// List with preloaded verse
func (r *favoriteRepository) List(userID uint) ([]models.Favorite, error) {
    var favorites []models.Favorite
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").  // Load related verse
        Find(&favorites).Error
    return favorites, err
}

// Check if exists
func (r *favoriteRepository) Exists(userID, verseID uint) (bool, error) {
    var count int64
    err := r.db.Model(&models.Favorite{}).
        Where("user_id = ? AND verse_id = ?", userID, verseID).
        Count(&count).Error
    return count > 0, err
}
```

---

### **Step 8: Create History Repository**

**Interface:**
```go
type HistoryRepository interface {
    Track(userID, verseID uint) error
    List(userID uint, limit int) ([]models.History, error)
    Clear(userID uint) error
    CleanupOld(days int) error
}
```

**GORM Query Examples:**
```go
// Track verse view
func (r *historyRepository) Track(userID, verseID uint) error {
    history := models.History{
        UserID:   userID,
        VerseID:  verseID,
        ViewedAt: time.Now(),
    }
    return r.db.Create(&history).Error
}

// List with pagination
func (r *historyRepository) List(userID uint, limit int) ([]models.History, error) {
    var history []models.History
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Limit(limit).
        Find(&history).Error
    return history, err
}

// Cleanup old entries
func (r *historyRepository) CleanupOld(days int) error {
    cutoff := time.Now().AddDate(0, 0, -days)
    return r.db.Where("viewed_at < ?", cutoff).
        Delete(&models.History{}).Error
}
```

---

### **Step 9: JWT Token Service**

**Token Service Interface:**
```go
type TokenService interface {
    GenerateToken(userID uint, email string) (string, error)
    ValidateToken(tokenString string) (*TokenClaims, error)
    RefreshToken(tokenString string) (string, error)
}
```

**Token Claims Structure:**
```go
type TokenClaims struct {
    UserID uint   `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}
```

**Configuration:**
```go
const (
    TokenExpiration = 7 * 24 * time.Hour  // 7 days
    SecretKey       = "your-secret-key"    // From environment
)
```

**Implementation Steps:**
1. Create claims with user data
2. Set expiration time
3. Sign token with secret key
4. Return token string

**Validation Steps:**
1. Parse token string
2. Verify signature
3. Check expiration
4. Extract claims
5. Return user data

---

### **Step 10: Password Security**

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Bcrypt Configuration:**
```go
const BcryptCost = 12  // Higher = more secure, slower
```

**Helper Methods to Add to User Model:**
```go
// Hash password before saving
func (u *User) HashPassword(password string) error {
    // Use bcrypt to hash
}

// Check password
func (u *User) CheckPassword(password string) bool {
    // Compare hashed password
}

// Validate password strength
func ValidatePassword(password string) error {
    // Check requirements
}
```

**Security Best Practices:**
- Never log passwords
- Never return password in API responses
- Always hash before storing
- Use bcrypt (not MD5/SHA1)
- Set appropriate cost factor

---

### **Step 11: Register Endpoint Implementation**

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Implementation Flow:**
1. Parse request body
2. Validate input (email format, password strength)
3. Check email not already registered
4. Check username not already taken
5. Hash password
6. Create user in database (via repository)
7. Generate JWT token
8. Return user + token

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2026-01-09T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Invalid input
- 409: Email/username already exists
- 500: Server error

---

### **Step 12: Login Endpoint Implementation**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Implementation Flow:**
1. Parse request body
2. Validate input
3. Find user by email (via repository)
4. Check user exists
5. Verify password
6. Generate JWT token
7. Return user + token

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "john_doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400: Invalid input
- 401: Invalid credentials
- 500: Server error

---

### **Step 13: Implement Auth Middleware**

**Middleware Flow:**
```
Request → Extract Token → Validate Token → Load User → Set Context → Next Handler
```

**Implementation Steps:**
1. Get Authorization header
2. Extract token (remove "Bearer " prefix)
3. Validate token with TokenService
4. Extract user ID from claims
5. Load user from database (via repository)
6. Set user in Gin context
7. Call next handler

**If Invalid:**
- Return 401 Unauthorized
- Clear error message
- Don't call next handler

**Context Key:**
```go
const UserContextKey = "user"

// Set user in context
c.Set(UserContextKey, user)

// Get user from context (in handlers)
user, _ := c.Get(UserContextKey)
currentUser := user.(*models.User)
```

---

### **Step 14: Update Protected Routes**

**Apply Middleware:**
```go
// Protected routes group
protected := router.Group("/api")
protected.Use(authMiddleware.RequireAuth())
{
    protected.GET("/auth/me", authHandler.GetMe)
    protected.GET("/favorites", favoritesHandler.List)
    protected.POST("/favorites", favoritesHandler.Add)
    protected.DELETE("/favorites/:id", favoritesHandler.Remove)
    protected.GET("/history", historyHandler.List)
    protected.DELETE("/history/:id", historyHandler.Clear)
}
```

**Test Protection:**
```bash
# Without token - should get 401
curl http://localhost:8080/api/favorites

# With valid token - should work
curl http://localhost:8080/api/favorites \
  -H "Authorization: Bearer <your-token>"
```

---

### **Step 15: Integration Testing**

**Test Scenarios:**

**1. Registration Flow:**
```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'

# Should return user + token
# Save token for next tests
```

**2. Login Flow:**
```bash
# Login with credentials
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Should return user + token
```

**3. Protected Route Access:**
```bash
# Get current user (with token)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <your-token>"

# Should return user profile
```

**4. Invalid Token:**
```bash
# Try with invalid token
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid-token"

# Should return 401 Unauthorized
```

**5. No Token:**
```bash
# Try without token
curl http://localhost:8080/api/favorites

# Should return 401 Unauthorized
```

---

## 🧪 Testing Strategy

### **Unit Tests:**
- Repository methods
- Token generation/validation
- Password hashing/verification
- Input validation

### **Integration Tests:**
- Complete registration flow
- Complete login flow
- Protected route access
- Token expiration
- Invalid credentials
- Duplicate registration

### **Manual Tests:**
- Test with Postman/curl
- Verify database records
- Check token expiration
- Test error messages

---

## 📦 Dependencies Summary

**Required Packages:**
```bash
# GORM
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres

# JWT
go get -u github.com/golang-jwt/jwt/v5

# Already have:
# - Gin framework
# - bcrypt (Go stdlib)
# - PostgreSQL driver
```

**Update go.mod:**
```bash
go mod tidy
go mod verify
```

---

## 🔒 Security Checklist

**Password Security:**
- ✅ Use bcrypt (cost 12)
- ✅ Never store plain passwords
- ✅ Never log passwords
- ✅ Validate password strength
- ✅ Hash before storing

**JWT Security:**
- ✅ Use strong secret (32+ chars)
- ✅ Store secret in environment
- ✅ Set reasonable expiration
- ✅ Validate signature
- ✅ Check expiration

**API Security:**
- ✅ CORS configured
- ✅ Input validation
- ✅ SQL injection prevention (GORM handles)
- ✅ Error messages don't leak info
- ✅ Rate limiting (future)

---

## 📁 Updated File Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go (update: GORM init)
├── internal/
│   ├── models/
│   │   ├── user.go ✅ (already done)
│   │   ├── verse.go ✅ (already done)
│   │   ├── favorite.go ✅ (already done)
│   │   └── history.go ✅ (already done)
│   ├── repository/
│   │   ├── user_repository.go (create)
│   │   ├── verse_repository.go (create)
│   │   ├── favorite_repository.go (create)
│   │   └── history_repository.go (create)
│   ├── services/
│   │   ├── auth_service.go (create)
│   │   └── token_service.go (create)
│   ├── handlers/
│   │   ├── auth.go (update)
│   │   ├── verses.go (update later)
│   │   ├── favorites.go (update later)
│   │   └── history.go (update later)
│   ├── middleware/
│   │   └── auth.go (update)
│   └── database/
│       ├── database.go (update: GORM connection)
│       └── migrations.go (update: AutoMigrate)
├── .env (add JWT_SECRET)
└── go.mod (update dependencies)
```

---

## 🎯 Success Criteria

**By end of Week 2:**

**1. GORM Working:**
```bash
# Can connect to database
# Tables auto-created
# Can query with GORM
```

**2. Registration Working:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"Pass123!"}'

# Returns: user + token
```

**3. Login Working:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass123!"}'

# Returns: user + token
```

**4. Protected Routes Working:**
```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"

# Returns: user profile
```

**5. Auth Middleware Working:**
```bash
curl http://localhost:8080/api/favorites

# Returns: 401 Unauthorized
```

---

## 💡 Tips for Success

### **Day 1 (GORM Setup):**
- Start fresh - drop existing tables if needed
- Let GORM create tables from models
- Test connection thoroughly
- Verify all relationships work

### **Day 2-3 (Repositories):**
- Write interfaces first
- Implement one method at a time
- Test each method individually
- Use GORM's built-in methods
- Handle errors properly

### **Day 4-5 (Authentication):**
- Test JWT generation separately
- Test password hashing separately
- Then combine in endpoints
- Use Postman/curl for testing
- Save tokens for testing

### **Day 6 (Integration):**
- Test complete flows
- Verify database records
- Check error messages
- Test edge cases
- Document everything

---

## 🚀 Getting Started Tomorrow

### **First Thing Tomorrow:**

**1. Install Dependencies (15 min)**
```bash
cd backend
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/golang-jwt/jwt/v5
go mod tidy
```

**2. Update Database Connection (1-2 hours)**
- Find your database initialization code
- Replace `database/sql` with GORM
- Update connection string
- Add GORM configuration

**3. Run AutoMigrate (30 min)**
- Import your models
- Call AutoMigrate
- Verify tables created
- Test basic queries

**4. Start User Repository (2-3 hours)**
- Create repository file
- Define interface
- Implement Create method
- Test it works

---

## 📊 Week 2 Checklist

### **Day 1: GORM Setup**
- [ ] Step 1: Dependencies installed
- [ ] Step 2: Database connection updated
- [ ] Step 3: AutoMigrate running
- [ ] Step 4: GORM connection tested

### **Day 2: Repositories Part 1**
- [ ] Step 5: User repository implemented
- [ ] Step 6: Verse repository implemented

### **Day 3: Repositories Part 2**
- [ ] Step 7: Favorites repository implemented
- [ ] Step 8: History repository implemented

### **Day 4: Authentication Part 1**
- [ ] Step 9: JWT token service implemented
- [ ] Step 10: Password security implemented

### **Day 5: Authentication Part 2**
- [ ] Step 11: Register endpoint working
- [ ] Step 12: Login endpoint working

### **Day 6: Integration**
- [ ] Step 13: Auth middleware implemented
- [ ] Step 14: Protected routes enforced
- [ ] Step 15: Integration tests passing

---

## 🎊 Summary

**What Changed from Original Plan:**
- ❌ No manual SQL migrations
- ❌ No raw SQL queries
- ✅ Use GORM AutoMigrate
- ✅ Use GORM query methods
- ✅ Leverage existing models
- ✅ Faster development

**Time Saved:**
- Original: 30 hours
- Updated: 20-25 hours
- Saved: 5-10 hours

**What You're Building:**
- ✅ GORM-based backend
- ✅ Type-safe queries
- ✅ Auto-migrations
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Production-ready code

---

**Status:** ✅ Ready to Start  
**Next Step:** Day 1, Step 1 - Install GORM Dependencies  
**Estimated Time:** 20-25 hours total  
**Target Completion:** End of Week 2

**You're set up for success with your existing GORM models! 🚀**
