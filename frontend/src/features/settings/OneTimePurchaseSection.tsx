import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Scroll, Palette, CalendarCheck, Sparkle, Heart } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';

interface OTPProduct {
  key: string;
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  priceKey: string;
}

const PRODUCTS: OTPProduct[] = [
  {
    key: 'journal_unlock',
    icon: <BookOpen size={24} weight="duotone" />,
    titleKey: 'otp.journal_unlock.title',
    descKey: 'otp.journal_unlock.desc',
    priceKey: 'otp.journal_unlock.price',
  },
  {
    key: 'reflection_archive',
    icon: <Scroll size={24} weight="duotone" />,
    titleKey: 'otp.reflection_archive.title',
    descKey: 'otp.reflection_archive.desc',
    priceKey: 'otp.reflection_archive.price',
  },
  {
    key: 'modern_translations',
    icon: <Scroll size={24} weight="duotone" />,
    titleKey: 'otp.modern_translations.title',
    descKey: 'otp.modern_translations.desc',
    priceKey: 'otp.modern_translations.price',
  },
  {
    key: 'grace_day_pack',
    icon: <CalendarCheck size={24} weight="duotone" />,
    titleKey: 'otp.grace_day_pack.title',
    descKey: 'otp.grace_day_pack.desc',
    priceKey: 'otp.grace_day_pack.price',
  },
  {
    key: 'theme_sanctuary',
    icon: <Palette size={24} weight="duotone" />,
    titleKey: 'otp.theme_sanctuary.title',
    descKey: 'otp.theme_sanctuary.desc',
    priceKey: 'otp.theme_sanctuary.price',
  },
  {
    key: 'theme_desert_sand',
    icon: <Palette size={24} weight="duotone" />,
    titleKey: 'otp.theme_desert_sand.title',
    descKey: 'otp.theme_desert_sand.desc',
    priceKey: 'otp.theme_desert_sand.price',
  },
  {
    key: 'theme_celestial',
    icon: <Palette size={24} weight="duotone" />,
    titleKey: 'otp.theme_celestial.title',
    descKey: 'otp.theme_celestial.desc',
    priceKey: 'otp.theme_celestial.price',
  },
  {
    key: 'full_theme_library',
    icon: <Sparkle size={24} weight="duotone" />,
    titleKey: 'otp.full_theme_library.title',
    descKey: 'otp.full_theme_library.desc',
    priceKey: 'otp.full_theme_library.price',
  },
  {
    key: 'support_developer',
    icon: <Heart size={24} weight="fill" style={{ color: 'var(--candle-amber)' }} />,
    titleKey: 'otp.support_developer.title',
    descKey: 'otp.support_developer.desc',
    priceKey: 'otp.support_developer.price',
  },
];

export const OneTimePurchaseSection: React.FC<{ ownedKeys?: string[]; hideHeader?: boolean }> = ({ ownedKeys = [], hideHeader = false }) => {
  const { t } = useTranslation();
  const { startOneTimePurchase } = useStreak();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [thankYouVisible, setThankYouVisible] = useState(false);

  const handlePurchase = async (key: string) => {
    setLoadingKey(key);
    try {
      await startOneTimePurchase(key);
      // For the Support product show a thank-you overlay before redirect
      if (key === 'support_developer') {
        setThankYouVisible(true);
      }
    } catch {
      setLoadingKey(null);
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

      {/* Full-screen thank-you overlay for Support purchases */}
      {thankYouVisible && (
        <div
          className="otp-thankyou-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t('otp.support_developer.thankyou_label', 'Thank you')}
          onClick={() => setThankYouVisible(false)}
        >
          <div className="otp-thankyou-overlay__content">
            <Heart size={64} weight="fill" style={{ color: 'var(--candle-amber)' }} />
            <h2>{t('otp.support_developer.thankyou_title', 'Thank You!')}</h2>
            <p>{t('otp.support_developer.thankyou_body', 'Your support means the world.')}</p>
            <button
              className="subscription-cta-btn subscription-cta-btn--primary"
              onClick={() => setThankYouVisible(false)}
            >
              {t('common.close', 'Close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
