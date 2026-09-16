import React from 'react';
import type { ReflectionSearchResult } from '../../services/api/search_extended';
import styles from './ReflectionResultCard.module.css';

const NoteIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </svg>
);

interface Props {
  result: ReflectionSearchResult;
  index: number;
}

export const ReflectionResultCard: React.FC<Props> = ({ result, index }) => {
  const date = new Date(result.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <li className={styles.card} style={{ animationDelay: `${index * 60}ms` }}>
      <div className={styles.icon}><NoteIcon /></div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.reference}>{result.verse_reference}</span>
          <span className={styles.date}>{date}</span>
        </div>
        <p className={styles.text}>{result.match_excerpt || result.comment_text}</p>
      </div>
    </li>
  );
};
