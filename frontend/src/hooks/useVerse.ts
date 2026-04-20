import { useQuery } from '@tanstack/react-query';
import { verseService } from '../services/api/verse';
import { msUntilDailyReset } from '../lib/queryClient';

export const useVerse = (language: string = 'en', version?: string) => {
  // Include today's date, language, and version in the query key.
  // When language or version changes, React Query fetches the new one.
  // Use the same UTC-10 effective date the backend uses so the query key changes
  // at the same moment the backend starts serving the new verse.
  const today = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyVerse', today, language, version ?? ''],
    queryFn: () => verseService.getDailyVerse(language, version),
    staleTime: msUntilDailyReset, // fresh until the verse actually changes
    gcTime: 24 * 60 * 60 * 1000, // keep in memory for 24 hours
  });

  return {
    verse: data?.verse ?? null,
    // blessings_credited > 0 only on the first fetch of the day (wasNew on backend).
    // Callers must guard against showing the toast more than once per session.
    blessingsCredited: data?.blessings_credited ?? 0,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
};
