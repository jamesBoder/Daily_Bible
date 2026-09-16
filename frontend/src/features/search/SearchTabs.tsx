import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from '@phosphor-icons/react';
import styles from './SearchTabs.module.css';

export type SearchTab = 'verses' | 'reflections' | 'journal';

interface Props {
  activeTab: SearchTab;
  onChange: (tab: SearchTab) => void;
  isPremium: boolean;
}

export const SearchTabs: React.FC<Props> = ({ activeTab, onChange, isPremium }) => {
  const { t } = useTranslation();

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'verses', label: t('search.tabs.verses', 'Verses') },
    { key: 'reflections', label: t('search.tabs.reflections', 'Reflections') },
    { key: 'journal', label: t('search.tabs.journal', 'Journal') },
  ];

  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          role="tab"
          aria-selected={activeTab === key}
          className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
          onClick={() => onChange(key)}
        >
          {label}
          {key !== 'verses' && !isPremium && (
            <Lock size={12} weight="bold" className={styles.tabLockIcon} aria-hidden="true" />
          )}
        </button>
      ))}
    </div>
  );
};
