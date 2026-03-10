package handlers

import (
    "dailybible/internal/services"
    "log"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
)

type CommentHandler struct {
    commentService   *services.CommentService
    blessingsService *services.BlessingsService
}

func NewCommentHandler(commentService *services.CommentService, blessingsService *services.BlessingsService) *CommentHandler {
    return &CommentHandler{
        commentService:   commentService,
        blessingsService: blessingsService,
    }
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
    
    // Cap: max 2 reflections rewarded per UTC day (20 blessings max from reflections/day).
    var blessingsCredited int
    if credited, err := h.blessingsService.CreditWithDailyCap(userID.(uint), 10, "reflection_written", 1.0, 2); err == nil && credited > 0 {
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

// Get all user comments
func (h *CommentHandler) GetUserComments(c *gin.Context) {
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    comments, err := h.commentService.GetUserComments(userID.(uint))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"comments": comments})
}
