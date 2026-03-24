import { useQuery } from '@tanstack/react-query';
import { verseService } from '../services/api/verse';
import { msUntilDailyReset } from '../lib/queryClient';

export const useVerse = (language: string = 'en', version?: string) => {
  // Include today's date, language, and version in the query key.
  // When language or version changes, React Query fetches the new one.
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyVerse', today, language, version ?? ''],
    queryFn: () => verseService.getDailyVerse(language, version),
    staleTime: msUntilDailyReset, // fresh until the verse actually changes
    gcTime: 24 * 60 * 60 * 1000, // keep in memory for 24 hours
  });

  return {
    verse: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
};
