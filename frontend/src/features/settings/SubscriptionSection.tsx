import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, ArrowClockwise, X, Warning } from '@phosphor-icons/react';
import { useStreak } from '../../contexts/StreakContext';
import { usePricingModal } from '../../hooks/usePricingModal';

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const SubscriptionSection: React.FC = () => {
  const { t } = useTranslation();
  const { subscription, subscriptionLoading, startCheckout, openPortal, refreshSubscription } =
    useStreak();
  const { openModal } = usePricingModal();
  const [portalLoading, setPortalLoading] = useState(false);
  const [planChoice, setPlanChoice] = useState<'monthly' | 'annual'>('annual');

  const status = subscription?.status ?? 'none';
  const plan = subscription?.plan ?? '';
  const isPremium = subscription?.is_premium ?? false;
  const periodEnd = subscription?.period_end ?? null;
  const canceledAt = subscription?.canceled_at ?? null;

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch {
      setPortalLoading(false);
    }
  };

  const handleCheckout = async () => {
    try {
      await startCheckout(planChoice);
    } catch {
      // redirect in progress — no-op
    }
  };

  // ── FREE / NONE ────────────────────────────────────────────────────────────
  if (status === 'none') {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <Crown size={20} weight="duotone" />
          {t('subscription.title', 'Premium')}
        </h3>
        <p className="settings-section__description">
          {t('subscription.free_description', 'Unlock all premium features with a subscription.')}
        </p>

        <div className="subscription-plan-selector" role="radiogroup" aria-label={t('subscription.choose_plan', 'Choose plan')}>
          <label className={`subscription-plan-option${planChoice === 'monthly' ? ' subscription-plan-option--selected' : ''}`}>
            <input
              type="radio"
              name="plan"
              value="monthly"
              checked={planChoice === 'monthly'}
              onChange={() => setPlanChoice('monthly')}
              className="sr-only"
            />
            <span className="subscription-plan-option__name">{t('subscription.plan.monthly', 'Monthly')}</span>
          </label>
          <label className={`subscription-plan-option${planChoice === 'annual' ? ' subscription-plan-option--selected' : ''}`}>
            <input
              type="radio"
              name="plan"
              value="annual"
              checked={planChoice === 'annual'}
              onChange={() => setPlanChoice('annual')}
              className="sr-only"
            />
            <span className="subscription-plan-option__name">{t('subscription.plan.annual', 'Annual')}</span>
            <span className="subscription-plan-option__badge">{t('subscription.plan.annual_save', 'Save 17%')}</span>
          </label>
        </div>

        <button
          className="subscription-cta-btn subscription-cta-btn--primary"
          onClick={handleCheckout}
          disabled={subscriptionLoading}
          style={{ minHeight: 48 }}
        >
          <Crown size={18} weight="fill" />
          {t('subscription.upgrade_cta', 'Upgrade to Premium')}
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
  }

  // ── ACTIVE ─────────────────────────────────────────────────────────────────
  if (status === 'active' && !canceledAt) {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <Crown size={20} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
          {t('subscription.active_title', 'Premium Member')}
        </h3>
        <p className="settings-section__description">
          {t('subscription.active_plan', 'Plan:')} <strong>{t(`subscription.plan.${plan}`, plan)}</strong>
          {periodEnd && (
            <> · {t('subscription.renews', 'Renews')} {formatDate(periodEnd)}</>
          )}
        </p>
        <button
          className="subscription-cta-btn subscription-cta-btn--secondary"
          onClick={handlePortal}
          disabled={portalLoading}
          style={{ minHeight: 48 }}
        >
          {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.manage', 'Manage Subscription')}
        </button>
      </div>
    );
  }

  // ── TRIALING ───────────────────────────────────────────────────────────────
  if (status === 'trialing') {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <Crown size={20} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
          {t('subscription.trial_title', 'Free Trial')}
        </h3>
        <p className="settings-section__description">
          {periodEnd && t('subscription.trial_ends', 'Trial ends {{date}}', { date: formatDate(periodEnd) })}
        </p>
        <button
          className="subscription-cta-btn subscription-cta-btn--secondary"
          onClick={handlePortal}
          disabled={portalLoading}
          style={{ minHeight: 48 }}
        >
          {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.manage', 'Manage Subscription')}
        </button>
      </div>
    );
  }

  // ── CANCELED (still has access until period end) ───────────────────────────
  // Stripe sets status to "canceled" once the subscription is actually canceled.
  // The user retains isPremium access until period_end (handled by StripeSubscriptionChecker).
  if (status === 'canceled') {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <X size={20} weight="bold" style={{ color: 'var(--error)' }} />
          {t('subscription.canceled_title', 'Subscription Canceled')}
        </h3>
        <p className="settings-section__description">
          {periodEnd && t('subscription.access_until', 'Access until {{date}}', { date: formatDate(periodEnd) })}
        </p>
        <button
          className="subscription-cta-btn subscription-cta-btn--primary"
          onClick={handlePortal}
          disabled={portalLoading}
          style={{ minHeight: 48 }}
        >
          {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.reactivate', 'Reactivate')}
        </button>
      </div>
    );
  }

  // ── PAST DUE ───────────────────────────────────────────────────────────────
  if (status === 'past_due') {
    return (
      <div className="settings-section">
        <h3 className="settings-section__title">
          <Warning size={20} weight="fill" style={{ color: 'var(--warning)' }} />
          {t('subscription.past_due_title', 'Payment Failed')}
        </h3>
        <p className="settings-section__description">
          {t('subscription.past_due_description', 'Please update your payment method to keep your premium access.')}
        </p>
        <button
          className="subscription-cta-btn subscription-cta-btn--primary"
          onClick={handlePortal}
          disabled={portalLoading}
          style={{ minHeight: 48 }}
        >
          {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.update_payment', 'Update Payment Method')}
        </button>
        <button
          className="subscription-cta-btn subscription-cta-btn--secondary"
          onClick={refreshSubscription}
          style={{ minHeight: 48 }}
        >
          <ArrowClockwise size={16} />
          {t('subscription.refresh', 'Refresh Status')}
        </button>
      </div>
    );
  }

  // Fallback — unknown status
  return null;
};
