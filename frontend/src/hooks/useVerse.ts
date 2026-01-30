import { useQuery } from '@tanstack/react-query';
import { verseService } from '../services/api/verse';

export const useVerse = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyVerse'],
    queryFn: verseService.getDailyVerse,
  });

  return {
    verse: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
};
