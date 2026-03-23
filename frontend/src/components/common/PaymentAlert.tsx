import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Warning, X } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';
import { SoundService } from '../../services/SoundService';

const DISMISS_KEY = 'paymentAlertDismissedAt';
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const PaymentAlert: React.FC = () => {
  const { t } = useTranslation();
  const { subscription, openPortal } = useStreak();
  const [visible, setVisible] = useState(false);

  // §8.18.3: Play sound once per session when banner first appears
  useEffect(() => {
    if (!sessionStorage.getItem('paymentAlertSounded')) {
      SoundService.play('payment-alert');
      sessionStorage.setItem('paymentAlertSounded', '1');
    }
  }, []);

  useEffect(() => {
    if (subscription?.status !== 'past_due') {
      // Auto-clear dismiss timestamp when status is no longer past_due
      if (subscription?.status === 'active') {
        localStorage.removeItem(DISMISS_KEY);
      }
      setVisible(false);
      return;
    }

    // Check if dismissed within 24 h
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < DISMISS_TTL_MS) {
      setVisible(false);
      return;
    }

    setVisible(true);
  }, [subscription?.status]);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleFix = async () => {
    try {
      await openPortal();
    } catch {
      // portal redirect failed — do nothing
    }
  };

  return (
    <div className="payment-alert" role="alert">
      <Warning size={20} weight="fill" className="payment-alert__icon" />
      <span className="payment-alert__text">
        {t('subscription.past_due_banner', 'Your last payment failed. Please update your payment method to keep premium access.')}
      </span>
      <button className="payment-alert__fix-btn" onClick={handleFix}>
        {t('subscription.update_payment', 'Update Payment Method')}
      </button>
      <button
        className="payment-alert__close"
        onClick={handleDismiss}
        aria-label={t('common.dismiss', 'Dismiss')}
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
};
