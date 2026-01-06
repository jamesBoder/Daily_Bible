# Week 1: HTTP Server & Gin Setup - Step-by-Step Plan

**Goal:** Transform your backend into a working HTTP server with Gin framework  
**Timeline:** 20-25 hours over 7 days  
**Prerequisites:** ✅ Database working, ✅ Backend compiles, ✅ GORM configured

---

## 📋 Overview

By the end of Week 1, you will have:

- ✅ Gin framework installed and configured
- ✅ HTTP server running on port 8080
- ✅ Health check endpoint working
- ✅ CORS middleware configured
- ✅ Logging middleware implemented
- ✅ Error handling middleware
- ✅ Route structure organized
- ✅ All routes documented

---

## 🎯 Day 1-2: Install Gin & Create Basic Server (6-8 hours)

### **Step 1: Install Gin Framework (15 minutes)**

**Commands to run:**

```bash
cd go_proj/Daily_Bible/backend
go get -u github.com/gin-gonic/gin
go get -u github.com/gin-contrib/cors
go mod tidy
```

**Verify installation:**

```bash
go list -m github.com/gin-gonic/gin
# Should show: github.com/gin-gonic/gin v1.x.x
```

**What this does:**

- Downloads Gin HTTP framework
- Downloads CORS middleware package
- Updates go.mod and go.sum files

---

### **Step 2: Update cmd/api/main.go (2-3 hours)**

**Current state:** Your main.go probably has database initialization code

**What to change:**

1. Keep database initialization
2. Add Gin router setup
3. Add health check endpoint
4. Start HTTP server
5. Add graceful shutdown

**Key changes needed:**

- Import `"github.com/gin-gonic/gin"`
- Create router: `router := gin.Default()`
- Add health endpoint: `router.GET("/health", healthHandler)`
- Start server: `router.Run(":8080")`

**File structure:**

```
cmd/api/main.go should have:
- func main()
  - Load environment variables
  - Initialize database
  - Create Gin router
  - Register routes
  - Start server
- func healthHandler()
  - Return {"status": "ok"}
```

---

### **Step 3: Create Health Check Handler (30 minutes)**

**What to create:**

- Simple handler that returns JSON
- Checks database connection
- Returns server status

**Response format:**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Why this matters:**

- Proves server is running
- Verifies database connection
- Used for monitoring/health checks

---

### **Step 4: Test Basic Server (1 hour)**

**Start the server:**

```bash
cd backend
go run cmd/api/main.go
```

**Expected output:**

```
[GIN-debug] Listening and serving HTTP on :8080
```

**Test health endpoint:**

```bash
# In another terminal
curl http://localhost:8080/health
```

**Expected response:**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Troubleshooting:**

- If port 8080 is busy: Change to 8081 in code
- If database error: Check .env DATABASE_URL
- If Gin not found: Run `go mod tidy`

---

### **Step 5: Add Graceful Shutdown (1-2 hours)**

**What to add:**

- Signal handling (SIGINT, SIGTERM)
- Close database connections
- Finish pending requests
- Clean shutdown

**Why this matters:**

- Prevents data corruption
- Completes in-flight requests
- Professional production practice

**Test shutdown:**

```bash
# Start server
go run cmd/api/main.go

# Press Ctrl+C
# Should see: "Shutting down server..."
# Should see: "Server stopped gracefully"
```

---

## 🎯 Day 3-4: Add Middleware (6-8 hours)

### **Step 6: Add CORS Middleware (1-2 hours)**

**Why CORS is needed:**

- Your React frontend will run on different port (3000)
- Backend runs on port 8080
- Browser blocks cross-origin requests by default
- CORS middleware allows frontend to call backend

**What to configure:**

```go
import "github.com/gin-contrib/cors"

config := cors.DefaultConfig()
config.AllowOrigins = []string{"http://localhost:3000"}
config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE"}
config.AllowHeaders = []string{"Authorization", "Content-Type"}
router.Use(cors.New(config))
```

**Test CORS:**

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     http://localhost:8080/health
```

**Expected response headers:**

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

### **Step 7: Add Logging Middleware (2-3 hours)**

**What to log:**

- Request method (GET, POST, etc.)
- Request path (/api/verses/daily)
- Response status code (200, 404, 500)
- Response time (123ms)
- Request ID (for tracing)

**Create file:** `internal/middleware/logger.go`

**What it should do:**

- Log every incoming request
- Log response status and time
- Use structured logging (JSON format)
- Include request ID

**Example log output:**

```json
{
  "time": "2024-01-15T10:30:00Z",
  "method": "GET",
  "path": "/api/verses/daily",
  "status": 200,
  "duration": "123ms",
  "request_id": "abc-123-def"
}
```

**Test logging:**

```bash
# Start server
go run cmd/api/main.go

# Make request
curl http://localhost:8080/health

# Check terminal - should see log entry
```

---

### **Step 8: Add Error Handling Middleware (2-3 hours)**

**What to handle:**

- Panics (server crashes)
- 404 Not Found errors
- 500 Internal Server errors
- Validation errors
- Database errors

**Create file:** `internal/middleware/error_handler.go`

**What it should do:**

- Catch panics and recover
- Return consistent error format
- Log errors for debugging
- Don't expose internal details

**Error response format:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "details": "Verse with ID 999 does not exist"
  }
}
```

**Test error handling:**

```bash
# Test 404
curl http://localhost:8080/nonexistent
# Should return 404 with error JSON

# Test panic recovery (add test endpoint that panics)
curl http://localhost:8080/test-panic
# Should return 500 with error JSON, server stays running
```

---

## 🎯 Day 5-7: Structure Routes (8-10 hours)

### **Step 9: Create Route Groups (2-3 hours)**

**What to organize:**

```
/api/v1
  /auth
    POST /register
    POST /login
    POST /logout
    GET  /me
  /verses
    GET  /daily
    GET  /:reference
    GET  /search
  /favorites
    GET    /
    POST   /
    DELETE /:id
  /history
    GET    /
    DELETE /
```

**Create file:** `internal/routes/routes.go`

**What it should do:**

- Group related routes together
- Apply middleware to groups
- Keep main.go clean
- Make routes easy to find

**Example structure:**

```go
func SetupRoutes(router *gin.Engine) {
    api := router.Group("/api/v1")
    {
        // Auth routes
        auth := api.Group("/auth")
        {
            auth.POST("/register", handlers.Register)
            auth.POST("/login", handlers.Login)
            auth.POST("/logout", handlers.Logout)
            auth.GET("/me", handlers.GetMe)
        }

        // Verse routes
        verses := api.Group("/verses")
        {
            verses.GET("/daily", handlers.GetDailyVerse)
            verses.GET("/:reference", handlers.GetVerse)
            verses.GET("/search", handlers.SearchVerses)
        }

        // Protected routes (require auth)
        protected := api.Group("/")
        protected.Use(middleware.AuthRequired())
        {
            // Favorites
            favorites := protected.Group("/favorites")
            {
                favorites.GET("/", handlers.ListFavorites)
                favorites.POST("/", handlers.AddFavorite)
                favorites.DELETE("/:id", handlers.RemoveFavorite)
            }

            // History
            history := protected.Group("/history")
            {
                history.GET("/", handlers.ListHistory)
                history.DELETE("/", handlers.ClearHistory)
            }
        }
    }
}
```

---

### **Step 10: Create Placeholder Handlers (3-4 hours)**

**For each route, create a simple handler that:**

- Returns success message
- Shows route is working
- Doesn't implement full logic yet

**Example placeholder:**

```go
func GetDailyVerse(c *gin.Context) {
    c.JSON(200, gin.H{
        "message": "Daily verse endpoint - coming soon",
        "route": "/api/v1/verses/daily",
    })
}
```

**Create these files:**

- `internal/handlers/auth.go` - Auth handlers
- `internal/handlers/verses.go` - Verse handlers
- `internal/handlers/favorites.go` - Favorites handlers
- `internal/handlers/history.go` - History handlers

**Test each placeholder:**

```bash
# Test auth routes
curl -X POST http://localhost:8080/api/v1/auth/register
curl -X POST http://localhost:8080/api/v1/auth/login

# Test verse routes
curl http://localhost:8080/api/v1/verses/daily
curl http://localhost:8080/api/v1/verses/John%203:16

# Test favorites (will fail - needs auth)
curl http://localhost:8080/api/v1/favorites
```

---

### **Step 11: Document All Routes (2-3 hours)**

**Create file:** `docs/API_ROUTES.md`

**Document each route with:**

- HTTP method
- Path
- Description
- Request body (if any)
- Response format
- Authentication required?
- Example curl command

**Example documentation:**

````markdown
### GET /api/v1/verses/daily

**Description:** Get the verse of the day

**Authentication:** Not required

**Response:**

```json
{
  "verse": {
    "id": 1,
    "reference": "John 3:16",
    "text": "For God so loved the world...",
    "translation": "KJV"
  }
}
```
````

**Example:**

```bash
curl http://localhost:8080/api/v1/verses/daily
```

````

---

### **Step 12: Test All Routes (1-2 hours)**

**Create test script:** `scripts/test_routes.sh`

**Test each route:**
```bash
#!/bin/bash

echo "Testing health endpoint..."
curl http://localhost:8080/health

echo "\nTesting auth routes..."
curl -X POST http://localhost:8080/api/v1/auth/register
curl -X POST http://localhost:8080/api/v1/auth/login

echo "\nTesting verse routes..."
curl http://localhost:8080/api/v1/verses/daily
curl http://localhost:8080/api/v1/verses/John%203:16

echo "\nTesting favorites routes..."
curl http://localhost:8080/api/v1/favorites

echo "\nAll tests complete!"
````

**Run tests:**

```bash
chmod +x scripts/test_routes.sh
./scripts/test_routes.sh
```

---

## ✅ Week 1 Completion Checklist

**By end of Day 2:**

- [ ] Gin framework installed
- [ ] Basic HTTP server running
- [ ] Health check endpoint working
- [ ] Server starts without errors
- [ ] Graceful shutdown implemented

**By end of Day 4:**

- [ ] CORS middleware configured
- [ ] Logging middleware working
- [ ] Error handling middleware implemented
- [ ] All middleware tested

**By end of Day 7:**

- [ ] All route groups created
- [ ] Placeholder handlers for all routes
- [ ] Routes documented in API_ROUTES.md
- [ ] All routes tested with curl
- [ ] Code committed to GitHub

---

## 🎯 Success Criteria

**Your server should:**

- ✅ Start without errors
- ✅ Respond to health check
- ✅ Log all requests
- ✅ Handle errors gracefully
- ✅ Support CORS for frontend
- ✅ Have all routes defined
- ✅ Return placeholder responses

**You should be able to:**

- ✅ Start server with `go run cmd/api/main.go`
- ✅ Test health with `curl http://localhost:8080/health`
- ✅ See logs in terminal
- ✅ Test all routes with curl
- ✅ Stop server gracefully with Ctrl+C

---

## 📊 Time Breakdown

**Day 1-2: Basic Server (6-8 hours)**

- Install Gin: 15 min
- Update main.go: 2-3 hours
- Create health handler: 30 min
- Test server: 1 hour
- Add graceful shutdown: 1-2 hours

**Day 3-4: Middleware (6-8 hours)**

- CORS middleware: 1-2 hours
- Logging middleware: 2-3 hours
- Error handling: 2-3 hours

**Day 5-7: Routes (8-10 hours)**

- Create route groups: 2-3 hours
- Create placeholder handlers: 3-4 hours
- Document routes: 2-3 hours
- Test all routes: 1-2 hours

**Total: 20-26 hours**

---

## 🚀 Getting Started

**Right now, start with:**

1. **Install Gin** (15 minutes)

```bash
cd go_proj/Daily_Bible/backend
go get -u github.com/gin-gonic/gin
go get -u github.com/gin-contrib/cors
go mod tidy
```

2. **Backup current main.go**

```bash
cp cmd/api/main.go cmd/api/main.go.backup
```

3. **Start modifying main.go**

- Add Gin imports
- Create router
- Add health endpoint
- Test it works

**First milestone:** Get health check working (2-3 hours)

---

## 💡 Pro Tips

**Development Tips:**

- Work in small steps
- Test after each change
- Commit working code often
- Use Postman for testing (easier than curl)
- Keep terminal open to see logs

**Common Issues:**

- Port already in use: Change to 8081
- CORS errors: Check AllowOrigins config
- Routes not found: Check route registration
- Middleware not working: Check order of Use()

**Best Practices:**

- Keep handlers thin (logic in services)
- Use consistent error responses
- Log important events
- Document as you go
- Test each route

---

## 📚 Resources

**Gin Documentation:**

- Official docs: https://gin-gonic.com/docs/
- Examples: https://github.com/gin-gonic/examples
- Middleware: https://github.com/gin-gonic/contrib

**Tutorials:**

- Gin quickstart: https://gin-gonic.com/docs/quickstart/
- Building REST API with Gin (YouTube)
- Gin middleware tutorial (YouTube)

**Tools:**

- Postman: For testing API endpoints
- curl: Command-line testing
- httpie: Better curl alternative

---

## 🎓 What You'll Learn

**By completing Week 1, you'll understand:**

- How to set up HTTP server with Gin
- How middleware works
- How to structure routes
- How to handle errors
- How to add CORS
- How to log requests
- How to test endpoints

**Skills gained:**

- HTTP server development
- REST API design
- Middleware patterns
- Error handling
- Testing APIs

---

## ✅ Ready to Start?

**Your first task today:**

Install Gin and get a basic health check endpoint working. This proves your server can handle HTTP requests.

**Time estimate:** 2-3 hours  
**Difficulty:** Easy  
**Reward:** Working HTTP server! 🎉

**Start with Step 1 and work through each step sequentially. Test after each step to ensure everything works before moving forward.**

Good luck! 🚀
