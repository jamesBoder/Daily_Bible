import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { JournalSearchResult } from '../../services/api/search_extended';
import styles from './JournalResultCard.module.css';

const JournalIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

interface Props {
  result: JournalSearchResult;
  index: number;
}

export const JournalResultCard: React.FC<Props> = ({ result, index }) => {
  const navigate = useNavigate();
  const date = new Date(result.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const goToEntry = () => navigate(`/journal/${result.id}`);

  return (
    <li
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={goToEntry}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') goToEntry();
      }}
      aria-label={`Journal entry from ${date}: ${result.content_preview}`}
    >
      <div className={styles.icon}><JournalIcon /></div>
      <div className={styles.content}>
        <div className={styles.header}>
          {result.linked_verse && <span className={styles.reference}>{result.linked_verse}</span>}
          <span className={styles.date}>{date}</span>
        </div>
        <p className={styles.text}>{result.match_excerpt || result.content_preview}</p>
      </div>
    </li>
  );
};
