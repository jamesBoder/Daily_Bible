import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SearchResultCard } from './SearchResultCard';
import { SearchEmptyState } from './SearchEmptyState';
import { SavedSearchesTeaser } from './SavedSearchesTeaser';
import { useVerseSearch } from '../../hooks/useVerseSearch';
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

  const {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    query,
    setQuery,
  } = useVerseSearch();

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
      <h1 className={styles.heading}>{t('search.title', 'Search Scripture')}</h1>

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
          <ul className={styles.results}>
            {results.map((r, i) => (
              <SearchResultCard key={r.id} result={r} index={i} />
            ))}
          </ul>
        </>
      )}

      {!isLoading && results.length > 0 && <SavedSearchesTeaser />}
    </div>
  );
};
