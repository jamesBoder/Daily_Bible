import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Crown, Check, Palette, Sparkle } from '@phosphor-icons/react';
import toast from 'react-hot-toast';
import { ThemePicker } from '../settings/ThemePicker';
import { OneTimePurchaseSection } from '../settings/OneTimePurchaseSection';
import BlessingsChip from '../../components/BlessingsChip';
import { useStreak } from '../../contexts/StreakContext';
import { SoundService } from '../../services/SoundService';
import { useTutorial } from '../../hooks/useTutorial';
import { ShopTutorial, SHOP_TUTORIAL_KEY } from './ShopTutorial';
import styles from './RewardsShop.module.css';

const PLAN_FEATURES = [
  'subscription.feature.all_themes',
  'subscription.feature.journal',
  'subscription.feature.prompts',
  'subscription.feature.translations',
  'subscription.feature.streak_calendar',
  'subscription.feature.blessings_multiplier',
  'subscription.feature.reflection_archive',
];

const formatDate = (iso: string | null): string => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export const RewardsShop: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    subscription, subscriptionLoading,
    startCheckout, openPortal, refreshSubscription,
  } = useStreak();
  const [planChoice, setPlanChoice] = useState<'monthly' | 'annual'>('annual');
  const [portalLoading, setPortalLoading] = useState(false);
  // §8.18.1: prevent double-tap before overlay appears
  const checkoutInFlight = useRef(false);
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(SHOP_TUTORIAL_KEY);

  // Handle Stripe return (?subscribed=true or ?purchased=<key>)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const subscribed = params.get('subscribed');
    const purchased = params.get('purchased');
    if (!subscribed && !purchased) return;

    window.history.replaceState({}, '', location.pathname);
    sessionStorage.removeItem('pendingStripeUrl');
    sessionStorage.removeItem('pendingStripeType');
    sessionStorage.removeItem('pendingStripeInitiatedAt');

    refreshSubscription().then(() => {
      if (subscribed === 'true') {
        // subscription-success sound fires via StreakContext isPremium transition watcher
      } else if (purchased) {
        // §8.18.3: play purchase-success sound after OTP purchase
        SoundService.play('purchase-success');
        toast.success(t('otp.success_toast', 'Purchase complete!'));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = subscription?.status ?? 'none';
  const isPremium = subscription?.is_premium ?? false;
  const plan = subscription?.plan ?? '';
  const periodEnd = subscription?.period_end ?? null;
  const canceledAt = subscription?.canceled_at ?? null;
  const ownedKeys = subscription?.owned_purchase_keys ?? [];

  const handleCheckout = async () => {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    try { await startCheckout(planChoice); }
    catch (err: any) {
      const msg = err?.response?.data?.error ?? t('subscription.checkout_error', 'Could not start checkout. Please try again.');
      toast.error(msg);
    }
    finally { checkoutInFlight.current = false; }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try { await openPortal(); }
    catch (err: any) {
      setPortalLoading(false);
      const msg = err?.response?.data?.error ?? t('subscription.portal_error', 'Could not open subscription portal. Please try again.');
      toast.error(msg);
    }
  };

  return (
    <div className={styles.page}>
      {/* Tutorial overlay */}
      {showTutorial && <ShopTutorial onDismiss={dismissTutorial} />}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.header} style={{ position: 'relative' }}>
        <h1 className={styles.title}>{t('shop.title')}</h1>
        <p className={styles.subtitle}>{t('shop.subtitle')}</p>
        <div className={styles.chipRow}>
          <BlessingsChip showZero />
        </div>
        <button
          className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          onClick={openTutorial}
          aria-label={t('common.help', 'Help')}
          title={t('common.help', 'Help')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {/* ── Premium hero card (free / non-premium users) ─────────────────── */}
      {!isPremium && status !== 'canceled' && status !== 'past_due' && (
        <div className={styles.premiumCard}>
          <div className={styles.premiumCardGlow} aria-hidden="true" />

          <div className={styles.premiumCardHeader}>
            <span className={styles.premiumCrownWrap}>
              <Crown size={36} weight="fill" className={styles.premiumCrownIcon} />
            </span>
            <h2 className={styles.premiumCardTitle}>
              {t('subscription.modal_title', 'Go Premium')}
            </h2>
            <p className={styles.premiumCardSubtitle}>
              {t('subscription.modal_subtitle', 'Deepen your daily practice')}
            </p>
          </div>

          <ul className={styles.premiumFeatures}>
            {PLAN_FEATURES.map(key => (
              <li key={key} className={styles.premiumFeatureItem}>
                <span className={styles.premiumCheck}>
                  <Check size={13} weight="bold" />
                </span>
                <span>{t(key, key)}</span>
              </li>
            ))}
          </ul>

          <div className={styles.planToggle} role="radiogroup" aria-label={t('subscription.choose_plan', 'Choose plan')}>
            <label className={`${styles.planOption}${planChoice === 'monthly' ? ` ${styles.planOptionActive}` : ''}`}>
              <input
                type="radio"
                name="shop-plan"
                value="monthly"
                checked={planChoice === 'monthly'}
                onChange={() => setPlanChoice('monthly')}
                className="sr-only"
              />
              <span className={styles.planName}>{t('subscription.plan.monthly', 'Monthly')}</span>
              <span className={styles.planPrice}>{t('subscription.plan.monthly_price', '$2.99 / mo')}</span>
            </label>
            <label className={`${styles.planOption}${planChoice === 'annual' ? ` ${styles.planOptionActive}` : ''}`}>
              <input
                type="radio"
                name="shop-plan"
                value="annual"
                checked={planChoice === 'annual'}
                onChange={() => setPlanChoice('annual')}
                className="sr-only"
              />
              <div className={styles.planNameRow}>
                <span className={styles.planName}>{t('subscription.plan.annual', 'Annual')}</span>
                <span className={styles.planBestValue}>{t('subscription.plan.annual_save', 'Save 17%')}</span>
              </div>
              <span className={styles.planPrice}>{t('subscription.plan.annual_price', '$29.99 / yr')}</span>
            </label>
          </div>

          <button
            className={styles.premiumCta}
            onClick={handleCheckout}
            disabled={subscriptionLoading}
          >
            <Crown size={18} weight="fill" />
            {t('subscription.upgrade_cta', 'Upgrade to Premium')}
          </button>

          <p className={styles.premiumLegal}>
            {t('subscription.modal_legal', 'Cancel anytime. No hidden fees.')}
          </p>
        </div>
      )}

      {/* ── Active premium status card ───────────────────────────────────── */}
      {isPremium && !canceledAt && (
        <div className={styles.activeCard}>
          <Crown size={20} weight="fill" className={styles.activeCardCrown} />
          <div className={styles.activeCardBody}>
            <p className={styles.activeCardTitle}>
              {t('subscription.active_title', 'Premium Member')}
            </p>
            <p className={styles.activeCardMeta}>
              {t('subscription.active_plan', 'Plan:')} <strong>{t(`subscription.plan.${plan}`, plan)}</strong>
              {periodEnd && (
                <> · {t('subscription.renews', 'Renews')} {formatDate(periodEnd)}</>
              )}
            </p>
          </div>
          <button
            className={styles.manageBtn}
            onClick={handlePortal}
            disabled={portalLoading}
          >
            {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.manage', 'Manage')}
          </button>
        </div>
      )}

      {/* ── Canceled — still has access ─────────────────────────────────── */}
      {status === 'canceled' && (
        <div className={`${styles.activeCard} ${styles.activeCardCanceled}`}>
          <Crown size={20} weight="fill" className={styles.activeCardCrown} />
          <div className={styles.activeCardBody}>
            <p className={styles.activeCardTitle}>
              {t('subscription.canceled_title', 'Subscription Canceled')}
            </p>
            {periodEnd && (
              <p className={styles.activeCardMeta}>
                {t('subscription.access_until', 'Access until {{date}}', { date: formatDate(periodEnd) })}
              </p>
            )}
          </div>
          <button
            className={`${styles.manageBtn} ${styles.manageBtnPrimary}`}
            onClick={handlePortal}
            disabled={portalLoading}
          >
            {portalLoading ? t('subscription.loading', 'Loading…') : t('subscription.reactivate', 'Reactivate')}
          </button>
        </div>
      )}

      {/* ── Themes ──────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Palette size={18} weight="duotone" className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>{t('shop.themes_title', 'Themes')}</h2>
        </div>
        <ThemePicker />
      </section>

      {/* ── Add-ons ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Sparkle size={18} weight="duotone" className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>{t('otp.section_title', 'Add-ons & One-Time Purchases')}</h2>
          <p className={styles.sectionDesc}>{t('otp.section_description', 'Unlock individual features forever — no subscription required.')}</p>
        </div>
        <OneTimePurchaseSection ownedKeys={ownedKeys} hideHeader />
      </section>
    </div>
  );
};
