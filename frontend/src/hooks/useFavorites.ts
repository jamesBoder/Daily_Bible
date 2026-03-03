import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteService } from '../services/api/favorite';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { isGuest } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteService.getFavorites(1, 100),
    enabled: !isGuest, // skip API call entirely for guests (prevents 401)
    select: (response) => response.favorites,
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (verseId: number) => {
      // guard mutations — guests should never reach here, but safety net
      if (isGuest) return Promise.resolve(null as any);
      return favoriteService.addFavorite(verseId);
    },
    onSuccess: () => {
      if (!isGuest) queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteId: number) => {
      // guard mutations — guests should never reach here, but safety net
      if (isGuest) return Promise.resolve(null as any);
      return favoriteService.removeFavorite(favoriteId);
    },
    onSuccess: () => {
      if (!isGuest) queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const isFavorited = (verseId: number): boolean => {
    return (data ?? []).some(fav => fav.verse_id === verseId);
  };

  const getFavoriteId = (verseId: number): number | null => {
    const favorite = (data ?? []).find(fav => fav.verse_id === verseId);
    return favorite?.id ?? null;
  };

  return {
    favorites: data ?? [],
    isLoading,
    error: error?.message ?? null,
    refetch,
    addFavorite: addMutation.mutateAsync,
    removeFavorite: removeMutation.mutateAsync,
    isFavorited,
    getFavoriteId,
  };
};