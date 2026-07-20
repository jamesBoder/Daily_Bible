import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../../contexts/StreakContext';
import { CalendarCheck, ShieldStar } from '@phosphor-icons/react';
import { GraceDayTutorial } from './GraceDayTutorial';
import { showToast } from '../../utils/toast';
import styles from './GraceDaySettings.module.css';

// Free users can hold up to 5 grace days (3 from natural accrual, up to 5 with purchases).
// Premium users have no cap.
const FREE_GRACE_DAY_CAP = 5;

export const GraceDaySettings: React.FC = () => {
  const { t } = useTranslation();
  const { streakData, subscription, useGraceDay: applyGraceDay } = useStreak();
  const [confirming, setConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const remaining = streakData?.grace_days_remaining ?? 0;
  const queued = streakData?.grace_days_queued ?? 0;
  const isPremium = subscription?.is_premium ?? false;

  const handleUseGraceDay = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsLoading(true);
    try {
      const result = await applyGraceDay();
      if (result.success) {
        showToast.success(t('settings.graceDays.usedSuccess', 'Grace Day used — streak protected!'));
      } else {
        showToast.error(result.error ?? t('settings.graceDays.errorGeneric', 'Could not use Grace Day.'));
      }
    } finally {
      setConfirming(false);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.banner}>
      {showTutorial && <GraceDayTutorial onDismiss={() => setShowTutorial(false)} />}
      <div className={styles.bannerHeader}>
        <ShieldStar size={24} weight="duotone" className={styles.bannerIcon} />
        <div style={{ flex: 1 }}>
          <h3 className={styles.bannerTitle}>
            {t('settings.graceDays.title', 'Grace Days')}
          </h3>
          <p className={styles.bannerDesc}>
            {t('settings.graceDays.description', 'Missed a day? Use a Grace Day to protect your streak.')}
          </p>
        </div>
        <button
          className="tap-target-44 w-7 h-7 flex items-center justify-center rounded-full text-[var(--foreground)] opacity-40 hover:opacity-90 hover:bg-[var(--theme-surface)] transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 flex-shrink-0"
          onClick={() => setShowTutorial(true)}
          aria-label={t('common.help', 'Help')}
          title={t('common.help', 'Help')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div className={styles.pipsRow}>
        {isPremium ? (
          // Premium: no cap — just show the count without pips
          <span className={styles.pipsLabel} style={{ fontWeight: 700, fontSize: '1rem' }}>
            {remaining}
          </span>
        ) : (
          // Free: up to FREE_GRACE_DAY_CAP pips
          Array.from({ length: FREE_GRACE_DAY_CAP }, (_, i) => (
            <div key={i} className={`${styles.pip} ${i < remaining ? styles.pipActive : styles.pipUsed}`} />
          ))
        )}
        <span className={styles.pipsLabel}>
          {isPremium
            ? t('settings.graceDays.availablePremium', 'available')
            : `${remaining} ${t('settings.graceDays.ofN', { count: FREE_GRACE_DAY_CAP, defaultValue: `of ${FREE_GRACE_DAY_CAP}` })} ${t('settings.graceDays.available', 'available')}`}
        </span>
      </div>
      {queued > 0 && (
        <p className={styles.queuedNote}>
          +{queued} {t('settings.graceDays.banked', 'banked — will restore as you use days')}
        </p>
      )}

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
