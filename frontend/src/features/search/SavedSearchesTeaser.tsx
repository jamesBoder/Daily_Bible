import React from 'react';
import styles from './SavedSearchesTeaser.module.css';

const LockIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const SavedSearchesTeaser: React.FC = () => (
  <div className={styles.teaser} aria-label="Premium feature preview">
    <span className={styles.lockIcon}><LockIcon /></span>
    <div className={styles.text}>
      <strong>Save your searches</strong>
      <span>
        Members can save searches, filter by book, and search within their journal and reflections.
      </span>
    </div>
  </div>
);
