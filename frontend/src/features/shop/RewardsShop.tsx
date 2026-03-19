import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemePicker } from '../settings/ThemePicker';
import BlessingsChip from '../../components/BlessingsChip';
import styles from './RewardsShop.module.css';

export const RewardsShop: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('shop.title')}</h1>
        <p className={styles.subtitle}>{t('shop.subtitle')}</p>
        <div className={styles.chipRow}>
          <BlessingsChip />
        </div>
      </div>
      <section className={styles.section}>
        <ThemePicker />
      </section>
    </div>
  );
};
