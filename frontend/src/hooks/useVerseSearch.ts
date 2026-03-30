import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../utils/constants';

// Matches the actual backend response shape from GET /api/verses/search
export interface VerseSearchResult {
  id: number;
  reference: string;
  text: string;
  bookId: string;
  chapterId: string;
  language: string;
}

interface SearchResponse {
  results: VerseSearchResult[];
}

interface VerseByRefResponse {
  verse: {
    id: number;
    reference: string;
    text: string;
    bookId: string;
    chapterId: string;
    language: string;
  };
}

interface UseVerseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: VerseSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (q: string) => void;
  clearSearch: () => void;
}

/**
 * Detects whether a query looks like a Bible verse reference.
 * Matches patterns like: "John 3:16", "Psalms 55:22", "1 Corinthians 13:4"
 * Optional leading number for books like 1 John, 2 Kings, 3 John.
 */
function isVerseReference(q: string): boolean {
  return /^(\d\s+)?[a-z][\w\s]*\s+\d+:\d+$/i.test(q.trim());
}

export function useVerseSearch(): UseVerseSearchReturn {
  const { currentLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VerseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  // reqIdRef: only the latest request ID can update state — prevents stale responses
  const reqIdRef = useRef(0);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;

    const reqId = ++reqIdRef.current;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      let resolved: VerseSearchResult[];

      if (isVerseReference(q)) {
        // Exact reference lookup — "Psalms 55:22", "John 3:16", etc.
        const encoded = encodeURIComponent(q.trim());
        const response = await apiClient.get<VerseByRefResponse>(
          `${API_ENDPOINTS.VERSE_BY_REFERENCE}/${encoded}`,
          { params: { lang: currentLanguage } }
        );
        if (reqId !== reqIdRef.current) return;
        const v = response.data.verse;
        resolved = [{
          id: v.id,
          reference: v.reference,
          text: v.text,
          bookId: v.bookId,
          chapterId: v.chapterId,
          language: v.language,
        }];
      } else {
        // Full-text search
        const response = await apiClient.get<SearchResponse>(API_ENDPOINTS.SEARCH_VERSES, {
          params: { q: q.trim(), limit: 20, lang: currentLanguage },
        });
        if (reqId !== reqIdRef.current) return;
        resolved = response.data.results ?? [];
      }

      setResults(resolved);
    } catch (err: any) {
      if (reqId !== reqIdRef.current) return;
      // A 404 on reference lookup means the verse wasn't found — treat as empty results
      if (err?.response?.status === 404) {
        setResults([]);
      } else {
        setError('Search failed. Please try again.');
        setResults([]);
      }
    } finally {
      if (reqId === reqIdRef.current) setIsLoading(false);
    }
  }, [currentLanguage]);

  const clearSearch = useCallback(() => {
    reqIdRef.current++;
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    setIsLoading(false);
  }, []);

  return { query, setQuery, results, isLoading, error, hasSearched, search, clearSearch };
}
