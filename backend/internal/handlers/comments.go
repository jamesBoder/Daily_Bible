package handlers

import (
    "dailybible/internal/services"
    "log"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
)

type CommentHandler struct {
    commentService      *services.CommentService
    blessingsService    *services.BlessingsService
    subscriptionChecker services.SubscriptionChecker
    subscriptionService *services.SubscriptionService // for HasOneTimePurchase("reflection_archive")
}

func NewCommentHandler(
    commentService *services.CommentService,
    blessingsService *services.BlessingsService,
    subscriptionChecker services.SubscriptionChecker,
) *CommentHandler {
    return &CommentHandler{
        commentService:      commentService,
        blessingsService:    blessingsService,
        subscriptionChecker: subscriptionChecker,
    }
}

// SetSubscriptionService wires in the SubscriptionService for HasOneTimePurchase checks.
// Called from main.go after both services are initialized (breaks the initialization cycle).
func (h *CommentHandler) SetSubscriptionService(s *services.SubscriptionService) {
    h.subscriptionService = s
}

// hasReflectionAccess returns true if the user has full reflection history access —
// either an active subscription OR a standalone reflection_archive one-time purchase.
func (h *CommentHandler) hasReflectionAccess(userID uint) bool {
    if h.subscriptionChecker != nil && h.subscriptionChecker.IsPremium(userID) {
        return true
    }
    if h.subscriptionService != nil {
        return h.subscriptionService.HasOneTimePurchase(userID, "reflection_archive")
    }
    return false
}

type AddCommentRequest struct {
    VerseID        int    `json:"verse_id" binding:"required"`
    VerseReference string `json:"verse_reference" binding:"required"`
    CommentText    string `json:"comment_text" binding:"required,max=1000"`
}

// Add or update comment
func (h *CommentHandler) AddOrUpdateComment(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    var req AddCommentRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    comment, err := h.commentService.AddOrUpdateComment(
        userID.(uint),
        req.VerseID,
        req.VerseReference,
        req.CommentText,
    )
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save comment"})
        return
    }
    
    // Phase 8: use real premium multiplier from Gin context.
    blessingsMultiplier := 1.0
    if c.GetBool("isPremium") {
        blessingsMultiplier = 1.5
    }
    // Cap: max 2 reflections rewarded per UTC day (20 blessings max from reflections/day).
    var blessingsCredited int
    if credited, err := h.blessingsService.CreditWithDailyCap(userID.(uint), 10, "reflection_written", blessingsMultiplier, 2); err == nil && credited > 0 {
        blessingsCredited = credited
    } else if err != nil {
        log.Printf("Failed to credit blessings for reflection: %v", err)
    }
    
    response := gin.H{"comment": comment}
    if blessingsCredited > 0 {
        response["blessings_credited"] = blessingsCredited
    }
    
    c.JSON(http.StatusOK, response)
}

// Get comment for verse
func (h *CommentHandler) GetCommentForVerse(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    verseReference := c.Param("reference")
    
    comment, err := h.commentService.GetCommentForVerse(userID.(uint), verseReference)
    if err != nil {
        // No comment yet is normal — return 200 with null so the frontend doesn't log 404 errors.
        c.JSON(http.StatusOK, gin.H{"comment": nil})
        return
    }

    c.JSON(http.StatusOK, gin.H{"comment": comment})
}

// Delete comment
func (h *CommentHandler) DeleteComment(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
        return
    }
    
    err = h.commentService.DeleteComment(uint(commentID), userID.(uint))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// Get all user comments (reflection archive)
// Free tier: last 7 days only. Full access: subscribers or reflection_archive purchasers.
func (h *CommentHandler) GetUserComments(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    uid := userID.(uint)
    hasAccess := h.hasReflectionAccess(uid)

    comments, total, err := h.commentService.GetUserComments(uid, hasAccess)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
        return
    }

    resp := gin.H{
        "comments":     comments,
        "total_stored": total,
        "has_full_access": hasAccess,
    }
    if !hasAccess {
        resp["view_limit_days"] = 7
    }
    c.JSON(http.StatusOK, resp)
}
