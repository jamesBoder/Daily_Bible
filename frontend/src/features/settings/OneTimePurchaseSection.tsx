import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarCheck, Sparkle, Heart } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';
import { showToast } from '../../utils/toast';

interface OTPProduct {
  key: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  priceKey: string;
}

const PRODUCTS: OTPProduct[] = [
  {
    key: 'support_developer',
    icon: <Heart size={24} weight="fill" style={{ color: 'var(--candle-amber)' }} />,
    titleKey: 'otp.support_developer.title',
    descKey: 'otp.support_developer.desc',
    priceKey: 'otp.support_developer.price',
  },
  {
    key: 'full_theme_library',
    icon: <Sparkle size={24} weight="duotone" />,
    titleKey: 'otp.full_theme_library.title',
    descKey: 'otp.full_theme_library.desc',
    priceKey: 'otp.full_theme_library.price',
  },
  {
    key: 'grace_day_pack',
    icon: <CalendarCheck size={24} weight="duotone" />,
    titleKey: 'otp.grace_day_pack.title',
    descKey: 'otp.grace_day_pack.desc',
    priceKey: 'otp.grace_day_pack.price',
  },
];

export const OneTimePurchaseSection: React.FC<{ ownedKeys?: string[]; hideHeader?: boolean }> = ({ ownedKeys = [], hideHeader = false }) => {
  const { t } = useTranslation();
  const { startOneTimePurchase } = useStreak();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handlePurchase = async (key: string) => {
    setLoadingKey(key);
    try {
      await startOneTimePurchase(key);
    } catch (err: any) {
      setLoadingKey(null);
      const msg = err?.response?.data?.error ?? t('otp.purchase_error', 'Could not start checkout. Please try again.');
      showToast.error(msg);
    }
  };

  return (
    <div className="settings-section">
      {!hideHeader && (
        <>
          <h3 className="settings-section__title">
            <Sparkle size={20} weight="duotone" />
            {t('otp.section_title', 'Add-ons & One-Time Purchases')}
          </h3>
          <p className="settings-section__description">
            {t('otp.section_description', 'Unlock individual features forever — no subscription required.')}
          </p>
        </>
      )}

      <div className="otp-grid">
        {PRODUCTS.map(product => {
          const isOwned = ownedKeys.includes(product.key);
          const isLoading = loadingKey === product.key;

          return (
            <div
              key={product.key}
              className={`otp-card${isOwned ? ' otp-card--owned' : ''}`}
            >
              <div className="otp-card__icon">{product.icon}</div>
              <div className="otp-card__body">
                <p className="otp-card__title">{t(product.titleKey, product.key)}</p>
                <p className="otp-card__desc">{t(product.descKey, '')}</p>
              </div>
              {isOwned ? (
                <span className="otp-card__owned-badge">{t('otp.owned', 'Owned')}</span>
              ) : (
                <button
                  className="otp-card__buy-btn"
                  onClick={() => handlePurchase(product.key)}
                  disabled={isLoading}
                  style={{ minHeight: 44 }}
                >
                  {isLoading ? t('otp.loading', '…') : t(product.priceKey, 'Buy')}
                </button>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
