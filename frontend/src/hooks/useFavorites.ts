import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { favoriteService } from '../services/api/favorite';

export const useFavorites = () => {
  const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['favorites'],
  queryFn: () => favoriteService.getFavorites(1, 100), // Pass params!
  select: (response) => response.favorites // Extract just the array
});



  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (verseId: number) => favoriteService.addFavorite(verseId),
    onSuccess: () => {
      // Automatically refetch favorites list
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });


  const removeMutation = useMutation({
  mutationFn: (favoriteId: number) => favoriteService.removeFavorite(favoriteId),
  onSuccess: () => {
    // Automatically refetch favorites list
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
  }
  });



  const isFavorited = (verseId: number): boolean => {
  return (data ?? []).some(fav => fav.verse_id === verseId);
};


  const getFavoriteId = (verseId: number): number | null => {
  const favorite = (data ?? []).find(fav => fav.verse_id === verseId);
  return favorite ? favorite.id : null;
  };



  return {
    favorites: data ?? [],
    isLoading,
    error: error?.message ?? null,
    addFavorite: (verseId: number) => addMutation.mutateAsync(verseId),
    removeFavorite: (favoriteId: number) => removeMutation.mutateAsync(favoriteId),
    isFavorited,
    getFavoriteId,
    refetch,
    // Bonus: individual loading states
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
};
};





