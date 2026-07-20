import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { communityApi, PostResponse } from '../services/api/community';
import { showToast } from '../utils/toast';

const PAGE_LIMIT = 20;

export interface UseCommunityReturn {
  posts: PostResponse[];
  isLoading: boolean;
  hasMore: boolean;
  isAdmin: boolean;
  error: string | null;
  loadMore: () => void;
  createPost: (postType: string, body: string, anonymous?: boolean) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
  addReaction: (postId: number, reactionType: string) => Promise<void>;
  removeReaction: (postId: number, reactionType: string) => Promise<void>;
  reload: () => void;
}

export function useCommunity(): UseCommunityReturn {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchPage = useCallback(async (beforeId: number, append: boolean) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      setError(null);
      const data = await communityApi.getFeed(beforeId, PAGE_LIMIT);
      const incoming = data.posts ?? [];
      setPosts((prev) => (append ? [...prev, ...incoming] : incoming));
      setHasMore(incoming.length === PAGE_LIMIT);
      if (!append) setIsAdmin(data.is_admin ?? false);
    } catch {
      setError('Failed to load community posts. Pull down to retry.');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Lazy-initialize: load first page on first render.
  const initRef = useRef(false);
  if (!initRef.current) {
    initRef.current = true;
    fetchPage(0, false);
  }

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current || posts.length === 0) return;
    const lastId = posts[posts.length - 1]?.id ?? 0;
    fetchPage(lastId, true);
  }, [hasMore, posts, fetchPage]);

  const reload = useCallback(() => {
    fetchPage(0, false);
  }, [fetchPage]);

  const createPost = useCallback(async (postType: string, body: string, anonymous = false) => {
    const result = await communityApi.createPost(postType, body, anonymous);
    // Prepend the new post to the feed.
    setPosts((prev) => [result.post, ...prev]);
  }, []);

  const deletePost = useCallback(async (postId: number) => {
    try {
      await communityApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      showToast.error(t('community.deleteFailed', "Couldn't delete this post — please try again"));
    }
  }, [t]);

  const addReaction = useCallback(async (postId: number, reactionType: string) => {
    // Optimistic update.
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (p.user_reacted.includes(reactionType)) return p; // already reacted
        return {
          ...p,
          reactions: { ...p.reactions, [reactionType]: (p.reactions[reactionType] ?? 0) + 1 },
          user_reacted: [...p.user_reacted, reactionType],
        };
      })
    );
    try {
      await communityApi.addReaction(postId, reactionType);
    } catch (err) {
      console.error('addReaction failed, reverting:', err);
      // Revert on failure.
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: { ...p.reactions, [reactionType]: Math.max(0, (p.reactions[reactionType] ?? 1) - 1) },
            user_reacted: p.user_reacted.filter((r) => r !== reactionType),
          };
        })
      );
    }
  }, []);

  const removeReaction = useCallback(async (postId: number, reactionType: string) => {
    // Optimistic update.
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          reactions: { ...p.reactions, [reactionType]: Math.max(0, (p.reactions[reactionType] ?? 1) - 1) },
          user_reacted: p.user_reacted.filter((r) => r !== reactionType),
        };
      })
    );
    try {
      await communityApi.removeReaction(postId, reactionType);
    } catch (err) {
      console.error('removeReaction failed, reverting:', err);
      // Revert on failure.
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            reactions: { ...p.reactions, [reactionType]: (p.reactions[reactionType] ?? 0) + 1 },
            user_reacted: [...p.user_reacted, reactionType],
          };
        })
      );
    }
  }, []);

  return { posts, isLoading, hasMore, isAdmin, error, loadMore, createPost, deletePost, addReaction, removeReaction, reload };
}
