import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../../contexts/StreakContext';
import { CalendarCheck, ShieldStar } from '@phosphor-icons/react';
import styles from './GraceDaySettings.module.css';

export const GraceDaySettings: React.FC = () => {
  const { t } = useTranslation();
  const { streakData, useGraceDay: applyGraceDay } = useStreak();
  const [confirming, setConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const remaining = streakData?.grace_days_remaining ?? 0;

  const handleUseGraceDay = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsLoading(true);
    try {
      await applyGraceDay();
    } finally {
      setConfirming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.banner}>
      <div className={styles.bannerHeader}>
        <ShieldStar size={24} weight="duotone" className={styles.bannerIcon} />
        <div>
          <h3 className={styles.bannerTitle}>
            {t('settings.graceDays.title', 'Grace Days')}
          </h3>
          <p className={styles.bannerDesc}>
            {t('settings.graceDays.description', 'Missed a day? Use a Grace Day to protect your streak.')}
          </p>
        </div>
      </div>

      <div className={styles.pipsRow}>
        {[0, 1].map(i => (
          <div key={i} className={`${styles.pip} ${i < remaining ? styles.pipActive : styles.pipUsed}`} />
        ))}
        <span className={styles.pipsLabel}>
          {remaining} {t('settings.graceDays.of2', 'of 2')} {t('settings.graceDays.available', 'available')}
        </span>
      </div>

      {remaining === 0 ? (
        <p className={styles.exhausted}>
          {t('settings.graceDays.exhausted', 'Your grace days have been used this period.')}
        </p>
      ) : (
        <button
          className={`${styles.graceButton} ${confirming ? styles.confirming : ''}`}
          onClick={handleUseGraceDay}
          disabled={isLoading}
        >
          <CalendarCheck size={16} weight="bold" />
          {confirming
            ? t('settings.graceDays.confirm', 'Confirm — use a Grace Day?')
            : t('settings.graceDays.use', 'Use a Grace Day')}
        </button>
      )}
    </div>
  );
};
