# Daily Bible App - Environment Setup Guide

**Status:** Ready for Development  
**Purpose:** Configure environment variables and secrets

---

## 🔐 Environment Variables Setup

### **Backend Environment Variables**

**Location:** `go_proj/Daily_Bible/backend/.env`

Create this file with the following content:

```env
# Server Configuration
PORT=8080
ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/dailybible?sslmode=disable

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h

# Bible API Configuration
BIBLE_API_KEY=your-api-bible-key-here
BIBLE_API_BASE_URL=https://api.scripture.api.bible/v1

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

---

## 📝 Where to Put Your Bible API Key

**Your Bible API key goes in:** `backend/.env`

**Example:**

```env
BIBLE_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

**How to get it:**

1. ✅ You already signed up at https://scripture.api.bible/
2. ✅ Copy your API key from the dashboard
3. ✅ Paste it in `backend/.env` as shown above

---

## 🗄️ Database Configuration

### **Option 1: Local PostgreSQL (Recommended for Development)**

**Install PostgreSQL:**

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

**Create Database:**

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE dailybible;

# Create user (optional)
CREATE USER dailybible_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dailybible TO dailybible_user;

# Exit
\q
```

**Update .env:**

```env
DATABASE_URL=postgresql://dailybible_user:your_password@localhost:5432/dailybible?sslmode=disable
```

---

### **Option 2: Docker PostgreSQL (Easier)**

**Run PostgreSQL in Docker:**

```bash
docker run -d \
  --name dailybible-postgres \
  -e POSTGRES_DB=dailybible \
  -e POSTGRES_USER=dailybible_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:14-alpine
```

**Update .env:**

```env
DATABASE_URL=postgresql://dailybible_user:your_password@localhost:5432/dailybible?sslmode=disable
```

**Useful Docker Commands:**

```bash
# Start container
docker start dailybible-postgres

# Stop container
docker stop dailybible-postgres

# View logs
docker logs dailybible-postgres

# Connect to database
docker exec -it dailybible-postgres psql -U dailybible_user -d dailybible
```

---

## 🎨 Frontend Environment Variables

**Location:** `go_proj/Daily_Bible/frontend/.env`

Create this file with:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api/v1

# Optional: Analytics, etc.
# REACT_APP_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

**Note:** React requires `REACT_APP_` prefix for environment variables!

---

## 🔒 Security Best Practices

### **1. Never Commit .env Files**

**Update `.gitignore`:**

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
backend/.env
frontend/.env
frontend/.env.local

# Secrets
*.key
*.pem
secrets/
```

### **2. Use Strong Secrets**

**Generate JWT Secret:**

```bash
# Generate random 32-byte secret
openssl rand -base64 32
```

**Example output:**

```
Xk7mp9Qw2Rt5Yh8Nj3Lp6Vb1Zx4Cd0Fg9Hk2Mn5Pq8
```

Use this as your `JWT_SECRET` in `.env`

### **3. Different Secrets for Production**

**Development (.env):**

```env
JWT_SECRET=dev-secret-key-not-for-production
```

**Production (Railway/Vercel):**

```env
JWT_SECRET=Xk7mp9Qw2Rt5Yh8Nj3Lp6Vb1Zx4Cd0Fg9Hk2Mn5Pq8
```

---

## 📋 Environment Variables Checklist

### **Backend (.env):**

- [ ] PORT set (8080)
- [ ] DATABASE_URL configured
- [ ] JWT_SECRET generated (use openssl)
- [ ] BIBLE_API_KEY added (from API.Bible)
- [ ] ALLOWED_ORIGINS includes frontend URL

### **Frontend (.env):**

- [ ] REACT_APP_API_URL points to backend (http://localhost:8080/api/v1)

### **Database:**

- [ ] PostgreSQL installed/running
- [ ] Database `dailybible` created
- [ ] Connection tested

### **Security:**

- [ ] .env files in .gitignore
- [ ] Strong JWT secret generated
- [ ] No secrets in code

---

## 🧪 Testing Your Setup

### **1. Test Database Connection**

Create `backend/test_db.go`:

```go
package main

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func main() {
    // Load .env
    godotenv.Load()

    // Get database URL
    dsn := os.Getenv("DATABASE_URL")

    // Connect
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    fmt.Println("✅ Database connection successful!")

    // Test query
    var result int
    db.Raw("SELECT 1").Scan(&result)
    fmt.Println("✅ Database query successful!")
}
```

**Run test:**

```bash
cd backend
go run test_db.go
```

**Expected output:**

```
✅ Database connection successful!
✅ Database query successful!
```

---

### **2. Test Bible API Key**

Create `backend/test_bible_api.go`:

```go
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"

    "github.com/joho/godotenv"
)

func main() {
    // Load .env
    godotenv.Load()

    // Get API key
    apiKey := os.Getenv("BIBLE_API_KEY")
    if apiKey == "" {
        log.Fatal("BIBLE_API_KEY not set in .env")
    }

    // Test API call
    url := "https://api.scripture.api.bible/v1/bibles"

    req, _ := http.NewRequest("GET", url, nil)
    req.Header.Set("api-key", apiKey)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        log.Fatal("API request failed:", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != 200 {
        body, _ := io.ReadAll(resp.Body)
        log.Fatal("API returned error:", string(body))
    }

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)

    fmt.Println("✅ Bible API connection successful!")
    fmt.Printf("✅ Found %v Bible translations available\n", len(result["data"].([]interface{})))
}
```

**Run test:**

```bash
cd backend
go run test_bible_api.go
```

**Expected output:**

```
✅ Bible API connection successful!
✅ Found 20+ Bible translations available
```

---

## 🚀 Next Steps After Setup

Once your environment is configured:

1. **Verify all tests pass:**

   - Database connection ✅
   - Bible API connection ✅

2. **Start building:**

   - Create database models
   - Setup GORM connection in main.go
   - Create first endpoint (health check)

3. **Run the backend:**

   ```bash
   cd backend
   go run cmd/api/main.go
   ```

4. **Test with cURL:**
   ```bash
   curl http://localhost:8080/health
   ```

---

## 📚 Reference: Environment Variable Usage in Code

### **Loading Environment Variables:**

```go
package main

import (
    "log"
    "os"

    "github.com/joho/godotenv"
)

func main() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    // Access variables
    port := os.Getenv("PORT")
    dbURL := os.Getenv("DATABASE_URL")
    jwtSecret := os.Getenv("JWT_SECRET")
    bibleAPIKey := os.Getenv("BIBLE_API_KEY")

    // Use variables...
}
```

### **Configuration Struct (Recommended):**

```go
package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    Port            string
    DatabaseURL     string
    JWTSecret       string
    BibleAPIKey     string
    BibleAPIBaseURL string
    AllowedOrigins  string
}

func Load() (*Config, error) {
    godotenv.Load()

    return &Config{
        Port:            getEnv("PORT", "8080"),
        DatabaseURL:     os.Getenv("DATABASE_URL"),
        JWTSecret:       os.Getenv("JWT_SECRET"),
        BibleAPIKey:     os.Getenv("BIBLE_API_KEY"),
        BibleAPIBaseURL: getEnv("BIBLE_API_BASE_URL", "https://api.scripture.api.bible/v1"),
        AllowedOrigins:  getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
    }, nil
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

---

## ✅ Setup Complete Checklist

Before moving to GORM connection:

- [ ] `backend/.env` file created
- [ ] Bible API key added to .env
- [ ] Database URL configured in .env
- [ ] JWT secret generated and added
- [ ] PostgreSQL running (local or Docker)
- [ ] Database `dailybible` created
- [ ] `frontend/.env` file created
- [ ] API URL configured in frontend .env
- [ ] .gitignore updated to exclude .env files
- [ ] Database connection test passes
- [ ] Bible API test passes

**Once complete, you're ready to setup GORM connection!**

---

**Status:** ✅ Environment Setup Guide Complete  
**Next:** Setup GORM database connection in backend
