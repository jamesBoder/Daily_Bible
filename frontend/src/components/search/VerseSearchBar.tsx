import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './VerseSearchBar.module.css';

const SearchIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface Props {
  initialQuery?: string;
}

export const VerseSearchBar: React.FC<Props> = ({ initialQuery = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (isExpanded) inputRef.current?.focus();
  }, [isExpanded]);

  // Keep value in sync if initialQuery prop changes (e.g. navigating back to /search)
  useEffect(() => {
    setValue(initialQuery);
    if (initialQuery) setIsExpanded(true);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    setIsExpanded(false);
  };

  const handleClear = () => {
    setValue('');
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  const handleBlur = () => {
    // Collapse only if the field is empty
    if (!value.trim()) setIsExpanded(false);
  };

  return (
    <form
      className={`${styles.searchBar} ${isExpanded ? styles.expanded : ''}`}
      onSubmit={handleSubmit}
      role="search"
      aria-label={t('common.search')}
    >
      <button
        type={isExpanded ? 'submit' : 'button'}
        className={styles.iconButton}
        aria-label={t('common.search')}
        onClick={() => { if (!isExpanded) setIsExpanded(true); }}
      >
        <SearchIcon size={20} />
      </button>

      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder={t('search.placeholder', 'Search scriptures…')}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        aria-label={t('common.search')}
        tabIndex={isExpanded ? 0 : -1}
      />

      {value && isExpanded && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={0}
        >
          <CloseIcon size={16} />
        </button>
      )}
    </form>
  );
};
