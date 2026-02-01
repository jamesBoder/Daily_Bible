import React, { useState, useEffect } from "react";
import { Button } from "../../components/common/Button";
import { commentService } from "../../services/api/comment";
import { Comment } from "../../types/comment";
import { useCallback } from "react";

interface CommentSectionProps {
  verseId: number;
  verseReference: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  verseId,
  verseReference,
}) => {
  const [comment, setComment] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // define loadComment before using it in useEffect
  const loadComment = useCallback(async () => {
    try {
      const existingComment =
        await commentService.getCommentForVerse(verseReference);
      if (existingComment) {
        setComment(existingComment);
        setCommentText(existingComment.comment_text);
      }
    } catch (err) {
      console.error("Failed to load comment:", err);
    }
  }, [verseReference]);

  // Load existing comment
  useEffect(() => {
    loadComment();
  }, [loadComment]);

  const handleSave = async () => {
    if (!commentText.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    if (commentText.length > 1000) {
      setError("Comment must be less than 1000 characters");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedComment = await commentService.addOrUpdateComment({
        verse_id: verseId,
        verse_reference: verseReference,
        comment_text: commentText.trim(),
      });

      setComment(savedComment);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save comment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !comment ||
      !window.confirm("Are you sure you want to delete this comment?")
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await commentService.deleteComment(comment.id);
      setComment(null);
      setCommentText("");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete comment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCommentText(comment?.comment_text || "");
    setIsEditing(false);
    setError("");
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Notes
      </h3>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!isEditing && !comment && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-2"
          aria-label="Add a personal note"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add a personal note
        </button>
      )}

      {!isEditing && comment && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-800 whitespace-pre-wrap mb-3">
            {comment.comment_text}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              aria-label="Edit note"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              aria-label="Delete note"
            >
              Delete
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {new Date(comment.updated_at).toLocaleDateString()}
          </p>
        </div>
      )}

      {isEditing && (
        <div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your personal thoughts, reflections, or prayers about this verse..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={1000}
            aria-label="Personal note for this verse"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {commentText.length}/1000 characters
            </span>
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="secondary"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                isLoading={isSaving}
              >
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
