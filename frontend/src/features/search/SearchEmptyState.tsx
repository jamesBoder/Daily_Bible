import React from 'react';
import styles from './SearchEmptyState.module.css';

const SearchThinIcon: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

interface Props {
  query: string;
}

export const SearchEmptyState: React.FC<Props> = ({ query }) => (
  <div className={styles.container}>
    <SearchThinIcon />
    <p className={styles.message}>
      No verses found for <em>"{query}"</em>
    </p>
    <p className={styles.suggestion}>
      Try a different word, a shorter phrase, or a book name like <em>John</em> or <em>Psalms</em>.
    </p>
  </div>
);
