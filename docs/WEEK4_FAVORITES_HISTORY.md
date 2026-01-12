# Week 4: Favorites & History Features

**Goal:** Implement user favorites and verse history tracking with full CRUD operations

**Timeline:** 5-6 days (20-25 hours)  
**Status:** 📋 Ready to Start

---

## 🎯 Week 4 Overview

### **What We're Building:**
1. Favorites system (save, view, remove favorite verses)
2. History tracking (automatic verse view tracking)
3. User-specific data management
4. Protected endpoints with authentication
5. Pagination for lists
6. Search/filter functionality

### **What You Already Have:**
- ✅ GORM models for Favorite and History
- ✅ Repository layer with CRUD operations
- ✅ Authentication middleware working
- ✅ Protected routes infrastructure
- ✅ Verse endpoints fully functional
- ✅ User authentication system

### **By End of Week 4:**
- ✅ Users can save favorite verses
- ✅ Users can view their favorites list
- ✅ Users can remove favorites
- ✅ Verse views are automatically tracked
- ✅ Users can view their history
- ✅ Users can clear history
- ✅ All endpoints properly authenticated
- ✅ Pagination working for large lists

---

## 📅 Week 4 Schedule

### **Day 1: Favorites Repository & Service (4-5 hours)**
- Step 1: Implement Favorite Repository (2 hours)
- Step 2: Implement Favorite Service (2-3 hours)

### **Day 2: Favorites Handlers & Routes (4-5 hours)**
- Step 3: Implement Favorites Handlers (2-3 hours)
- Step 4: Update Routes & Test Favorites (2 hours)

### **Day 3: History Repository & Service (4-5 hours)**
- Step 5: Implement History Repository (2 hours)
- Step 6: Implement History Service (2-3 hours)

### **Day 4: History Handlers & Auto-Tracking (4-5 hours)**
- Step 7: Implement History Handlers (2 hours)
- Step 8: Add Auto-Tracking to Verse Endpoints (2-3 hours)

### **Day 5: Pagination & Filtering (4-5 hours)**
- Step 9: Add Pagination Support (2-3 hours)
- Step 10: Add Search/Filter Functionality (2 hours)

### **Day 6: Testing & Polish (3-4 hours)**
- Step 11: Integration Testing (2 hours)
- Step 12: Error Handling & Edge Cases (1-2 hours)

---

## 🎯 Success Criteria

**By end of Week 4, you should be able to:**

```bash
# Favorites
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/favorites
curl -X POST -H "Authorization: Bearer $TOKEN" -d '{"verse_id": 1}' http://localhost:8080/api/favorites
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/favorites/1

# History
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/history
curl -X DELETE -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/history
```

---

## 📊 Week 4 Detailed Implementation Plan

### **Day 1: Favorites Repository & Service**

#### **Step 1: Implement Favorite Repository (2 hours)**

**File:** `internal/repository/favorite_repository.go`

**Current Status:** Basic interface exists, needs implementation

**What to Implement:**
```go
package repository

import (
    "dailybible/internal/models"
    "gorm.io/gorm"
)

type FavoriteRepository interface {
    Create(favorite *models.Favorite) error
    GetByID(id uint) (*models.Favorite, error)
    GetByUserID(userID uint) ([]models.Favorite, error)
    GetByUserIDPaginated(userID uint, limit, offset int) ([]models.Favorite, int64, error)
    Delete(id uint) error
    DeleteByUserAndVerse(userID, verseID uint) error
    Exists(userID, verseID uint) (bool, error)
}

type favoriteRepository struct {
    db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) FavoriteRepository {
    return &favoriteRepository{db: db}
}

// Create adds a new favorite
func (r *favoriteRepository) Create(favorite *models.Favorite) error {
    return r.db.Create(favorite).Error
}

// GetByID retrieves a favorite by ID
func (r *favoriteRepository) GetByID(id uint) (*models.Favorite, error) {
    var favorite models.Favorite
    err := r.db.Preload("Verse").First(&favorite, id).Error
    if err != nil {
        return nil, err
    }
    return &favorite, nil
}

// GetByUserID retrieves all favorites for a user
func (r *favoriteRepository) GetByUserID(userID uint) ([]models.Favorite, error) {
    var favorites []models.Favorite
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("created_at DESC").
        Find(&favorites).Error
    return favorites, err
}

// GetByUserIDPaginated retrieves favorites with pagination
func (r *favoriteRepository) GetByUserIDPaginated(userID uint, limit, offset int) ([]models.Favorite, int64, error) {
    var favorites []models.Favorite
    var total int64
    
    // Get total count
    r.db.Model(&models.Favorite{}).Where("user_id = ?", userID).Count(&total)
    
    // Get paginated results
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&favorites).Error
    
    return favorites, total, err
}

// Delete removes a favorite by ID
func (r *favoriteRepository) Delete(id uint) error {
    return r.db.Delete(&models.Favorite{}, id).Error
}

// DeleteByUserAndVerse removes a favorite by user and verse
func (r *favoriteRepository) DeleteByUserAndVerse(userID, verseID uint) error {
    return r.db.Where("user_id = ? AND verse_id = ?", userID, verseID).
        Delete(&models.Favorite{}).Error
}

// Exists checks if a favorite exists
func (r *favoriteRepository) Exists(userID, verseID uint) (bool, error) {
    var count int64
    err := r.db.Model(&models.Favorite{}).
        Where("user_id = ? AND verse_id = ?", userID, verseID).
        Count(&count).Error
    return count > 0, err
}
```

**Testing:**
- Test Create with valid data
- Test GetByUserID returns correct favorites
- Test Exists returns true/false correctly
- Test Delete removes favorite

---

#### **Step 2: Implement Favorite Service (2-3 hours)**

**File:** `internal/services/favorite_service.go`

**Current Status:** Has TODO stubs, needs full implementation

**What to Implement:**
```go
package services

import (
    "errors"
    "fmt"
    
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type FavoriteService struct {
    favoriteRepo repository.FavoriteRepository
    verseRepo    repository.VerseRepository
}

func NewFavoriteService(
    favoriteRepo repository.FavoriteRepository,
    verseRepo repository.VerseRepository,
) *FavoriteService {
    return &FavoriteService{
        favoriteRepo: favoriteRepo,
        verseRepo:    verseRepo,
    }
}

// GetUserFavorites retrieves all favorites for a user
func (s *FavoriteService) GetUserFavorites(userID uint) ([]models.Favorite, error) {
    return s.favoriteRepo.GetByUserID(userID)
}

// GetUserFavoritesPaginated retrieves favorites with pagination
func (s *FavoriteService) GetUserFavoritesPaginated(userID uint, page, pageSize int) ([]models.Favorite, int64, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20 // Default page size
    }
    
    offset := (page - 1) * pageSize
    return s.favoriteRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

// AddFavorite adds a verse to user's favorites
func (s *FavoriteService) AddFavorite(userID, verseID uint) error {
    // Check if verse exists
    verse, err := s.verseRepo.GetByID(verseID)
    if err != nil {
        return fmt.Errorf("verse not found: %w", err)
    }
    if verse == nil {
        return errors.New("verse not found")
    }
    
    // Check if already favorited
    exists, err := s.favoriteRepo.Exists(userID, verseID)
    if err != nil {
        return fmt.Errorf("failed to check favorite: %w", err)
    }
    if exists {
        return errors.New("verse already in favorites")
    }
    
    // Create favorite
    favorite := &models.Favorite{
        UserID:  userID,
        VerseID: verseID,
    }
    
    return s.favoriteRepo.Create(favorite)
}

// RemoveFavorite removes a verse from user's favorites
func (s *FavoriteService) RemoveFavorite(userID, favoriteID uint) error {
    // Get favorite to verify ownership
    favorite, err := s.favoriteRepo.GetByID(favoriteID)
    if err != nil {
        return fmt.Errorf("favorite not found: %w", err)
    }
    
    // Verify user owns this favorite
    if favorite.UserID != userID {
        return errors.New("unauthorized: favorite belongs to another user")
    }
    
    return s.favoriteRepo.Delete(favoriteID)
}

// RemoveFavoriteByVerse removes a favorite by verse ID
func (s *FavoriteService) RemoveFavoriteByVerse(userID, verseID uint) error {
    return s.favoriteRepo.DeleteByUserAndVerse(userID, verseID)
}

// IsFavorited checks if a verse is favorited by user
func (s *FavoriteService) IsFavorited(userID, verseID uint) (bool, error) {
    return s.favoriteRepo.Exists(userID, verseID)
}
```

**Business Logic:**
- Validate verse exists before adding to favorites
- Prevent duplicate favorites
- Verify user ownership before deletion
- Handle pagination properly

---

### **Day 2: Favorites Handlers & Routes**

#### **Step 3: Implement Favorites Handlers (2-3 hours)**

**File:** `internal/handlers/favorites.go`

**Current Status:** Has placeholder implementations

**What to Implement:**
```go
package handlers

import (
    "net/http"
    "strconv"
    
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

type FavoriteHandler struct {
    favoriteService *services.FavoriteService
}

func NewFavoriteHandler(favoriteService *services.FavoriteService) *FavoriteHandler {
    return &FavoriteHandler{
        favoriteService: favoriteService,
    }
}

// GetFavorites retrieves user's favorites
func (h *FavoriteHandler) GetFavorites(c *gin.Context) {
    // Get user ID from context (set by auth middleware)
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Get pagination parameters
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
    
    // Get favorites
    favorites, total, err := h.favoriteService.GetUserFavoritesPaginated(
        userID.(uint),
        page,
        pageSize,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
        return
    }
    
    // Calculate pagination metadata
    totalPages := (int(total) + pageSize - 1) / pageSize
    
    c.JSON(http.StatusOK, gin.H{
        "favorites": favorites,
        "pagination": gin.H{
            "page":        page,
            "page_size":   pageSize,
            "total":       total,
            "total_pages": totalPages,
        },
    })
}

// AddFavorite adds a verse to favorites
func (h *FavoriteHandler) AddFavorite(c *gin.Context) {
    // Get user ID from context
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Parse request body
    var req struct {
        VerseID uint `json:"verse_id" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
        return
    }
    
    // Add favorite
    err := h.favoriteService.AddFavorite(userID.(uint), req.VerseID)
    if err != nil {
        if err.Error() == "verse already in favorites" {
            c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add favorite"})
        return
    }
    
    c.JSON(http.StatusCreated, gin.H{"message": "Favorite added successfully"})
}

// RemoveFavorite removes a verse from favorites
func (h *FavoriteHandler) RemoveFavorite(c *gin.Context) {
    // Get user ID from context
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Get favorite ID from URL
    favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid favorite ID"})
        return
    }
    
    // Remove favorite
    err = h.favoriteService.RemoveFavorite(userID.(uint), uint(favoriteID))
    if err != nil {
        if err.Error() == "unauthorized: favorite belongs to another user" {
            c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove favorite"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Favorite removed successfully"})
}
```

**Key Features:**
- Extract user ID from auth middleware context
- Implement pagination for favorites list
- Validate request data
- Handle duplicate favorites gracefully
- Verify user ownership before deletion

---

#### **Step 4: Update Routes & Test (2 hours)**

**Update:** `internal/routes/routes.go`

```go
// Update the favorites routes section
favorites := protected.Group("/favorites")
{
    favorites.GET("/", favoriteHandler.GetFavorites)
    favorites.POST("/", favoriteHandler.AddFavorite)
    favorites.DELETE("/:id", favoriteHandler.RemoveFavorite)
}
```

**Update:** `cmd/api/main.go`

```go
// Initialize favorite handler
favoriteHandler := handlers.NewFavoriteHandler(favoriteService)

// Pass to routes
routes.SetupRoutes(router, authHandler, tokenService, verseHandler, favoriteHandler)
```

**Testing:**
```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | jq -r '.token')

# Get favorites (should be empty initially)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/favorites

# Add a favorite (use verse ID from daily verse)
curl -X POST http://localhost:8080/api/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"verse_id": 1}'

# Get favorites again (should show the added verse)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/favorites

# Remove favorite
curl -X DELETE http://localhost:8080/api/favorites/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

### **Day 3: History Repository & Service**

#### **Step 5: Implement History Repository (2 hours)**

**File:** `internal/repository/history_repository.go`

```go
package repository

import (
    "time"
    "dailybible/internal/models"
    "gorm.io/gorm"
)

type HistoryRepository interface {
    Create(history *models.History) error
    GetByUserID(userID uint) ([]models.History, error)
    GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error)
    DeleteByUserID(userID uint) error
    DeleteOlderThan(userID uint, date time.Time) error
}

type historyRepository struct {
    db *gorm.DB
}

func NewHistoryRepository(db *gorm.DB) HistoryRepository {
    return &historyRepository{db: db}
}

// Create adds a new history entry
func (r *historyRepository) Create(history *models.History) error {
    return r.db.Create(history).Error
}

// GetByUserID retrieves all history for a user
func (r *historyRepository) GetByUserID(userID uint) ([]models.History, error) {
    var history []models.History
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Find(&history).Error
    return history, err
}

// GetByUserIDPaginated retrieves history with pagination
func (r *historyRepository) GetByUserIDPaginated(userID uint, limit, offset int) ([]models.History, int64, error) {
    var history []models.History
    var total int64
    
    // Get total count
    r.db.Model(&models.History{}).Where("user_id = ?", userID).Count(&total)
    
    // Get paginated results
    err := r.db.Where("user_id = ?", userID).
        Preload("Verse").
        Order("viewed_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&history).Error
    
    return history, total, err
}

// DeleteByUserID clears all history for a user
func (r *historyRepository) DeleteByUserID(userID uint) error {
    return r.db.Where("user_id = ?", userID).Delete(&models.History{}).Error
}

// DeleteOlderThan removes history entries older than specified date
func (r *historyRepository) DeleteOlderThan(userID uint, date time.Time) error {
    return r.db.Where("user_id = ? AND viewed_at < ?", userID, date).
        Delete(&models.History{}).Error
}
```

---

#### **Step 6: Implement History Service (2-3 hours)**

**File:** `internal/services/history_service.go`

```go
package services

import (
    "time"
    
    "dailybible/internal/models"
    "dailybible/internal/repository"
)

type HistoryService struct {
    historyRepo repository.HistoryRepository
}

func NewHistoryService(historyRepo repository.HistoryRepository) *HistoryService {
    return &HistoryService{
        historyRepo: historyRepo,
    }
}

// GetUserHistory retrieves all history for a user
func (s *HistoryService) GetUserHistory(userID uint) ([]models.History, error) {
    return s.historyRepo.GetByUserID(userID)
}

// GetUserHistoryPaginated retrieves history with pagination
func (s *HistoryService) GetUserHistoryPaginated(userID uint, page, pageSize int) ([]models.History, int64, error) {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    
    offset := (page - 1) * pageSize
    return s.historyRepo.GetByUserIDPaginated(userID, pageSize, offset)
}

// AddToHistory records a verse view
func (s *HistoryService) AddToHistory(userID, verseID uint) error {
    history := &models.History{
        UserID:   userID,
        VerseID:  verseID,
        ViewedAt: time.Now(),
    }
    
    return s.historyRepo.Create(history)
}

// ClearHistory removes all history for a user
func (s *HistoryService) ClearHistory(userID uint) error {
    return s.historyRepo.DeleteByUserID(userID)
}

// ClearOldHistory removes history older than specified days
func (s *HistoryService) ClearOldHistory(userID uint, days int) error {
    cutoffDate := time.Now().AddDate(0, 0, -days)
    return s.historyRepo.DeleteOlderThan(userID, cutoffDate)
}
```

---

### **Day 4: History Handlers & Auto-Tracking**

#### **Step 7: Implement History Handlers (2 hours)**

**File:** `internal/handlers/history.go`

```go
package handlers

import (
    "net/http"
    "strconv"
    
    "dailybible/internal/services"
    "github.com/gin-gonic/gin"
)

type HistoryHandler struct {
    historyService *services.HistoryService
}

func NewHistoryHandler(historyService *services.HistoryService) *HistoryHandler {
    return &HistoryHandler{
        historyService: historyService,
    }
}

// GetHistory retrieves user's verse history
func (h *HistoryHandler) GetHistory(c *gin.Context) {
    // Get user ID from context
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Get pagination parameters
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
    
    // Get history
    history, total, err := h.historyService.GetUserHistoryPaginated(
        userID.(uint),
        page,
        pageSize,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get history"})
        return
    }
    
    // Calculate pagination metadata
    totalPages := (int(total) + pageSize - 1) / pageSize
    
    c.JSON(http.StatusOK, gin.H{
        "history": history,
        "pagination": gin.H{
            "page":        page,
            "page_size":   pageSize,
            "total":       total,
            "total_pages": totalPages,
        },
    })
}

// ClearHistory removes all history for user
func (h *HistoryHandler) ClearHistory(c *gin.Context) {
    // Get user ID from context
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Clear history
    err := h.historyService.ClearHistory(userID.(uint))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear history"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "History cleared successfully"})
}
```

---

#### **Step 8: Add Auto-Tracking to Verse Endpoints (2-3 hours)**

**Update:** `internal/handlers/verses.go`

Add history tracking to verse handlers:

```go
type VerseHandler struct {
    dailyVerseService *services.DailyVerseService
    bibleAPIService   services.BibleAPIService
    historyService    *services.HistoryService  // Add this
}

func NewVerseHandler(
    dailyVerseService *services.DailyVerseService,
    bibleAPIService services.BibleAPIService,
    historyService *services.HistoryService,  // Add this
) *VerseHandler {
    return &VerseHandler{
        dailyVerseService: dailyVerseService,
        bibleAPIService:   bibleAPIService,
        historyService:    historyService,  // Add this
    }
}

// Update GetDailyVerse to track history
func (h *VerseHandler) GetDailyVerse(c *gin.Context) {
    verse, err := h.dailyVerseService.GetDailyVerse()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily verse"})
        return
    }
    
    // Track in history if user is authenticated
    if userID, exists := c.Get("user_id"); exists {
        // Track asynchronously to not block response
        go h.historyService.AddToHistory(userID.(uint), verse.ID)
    }
    
    c.JSON(http.StatusOK, gin.H{
        "verse": gin.H{
            "id":        verse.ID,
            "reference": verse.Reference,
            "text":      verse.Text,
            "book":      verse.Book,
            "chapter":   verse.Chapter,
            "verse":     verse.VerseNumber,
            "version":   verse.Version,
        },
    })
}
```

**Key Points:**
- Track history asynchronously (using goroutine)
- Only track if user is authenticated
- Don't block the response waiting for history to save
- Handle errors gracefully (log but don't fail request)

---

### **Day 5: Pagination & Filtering**

#### **Step 9: Add Pagination Support (2-3 hours)**

Already implemented in repositories and services above. Now add helper utilities:

**File:** `internal/utils/pagination.go`

```go
package utils

type PaginationParams struct {
    Page     int
    PageSize int
}

type PaginationMeta struct {
    Page       int   `json:"page"`
    PageSize   int   `json:"page_size"`
    Total      int64 `json:"total"`
    TotalPages int   `json:"total_pages"`
}

func NewPaginationParams(page, pageSize int) PaginationParams {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 20
    }
    return PaginationParams{
        Page:     page,
        PageSize: pageSize,
    }
}

func CalculatePaginationMeta(page, pageSize int, total int64) PaginationMeta {
    totalPages := (int(total) + pageSize - 1) / pageSize
    return PaginationMeta{
        Page:       page,
        PageSize:   pageSize,
        Total:      total,
        TotalPages: totalPages,
    }
}
```

---

#### **Step 10: Add Search/Filter Functionality (2 hours)**

**Update Favorite Repository:**

```go
// SearchFavorites searches favorites by verse text or reference
func (r *favoriteRepository) SearchFavorites(userID uint, query string, limit, offset int) ([]models.Favorite, int64, error) {
    var favorites []models.Favorite
    var total int64
    
    // Build query
    db := r.db.Joins("JOIN verses ON verses.id = favorites.verse_id").
        Where("favorites.user_id = ?", userID)
    
    if query != "" {
        searchPattern := "%" + query + "%"
        db = db.Where("verses.text ILIKE ? OR verses.reference ILIKE ?", searchPattern, searchPattern)
    }
    
    // Get total count
    db.Model(&models.Favorite{}).Count(&total)
    
    // Get results
    err := db.Preload("Verse").
        Order("favorites.created_at DESC").
        Limit(limit).
        Offset(offset).
        Find(&favorites).Error
    
    return favorites, total, err
}
```

**Update Favorite Handler:**

```go
// GetFavorites with search support
func (h *FavoriteHandler) GetFavorites(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    // Get parameters
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
    search := c.Query("search")
    
    // Get favorites with search
    favorites, total, err := h.favoriteService.SearchFavorites(
        userID.(uint),
        search,
        page,
        pageSize,
    )
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get favorites"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "favorites": favorites,
        "pagination": utils.CalculatePaginationMeta(page, pageSize, total),
    })
}
```

---

### **Day 6: Testing & Polish**

#### **Step 11: Integration Testing (2 hours)**

**Create:** `backend/test_favorites_history.sh`

```bash
#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "Favorites & History Integration Tests"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080"

# Login to get token
echo -e "${YELLOW}Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ FAILED${NC} - Could not get auth token"
    exit 1
fi
