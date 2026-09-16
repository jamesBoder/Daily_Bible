import { useState, useCallback, useRef } from 'react';

interface UseExtendedSearchReturn<T> {
  results: T[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (q: string) => void;
  reset: () => void;
}

/**
 * Shared on-demand search state for the premium-gated reflections/journal
 * search tabs — same request-id dedup pattern as useVerseSearch, generic
 * over the result type so both tabs can share one hook.
 */
export function useExtendedSearch<T>(searchFn: (q: string) => Promise<T[]>): UseExtendedSearchReturn<T> {
  const [results, setResults] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const reqIdRef = useRef(0);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;

    const reqId = ++reqIdRef.current;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const resolved = await searchFn(q.trim());
      if (reqId !== reqIdRef.current) return;
      setResults(resolved);
    } catch {
      if (reqId !== reqIdRef.current) return;
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      if (reqId === reqIdRef.current) setIsLoading(false);
    }
  }, [searchFn]);

  const reset = useCallback(() => {
    reqIdRef.current++;
    setResults([]);
    setHasSearched(false);
    setError(null);
    setIsLoading(false);
  }, []);

  return { results, isLoading, error, hasSearched, search, reset };
}
