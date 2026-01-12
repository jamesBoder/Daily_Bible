# Week 3: Verse Endpoints & Bible API Integration

**Goal:** Implement verse-related endpoints with Bible API integration and caching

**Timeline:** 5-6 days (20-25 hours)  
**Status:** 📋 Ready to Start

---

## 🎯 Week 3 Overview

### **What We're Building:**
1. Bible API integration (API.Bible)
2. Daily verse endpoint with rotation logic
3. Get verse by reference endpoint
4. Search verses functionality
5. Verse caching system
6. Error handling for API failures

### **What You Already Have:**
- ✅ GORM Verse model with relationships
- ✅ Verse repository with CRUD operations
- ✅ Authentication system working
- ✅ Protected routes infrastructure

### **By End of Week 3:**
- ✅ Bible API integrated and working
- ✅ Daily verse endpoint returning verses
- ✅ Verse lookup by reference working
- ✅ Search functionality implemented
- ✅ Caching reducing API calls
- ✅ Graceful error handling

---

## 📅 Week 3 Schedule

### **Day 1: Bible API Setup & Integration (4-5 hours)**
- Step 1: Bible API Account Setup (30 minutes)
- Step 2: Create Bible API Service (2-3 hours)
- Step 3: Environment Configuration (30 minutes)
- Step 4: API Response Models (1 hour)

### **Day 2: Daily Verse Endpoint (4-5 hours)**
- Step 5: Daily Verse Logic (2-3 hours)
- Step 6: Daily Verse Handler (1-2 hours)
- Step 7: Testing Daily Verse (1 hour)

### **Day 3: Verse by Reference Endpoint (4-5 hours)**
- Step 8: Reference Parser (2-3 hours)
- Step 9: Get Verse Handler (1-2 hours)
- Step 10: Testing Verse Lookup (1 hour)

### **Day 4: Search Verses Endpoint (4-5 hours)**
- Step 11: Search Implementation (2-3 hours)
- Step 12: Search Optimization (1-2 hours)
- Step 13: Testing Search (1 hour)

### **Day 5: Caching System (4-5 hours)**
- Step 14: Cache Strategy (2-3 hours)
- Step 15: Cache Management (1-2 hours)
- Step 16: Testing Cache (1 hour)

### **Day 6: Error Handling & Polish (3-4 hours)**
- Step 17: Error Handling (2-3 hours)
- Step 18: Integration Testing (1-2 hours)

---

## 🎯 Success Criteria

**By end of Week 3, you should be able to:**

```bash
# Get daily verse
curl http://localhost:8080/api/verses/daily

# Get specific verse
curl http://localhost:8080/api/verses/John%203:16

# Search verses
curl "http://localhost:8080/api/verses/search?q=love&limit=5"
```

---

## 📊 Week 3 Checklist

### **Day 1: Bible API Setup**
- [ ] Bible API account created and API key obtained
- [ ] Bible API service implemented
- [ ] Environment variables configured
- [ ] API response models created

### **Day 2: Daily Verse**
- [ ] Daily verse rotation logic implemented
- [ ] Daily verse handler created
- [ ] Daily verse endpoint tested

### **Day 3: Verse Lookup**
- [ ] Reference parser implemented
- [ ] Get verse by reference handler created
- [ ] Verse lookup tested with various formats

### **Day 4: Search**
- [ ] Search endpoint implemented
- [ ] Search optimized with database queries
- [ ] Search tested with various queries

### **Day 5: Caching**
- [ ] Cache strategy implemented
- [ ] Cache management and cleanup added
- [ ] Cache performance verified

### **Day 6: Polish**
- [ ] Error handling complete for all scenarios
- [ ] Integration tests passing
- [ ] Documentation updated

---

## 💡 Key Implementation Notes

### **Bible API Integration:**
- Use API.Bible (https://scripture.api.bible/)
- Free tier: 500 requests/day
- Recommended version: KJV (King James Version)
- Cache aggressively to minimize API calls

### **Caching Strategy:**
- Store fetched verses in database
- Use date-based caching for daily verse
- Cache popular verses on startup
- Implement TTL for cache expiration

### **Error Handling:**
- Handle API rate limits gracefully
- Provide fallback responses
- Log errors for monitoring
- Return user-friendly error messages

---

## 📁 New Files to Create

```
backend/
├── internal/
│   ├── services/
│   │   ├── bible_api_service.go (NEW)
│   │   ├── daily_verse_service.go (NEW)
│   │   ├── reference_parser.go (NEW)
│   │   └── verse_cache_service.go (NEW)
│   ├── handlers/
│   │   └── verses.go (NEW)
│   └── models/
│       └── bible_api.go (NEW)
└── .env (UPDATE - add Bible API config)
```

---

## 🚀 Getting Started

### **First Steps:**

1. **Sign up for Bible API:**
   - Visit https://scripture.api.bible/
   - Create free account
   - Get API key

2. **Add to .env:**
   ```env
   BIBLE_API_KEY=your-api-key-here
   BIBLE_VERSION_ID=de4e12af7f28f599-02
   ```

3. **Test API:**
   ```bash
   curl -X GET "https://api.scripture.api.bible/v1/bibles" \
     -H "api-key: YOUR_API_KEY"
   ```

4. **Start implementing services**

---

## 📚 Resources

- **Bible API Docs:** https://scripture.api.bible/livedocs
- **Correct Base URL:** `https://rest.api.bible/v1` (NOT api.scripture.api.bible)
- **Available Bible Versions:** https://rest.api.bible/v1/bibles
- **Rate Limits:** 500 requests/day (free tier)

---

## 📋 Detailed Implementation Steps

### **Step 1: Bible API Account Setup (30 minutes)**

**What You Need:**
1. Go to https://scripture.api.bible/
2. Sign up for free account
3. Verify email
4. Get API key from dashboard

**Test Your API Key:**
```bash
# Test with correct URL
curl "https://rest.api.bible/v1/bibles" \
  -H "api-key: YOUR_API_KEY"

# Should return list of 200+ Bible versions
```

**Important:** The base URL is `https://rest.api.bible/v1`, NOT `https://api.scripture.api.bible/v1`

---

### **Step 2: Create Bible API Service (2-3 hours)**

**File:** `internal/services/bible_api_service.go`

```go
package services

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

// BibleAPIService interface
type BibleAPIService interface {
    GetVerse(reference string) (*BibleAPIVerse, error)
    SearchVerses(query string, limit int) ([]BibleAPIVerse, error)
}

type bibleAPIService struct {
    apiKey      string
    bibleID     string
    baseURL     string
    httpClient  *http.Client
}

// NewBibleAPIService creates a new Bible API service
func NewBibleAPIService(apiKey, bibleID, baseURL string) BibleAPIService {
    return &bibleAPIService{
        apiKey:  apiKey,
        bibleID: bibleID,
        baseURL: baseURL,
        httpClient: &http.Client{
            Timeout: 10 * time.Second,
        },
    }
}

// BibleAPIVerse represents a verse from the API
type BibleAPIVerse struct {
    ID        string `json:"id"`
    Reference string `json:"reference"`
    Text      string `json:"text"`
    BookID    string `json:"bookId"`
    ChapterID string `json:"chapterId"`
}

// BibleAPIResponse represents the API response
type BibleAPIResponse struct {
    Data struct {
        Verses []struct {
            ID        string `json:"id"`
            OrgID     string `json:"orgId"`
            BookID    string `json:"bookId"`
            ChapterID string `json:"chapterId"`
            Text      string `json:"text"`
            Reference string `json:"reference"`
        } `json:"verses"`
    } `json:"data"`
}

// GetVerse fetches a verse by reference
func (s *bibleAPIService) GetVerse(reference string) (*BibleAPIVerse, error) {
    url := fmt.Sprintf("%s/bibles/%s/search?query=%s", 
        s.baseURL, s.bibleID, reference)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }
    
    req.Header.Set("api-key", s.apiKey)
    
    resp, err := s.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("failed to make request: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode == 429 {
        return nil, fmt.Errorf("API rate limit exceeded")
    }
    
    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("API error: %d", resp.StatusCode)
    }
    
    var apiResp BibleAPIResponse
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }
    
    if len(apiResp.Data.Verses) == 0 {
        return nil, fmt.Errorf("verse not found")
    }
    
    v := apiResp.Data.Verses[0]
    return &BibleAPIVerse{
        ID:        v.ID,
        Reference: v.Reference,
        Text:      v.Text,
        BookID:    v.BookID,
        ChapterID: v.ChapterID,
    }, nil
}

// SearchVerses searches for verses
func (s *bibleAPIService) SearchVerses(query string, limit int) ([]BibleAPIVerse, error) {
    url := fmt.Sprintf("%s/bibles/%s/search?query=%s&limit=%d", 
        s.baseURL, s.bibleID, query, limit)
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("failed to create request: %w", err)
    }
    
    req.Header.Set("api-key", s.apiKey)
    
    resp, err := s.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("failed to make request: %w", err)
    }
    defer resp.Body.Close()
    
    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("API error: %d", resp.StatusCode)
    }
    
    var apiResp BibleAPIResponse
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        return nil, fmt.Errorf("failed to decode response: %w", err)
    }
    
    verses := make([]BibleAPIVerse, 0, len(apiResp.Data.Verses))
    for _, v := range apiResp.Data.Verses {
        verses = append(verses, BibleAPIVerse{
            ID:        v.ID,
            Reference: v.Reference,
            Text:      v.Text,
            BookID:    v.BookID,
            ChapterID: v.ChapterID,
        })
    }
    
    return verses, nil
}
```

---

### **Step 3: Environment Configuration (30 minutes)**

**Update `.env` file:**
```env
# Existing variables
DATABASE_URL=postgresql://dailybible_user:test123@localhost:5432/daily_bible_dev
JWT_SECRET=your-secret-key-here

# Bible API Configuration (IMPORTANT: Use correct URL)
BIBLE_API_KEY=your-api-key-here
BIBLE_VERSION_ID=de4e12af7f28f599-02
BIBLE_API_BASE_URL=https://rest.api.bible/v1
```

**Update `internal/config/config.go`:**
```go
package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    DatabaseURL     string
    JWTSecret       string
    BibleAPIKey     string
    BibleVersionID  string
    BibleAPIBaseURL string
}

func Load() (*Config, error) {
    godotenv.Load()
    
    return &Config{
        DatabaseURL:     os.Getenv("DATABASE_URL"),
        JWTSecret:       os.Getenv("JWT_SECRET"),
        BibleAPIKey:     os.Getenv("BIBLE_API_KEY"),
        BibleVersionID:  getEnvOrDefault("BIBLE_VERSION_ID", "de4e12af7f28f599-02"),
        BibleAPIBaseURL: getEnvOrDefault("BIBLE_API_BASE_URL", "https://rest.api.bible/v1"),
    }, nil
}

func getEnvOrDefault(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

---

### **Step 4: Daily Verse Service (2-3 hours)**

**File:** `internal/services/daily_verse_service.go`

```go
package services

import (
    "crypto/md5"
    "encoding/hex"
    "fmt"
    "time"
    
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type DailyVerseService struct {
    bibleAPI     BibleAPIService
    verseRepo    repository.VerseRepository
    curatedList  []string
}

func NewDailyVerseService(
    bibleAPI BibleAPIService,
    verseRepo repository.VerseRepository,
) *DailyVerseService {
    return &DailyVerseService{
        bibleAPI:    bibleAPI,
        verseRepo:   verseRepo,
        curatedList: getCuratedVerses(),
    }
}

// GetDailyVerse returns the verse of the day
func (s *DailyVerseService) GetDailyVerse() (*models.Verse, error) {
    today := time.Now().Format("2006-01-02")
    
    // Check cache first
    cached, err := s.verseRepo.GetByDate(today)
    if err == nil && cached != nil {
        return cached, nil
    }
    
    // Select verse for today
    reference := s.selectVerseForDate(today)
    
    // Fetch from Bible API
    apiVerse, err := s.bibleAPI.GetVerse(reference)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch verse: %w", err)
    }
    
    // Convert and save
    verse := &models.Verse{
        Reference: apiVerse.Reference,
        Text:      apiVerse.Text,
        Book:      extractBook(apiVerse.Reference),
        Chapter:   extractChapter(apiVerse.Reference),
        Verse:     extractVerse(apiVerse.Reference),
        Version:   "KJV",
        DailyDate: &today,
    }
    
    if err := s.verseRepo.Create(verse); err != nil {
        return nil, fmt.Errorf("failed to save verse: %w", err)
    }
    
    return verse, nil
}

// selectVerseForDate selects a verse based on the date
func (s *DailyVerseService) selectVerseForDate(date string) string {
    hash := md5.Sum([]byte(date))
    hashStr := hex.EncodeToString(hash[:])
    
    // Convert first 8 chars of hash to number
    var num int
    fmt.Sscanf(hashStr[:8], "%x", &num)
    
    index := num % len(s.curatedList)
    return s.curatedList[index]
}

// getCuratedVerses returns a list of meaningful verses
func getCuratedVerses() []string {
    return []string{
        "John 3:16",
        "Psalm 23:1",
        "Proverbs 3:5-6",
        "Romans 8:28",
        "Philippians 4:13",
        "Jeremiah 29:11",
        "Matthew 6:33",
        "Isaiah 41:10",
        "2 Timothy 1:7",
        "Joshua 1:9",
        "Psalm 46:1",
        "Romans 12:2",
        "1 Corinthians 13:4-7",
        "Galatians 5:22-23",
        "Ephesians 2:8-9",
        "Colossians 3:23",
        "Hebrews 11:1",
        "James 1:2-3",
        "1 Peter 5:7",
        "1 John 4:19",
        // Add more verses for variety
    }
}

// Helper functions to extract book, chapter, verse
func extractBook(reference string) string {
    // Simple implementation - can be improved
    parts := strings.Split(reference, " ")
    if len(parts) >= 2 {
        return strings.Join(parts[:len(parts)-1], " ")
    }
    return reference
}

func extractChapter(reference string) int {
    // Extract chapter number from reference like "John 3:16"
    parts := strings.Split(reference, " ")
    if len(parts) < 2 {
        return 0
    }
    
    chapterVerse := parts[len(parts)-1]
    cvParts := strings.Split(chapterVerse, ":")
    if len(cvParts) < 1 {
        return 0
    }
    
    chapter, _ := strconv.Atoi(cvParts[0])
    return chapter
}

func extractVerse(reference string) int {
    // Extract verse number from reference like "John 3:16"
    parts := strings.Split(reference, ":")
    if len(parts) < 2 {
        return 0
    }
    
    verse, _ := strconv.Atoi(parts[1])
    return verse
}
```

---

### **Step 5: Verses Handler (1-2 hours)**

**File:** `internal/handlers/verses.go`

```go
package handlers

import (
    "net/http"
    "strconv"
    
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

type VersesHandler struct {
    dailyVerseService *services.DailyVerseService
    bibleAPIService   services.BibleAPIService
}

func NewVersesHandler(
    dailyVerseService *services.DailyVerseService,
    bibleAPIService services.BibleAPIService,
) *VersesHandler {
    return &VersesHandler{
        dailyVerseService: dailyVerseService,
        bibleAPIService:   bibleAPIService,
    }
}

// GetDailyVerse returns the verse of the day
func (h *VersesHandler) GetDailyVerse(c *gin.Context) {
    verse, err := h.dailyVerseService.GetDailyVerse()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch daily verse",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "verse": gin.H{
            "id":        verse.ID,
            "reference": verse.Reference,
            "text":      verse.Text,
            "book":      verse.Book,
            "chapter":   verse.Chapter,
            "verse":     verse.Verse,
            "version":   verse.Version,
        },
    })
}

// GetVerseByReference returns a specific verse
func (h *VersesHandler) GetVerseByReference(c *gin.Context) {
    reference := c.Param("reference")
    
    if reference == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Reference is required",
        })
        return
    }
    
    apiVerse, err := h.bibleAPIService.GetVerse(reference)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{
            "error": "Verse not found",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "verse": gin.H{
            "reference": apiVerse.Reference,
            "text":      apiVerse.Text,
        },
    })
}

// SearchVerses searches for verses
func (h *VersesHandler) SearchVerses(c *gin.Context) {
    query := c.Query("q")
    if query == "" {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Search query required",
        })
        return
    }
    
    limit := 10
    if l := c.Query("limit"); l != "" {
        limit, _ = strconv.Atoi(l)
    }
    
    verses, err := h.bibleAPIService.SearchVerses(query, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Search failed",
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "verses": verses,
        "count":  len(verses),
    })
}
```

---

### **Step 6: Update Routes (30 minutes)**

**Update `internal/routes/routes.go`:**

```go
// Add to your routes setup
verses := api.Group("/verses")
{
    verses.GET("/daily", versesHandler.GetDailyVerse)
    verses.GET("/:reference", versesHandler.GetVerseByReference)
    verses.GET("/search", versesHandler.SearchVerses)
}
```

---

### **Step 7: Update main.go (30 minutes)**

**Update `cmd/api/main.go`:**

```go
// Initialize Bible API service
bibleAPIService := services.NewBibleAPIService(
    cfg.BibleAPIKey,
    cfg.BibleVersionID,
    cfg.BibleAPIBaseURL,
)

// Initialize Daily Verse service
dailyVerseService := services.NewDailyVerseService(
    bibleAPIService,
    verseRepo,
)

// Initialize Verses handler
versesHandler := handlers.NewVersesHandler(
    dailyVerseService,
    bibleAPIService,
)

// Pass to routes
routes.SetupRoutes(router, authHandler, versesHandler, ...)
```

---

### **Step 8: Update Verse Model (if needed)**

**Update `internal/models/verse.go`:**

```go
type Verse struct {
    ID        uint           `gorm:"primaryKey" json:"id"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
    
    Reference string  `gorm:"uniqueIndex;not null" json:"reference"`
    Text      string  `gorm:"type:text;not null" json:"text"`
    Book      string  `gorm:"size:50" json:"book"`
    Chapter   int     `json:"chapter"`
    Verse     int     `json:"verse"`
    Version   string  `gorm:"size:20" json:"version"`
    DailyDate *string `gorm:"index" json:"daily_date,omitempty"`
    
    // Relationships
    Favorites []Favorite `gorm:"foreignKey:VerseID" json:"favorites,omitempty"`
    History   []History  `gorm:"foreignKey:VerseID" json:"history,omitempty"`
}
```

---

### **Step 9: Update Verse Repository (if needed)**

**Add to `internal/repository/verse_repository.go`:**

```go
// GetByDate gets verse by daily date
func (r *verseRepository) GetByDate(date string) (*models.Verse, error) {
    var verse models.Verse
    err := r.db.Where("daily_date = ?", date).First(&verse).Error
    if err == gorm.ErrRecordNotFound {
        return nil, nil
    }
    return &verse, err
}
```

---

## 🧪 Testing Your Implementation

### **Test 1: Daily Verse**
```bash
curl http://localhost:8080/api/verses/daily
```

**Expected Response:**
```json
{
  "verse": {
    "id": 1,
    "reference": "John 3:16",
    "text": "For God so loved the world...",
    "book": "John",
    "chapter": 3,
    "verse": 16,
    "version": "KJV"
  }
}
```

### **Test 2: Verse by Reference**
```bash
curl "http://localhost:8080/api/verses/John%203:16"
```

### **Test 3: Search Verses**
```bash
curl "http://localhost:8080/api/verses/search?q=love&limit=5"
```

---

## 🎯 Success Checklist

- [ ] Bible API service created and working
- [ ] Daily verse endpoint returns consistent verse per day
- [ ] Verse lookup by reference works
- [ ] Search functionality works
- [ ] Verses are cached in database
- [ ] Error handling works for invalid references
- [ ] All tests passing

---

**Status:** 📋 Ready to Start  
**Estimated Time:** 20-25 hours  
**Target Completion:** End of Week 3

**Previous Week:** ✅ Week 2 Complete (Authentication & Repository Layer)  
**Next Week:** Week 4 (Favorites & History Features)
