import apiClient from './client';

export interface PostResponse {
  id: number;
  post_type: 'announcement' | 'user' | 'milestone' | 'prayer' | 'challenge';
  body: string;
  is_pinned: boolean;
  username: string;
  is_admin: boolean;
  is_self: boolean;
  created_at: string;
  expires_at?: string;
  reactions: Record<string, number>;
  user_reacted: string[];
}

export interface FeedResponse {
  posts: PostResponse[];
  limit: number;
  is_admin: boolean;
}

export const communityApi = {
  getFeed: (beforeId = 0, limit = 20): Promise<FeedResponse> =>
    apiClient.get('/api/community', { params: { before_id: beforeId, limit } }).then((r) => r.data),

  createPost: (postType: string, body: string, anonymous = false): Promise<{ post: PostResponse }> =>
    apiClient.post('/api/community', { post_type: postType, body, anonymous }).then((r) => r.data),

  deletePost: (postId: number): Promise<void> =>
    apiClient.delete(`/api/community/${postId}`).then(() => undefined),

  addReaction: (postId: number, reactionType: string): Promise<void> =>
    apiClient.post(`/api/community/${postId}/react`, { reaction_type: reactionType }).then(() => undefined),

  removeReaction: (postId: number, reactionType: string): Promise<void> =>
    apiClient.delete(`/api/community/${postId}/react`, { data: { reaction_type: reactionType } }).then(() => undefined),

  getWalkingToday: (): Promise<{ count: number }> =>
    apiClient.get('/api/community/walking-today').then((r) => r.data),

  createAdminPost: (postType: string, body: string, isPinned: boolean, expiresAt?: string): Promise<void> =>
    apiClient
      .post('/api/community/admin', { post_type: postType, body, is_pinned: isPinned, expires_at: expiresAt ?? null })
      .then(() => undefined),
};
