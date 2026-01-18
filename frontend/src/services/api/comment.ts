import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Comment, AddCommentRequest } from '../../types/comment';

export const commentService = {
  // Add or update comment
  addOrUpdateComment: async (data: AddCommentRequest): Promise<Comment> => {
    const response = await apiClient.post<{ comment: Comment }>(
      API_ENDPOINTS.COMMENTS,
      data
    );
    return response.data.comment;
  },

  // Get comment for specific verse
  getCommentForVerse: async (verseReference: string): Promise<Comment | null> => {
    try {
      const response = await apiClient.get<{ comment: Comment }>(
        `${API_ENDPOINTS.COMMENTS}/verse/${encodeURIComponent(verseReference)}`
      );
      return response.data.comment;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
  },

  // Get all user comments
  getUserComments: async (): Promise<Comment[]> => {
    const response = await apiClient.get<{ comments: Comment[] }>(
      `${API_ENDPOINTS.COMMENTS}/user`
    );
    return response.data.comments;
  },
};
