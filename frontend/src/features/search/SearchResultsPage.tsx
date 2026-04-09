import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { SearchResultCard } from './SearchResultCard';
import { SearchEmptyState } from './SearchEmptyState';
import { SavedSearchesTeaser } from './SavedSearchesTeaser';
import { useVerseSearch } from '../../hooks/useVerseSearch';
import { useTutorial } from '../../hooks/useTutorial';
import { SearchTutorial, SEARCH_TUTORIAL_KEY } from './SearchTutorial';
import styles from './SearchResultsPage.module.css';

const SearchIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SearchSkeleton: React.FC = () => (
  <ul className={styles.skeletonList} aria-busy="true" aria-label="Loading results">
    {[...Array(5)].map((_, i) => (
      <li key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 80}ms` }} />
    ))}
  </ul>
);

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') ?? '';
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(SEARCH_TUTORIAL_KEY);

  const {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    query,
    setQuery,
  } = useVerseSearch();

  // Virtualizer — uses <main> as the scroll container (overflow-y-auto on mobile,
  // overflow-visible on desktop where the window scrolls instead).
  const scrollElementRef = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    scrollElementRef.current = document.querySelector('main');
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => scrollElementRef.current,
    // ~88px card + 12px gap between cards
    estimateSize: () => 100,
    overscan: 5,
  });

  // Fire search automatically when the URL query param is present
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      search(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Auto-focus the input when landing on the page with no query
  useEffect(() => {
    if (!initialQuery) inputRef.current?.focus();
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    // If the URL already has this query (e.g. user re-submits the same term),
    // the useEffect won't re-fire so call search directly.
    // Otherwise just navigate — the useEffect handles the search when initialQuery changes.
    if (q === initialQuery) {
      search(q);
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`, { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      {/* Tutorial overlay */}
      {showTutorial && <SearchTutorial onDismiss={dismissTutorial} />}

      <div className="flex items-center gap-2 mb-1">
        <h1 className={styles.heading} style={{ margin: 0 }}>{t('search.title', 'Search Scripture')}</h1>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={openTutorial}
          aria-label={t('common.help', 'Help')}
          title={t('common.help', 'Help')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <form className={styles.searchForm} onSubmit={handleSubmit} role="search">
        <div className={styles.inputWrapper}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            ref={inputRef}
            type="search"
            className={styles.searchInput}
            placeholder={t('search.placeholder', 'Search scriptures… e.g. "John 3" or "grace"')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('common.search')}
          />
        </div>
        <button
          type="submit"
          className={styles.searchButton}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? 'Searching…' : t('common.search', 'Search')}
        </button>
      </form>

      {isLoading && <SearchSkeleton />}

      {!isLoading && error && (
        <p className={styles.error} role="alert">{error}</p>
      )}

      {!isLoading && hasSearched && results.length === 0 && !error && (
        <SearchEmptyState query={query} />
      )}

      {!isLoading && results.length > 0 && (
        <>
          <p className={styles.resultCount}>
            {results.length}{' '}
            {results.length === 1
              ? t('search.verseFound', 'verse found')
              : t('search.versesFound', 'verses found')}
          </p>
          {/* Virtual list — only renders items in the viewport */}
          <ul
            className={styles.results}
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
              display: 'block', // override flex from CSS module
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => (
              <li
                key={results[virtualItem.index].id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: '0.75rem', // replaces the CSS gap
                }}
              >
                <SearchResultCard result={results[virtualItem.index]} index={virtualItem.index} />
              </li>
            ))}
          </ul>
        </>
      )}

      {!isLoading && results.length > 0 && <SavedSearchesTeaser />}
    </div>
  );
};
