package handlers

import (
    "Daily_Bible/internal/services"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
)

type CommentHandler struct {
    commentService *services.CommentService
}

func NewCommentHandler(commentService *services.CommentService) *CommentHandler {
    return &CommentHandler{
        commentService: commentService,
    }
}

type AddCommentRequest struct {
    VerseID        int    `json:"verse_id" binding:"required"`
    VerseReference string `json:"verse_reference" binding:"required"`
    CommentText    string `json:"comment_text" binding:"required,max=1000"`
}

// Add or update comment
func (h *CommentHandler) AddOrUpdateComment(c *gin.Context) {
    userID, exists := c.Get("user_id")
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
        userID.(string),
        req.VerseID,
        req.VerseReference,
        req.CommentText,
    )
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save comment"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"comment": comment})
}

// Get comment for verse
func (h *CommentHandler) GetCommentForVerse(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    verseReference := c.Param("reference")
    
    comment, err := h.commentService.GetCommentForVerse(userID.(string), verseReference)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"comment": comment})
}

// Delete comment
func (h *CommentHandler) DeleteComment(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    commentID, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
        return
    }
    
    err = h.commentService.DeleteComment(uint(commentID), userID.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// Get all user comments
func (h *CommentHandler) GetUserComments(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }
    
    comments, err := h.commentService.GetUserComments(userID.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{"comments": comments})
}
