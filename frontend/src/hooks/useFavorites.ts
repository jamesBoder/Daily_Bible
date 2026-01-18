import { useState, useEffect } from 'react';
import { favoriteService } from '../services/api/favorite';
import { Favorite } from '../types/favorite';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data.favorites);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = async (verseId: number) => {
    try {
      await favoriteService.addFavorite(verseId);
      await fetchFavorites(); // Refresh list
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to add favorite');
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      await favoriteService.removeFavorite(favoriteId);
      await fetchFavorites(); // Refresh list
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to remove favorite');
    }
  };

  const isFavorited = (verseId: number): boolean => {
    return favorites.some(fav => fav.verse_id === verseId);
  };

  const getFavoriteId = (verseId: number): number | null => {
    const favorite = favorites.find(fav => fav.verse_id === verseId);
    return favorite ? favorite.id : null;
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
    getFavoriteId,
    refetch: fetchFavorites,
  };
};
