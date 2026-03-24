import { QueryClient } from '@tanstack/react-query';

// Returns milliseconds until the next UTC-10 midnight — the same boundary the
// backend uses to roll the daily verse and Manna word. Use this as `staleTime`
// for queries whose answers don't change within a calendar day.
export const msUntilDailyReset = (): number => {
  const now = new Date();
  // UTC-10: subtract 10 h, find next midnight, add 10 h back
  const effective = new Date(now.getTime() - 10 * 60 * 60 * 1000);
  const nextMidnight = new Date(effective);
  nextMidnight.setUTCHours(24, 0, 0, 0);
  return nextMidnight.getTime() + 10 * 60 * 60 * 1000 - now.getTime();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes default
      gcTime: 30 * 60 * 1000,   // 30 minutes in-memory retention
      // Never retry client errors (4xx). Retrying 401/403 causes a visible
      // loading flash before the error state settles. Only retry on server
      // errors (5xx) and network failures.
      retry: (failureCount, error: any) => {
        const status = error?.response?.status ?? error?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});