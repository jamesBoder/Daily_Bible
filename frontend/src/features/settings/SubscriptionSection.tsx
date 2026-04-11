import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Infinity } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';
import { usePricingModal } from '../../hooks/usePricingModal';
import { showToast } from '../../utils/toast';

export const SubscriptionSection: React.FC = () => {
  const { t } = useTranslation();
  const { subscription, subscriptionLoading, startOneTimePurchase } = useStreak();
  const { openModal } = usePricingModal();
  const checkoutInFlight = useRef(false);

  const isPremium = subscription?.is_premium ?? false;
  const ownedKeys = subscription?.owned_purchase_keys ?? [];
  const isLifetime = ownedKeys.includes('premium_lifetime');

  const handleCheckout = async () => {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    try {
      await startOneTimePurchase('premium_lifetime');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('subscription.checkout_error', 'Could not start checkout. Please try again.');
      showToast.error(msg);
    } finally {
      checkoutInFlight.current = false;
    }
  };

  // ── LIFETIME MEMBER ────────────────────────────────────────────────────────
  if (isLifetime || isPremium) {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <Infinity size={20} weight="bold" style={{ color: 'var(--blessing-gold)' }} />
          {t('subscription.lifetime_title', 'Lifetime Member')}
        </h3>
        <p className="settings-section__description">
          {t('subscription.lifetime_meta', 'All features unlocked — yours forever, including future content.')}
        </p>
      </div>
    );
  }

  // ── FREE ───────────────────────────────────────────────────────────────────
  return (
    <div className="settings-section">
      <h3 className="settings-section__title">
        <Crown size={20} weight="duotone" />
        {t('subscription.title', 'Premium')}
      </h3>
      <p className="settings-section__description">
        {t('subscription.free_description', 'Unlock everything, once. No subscription.')}
      </p>

      <div className="subscription-lifetime-price">
        <span className="subscription-lifetime-price__original">$12.99</span>
        <span className="subscription-lifetime-price__sale">$9.99</span>
        <span className="subscription-lifetime-price__badge">{t('subscription.launch_offer', 'Launch offer')}</span>
      </div>

      <button
        className="subscription-cta-btn subscription-cta-btn--primary"
        onClick={handleCheckout}
        disabled={subscriptionLoading}
        style={{ minHeight: 48 }}
      >
        <Crown size={18} weight="fill" />
        {t('subscription.upgrade_cta', 'Unlock Premium')}
      </button>
      <button
        className="subscription-cta-btn subscription-cta-btn--secondary"
        onClick={() => openModal('otp')}
        style={{ minHeight: 48 }}
      >
        {t('subscription.view_addons', 'View Add-ons')}
      </button>
    </div>
  );
};
