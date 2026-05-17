import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import type { VerseSearchResult } from '../../hooks/useVerseSearch';
import styles from './SearchResultCard.module.css';

const BookIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const CopyIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface Props {
  result: VerseSearchResult;
  index: number;
  onAnnotate?: (reference: string) => void;
}

export const SearchResultCard: React.FC<Props> = ({ result, index, onAnnotate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${result.reference}\n${result.text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — silently ignore
    }
  };

  return (
    <li
      className={styles.card}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className={styles.icon}>
        <BookIcon />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.reference}>{result.reference}</span>
          <button
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : `Copy ${result.reference}`}
            title={copied ? 'Copied!' : 'Copy verse'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            <span className={styles.copyLabel}>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className={styles.text}>{result.text}</p>
        {/* Annotate link — below the verse text so the header stays uncluttered on mobile */}
        {!!user && !!onAnnotate && (
          <button
            onClick={() => onAnnotate(result.reference)}
            className={styles.annotateButton}
            aria-label={t('annotation.addNote', 'Add a note')}
          >
            {t('annotation.addNote', 'Add a note')}
          </button>
        )}
      </div>
    </li>
  );
};
