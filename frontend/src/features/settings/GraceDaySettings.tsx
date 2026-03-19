import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../../contexts/StreakContext';
import { CalendarCheck } from '@phosphor-icons/react';
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
    <div className={styles.container}>
      <div className={styles.info}>
        <CalendarCheck size={20} weight="duotone" />
        <span>
          {t('settings.graceDays.remaining', 'Grace Days remaining:')}{' '}
          <strong>{remaining} {t('settings.graceDays.of2', 'of 2')}</strong>
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
          {confirming
            ? t('settings.graceDays.confirm', 'Confirm — use a Grace Day?')
            : t('settings.graceDays.use', 'Use a Grace Day')}
        </button>
      )}
    </div>
  );
};
