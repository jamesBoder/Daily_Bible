import React from 'react';
import { useTranslation } from 'react-i18next';
import { BIBLE_BOOKS } from '../../utils/bibleBooks';
import styles from './BookFilterPill.module.css';

interface Props {
  value: string;
  onChange: (book: string) => void;
}

export const BookFilterPill: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <select
      className={styles.pill}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={t('search.bookFilter.label', 'Filter by book')}
    >
      <option value="">{t('search.bookFilter.allBooks', 'All books')}</option>
      {BIBLE_BOOKS.map((book) => (
        <option key={book} value={book}>{book}</option>
      ))}
    </select>
  );
};
