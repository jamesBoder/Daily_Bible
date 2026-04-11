import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Crown, Check, Palette, Sparkle, Infinity } from '@phosphor-icons/react';
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
  'subscription.feature.reading_plans',
  'subscription.feature.annotations',
  'subscription.feature.saved_searches',
  'subscription.feature.all_themes',
  'subscription.feature.journal',
  'subscription.feature.prompts',
  'subscription.feature.translations',
  'subscription.feature.streak_calendar',
  'subscription.feature.blessings_multiplier',
  'subscription.feature.reflection_archive',
  'subscription.feature.future_content',
];

export const RewardsShop: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const {
    subscription, subscriptionLoading,
    startOneTimePurchase, refreshSubscription, refreshStreak,
  } = useStreak();
  // §8.18.1: prevent double-tap before overlay appears
  const checkoutInFlight = useRef(false);
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(SHOP_TUTORIAL_KEY);

  // Handle Stripe return (?purchased=<key>)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const purchased = params.get('purchased');
    if (!purchased) return;

    window.history.replaceState({}, '', location.pathname);
    sessionStorage.removeItem('pendingStripeUrl');
    sessionStorage.removeItem('pendingStripeType');
    sessionStorage.removeItem('pendingStripeInitiatedAt');

    refreshSubscription().then(() => {
      refreshStreak().catch(() => {});
      // §8.18.3: premium_lifetime fires welcome ceremony via StreakContext isPremium watcher;
      // all other OTP purchases play the generic success sound.
      if (purchased !== 'premium_lifetime') {
        SoundService.play('purchase-success');
        toast.success(t('otp.success_toast', 'Purchase complete!'));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPremium = subscription?.is_premium ?? false;
  const ownedKeys = subscription?.owned_purchase_keys ?? [];

  const handleLifetimeCheckout = async () => {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    try { await startOneTimePurchase('premium_lifetime'); }
    catch (err: any) {
      const msg = err?.response?.data?.error ?? t('subscription.checkout_error', 'Could not start checkout. Please try again.');
      toast.error(msg);
    }
    finally { checkoutInFlight.current = false; }
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

      {/* ── Lifetime member status card ──────────────────────────────────── */}
      {isPremium && (
        <div className={styles.activeCard}>
          <Infinity size={20} weight="bold" className={styles.activeCardCrown} />
          <div className={styles.activeCardBody}>
            <p className={styles.activeCardTitle}>
              {t('subscription.lifetime_title', 'Lifetime Member')}
            </p>
            <p className={styles.activeCardMeta}>
              {t('subscription.lifetime_meta', 'All features unlocked — yours forever, including future content.')}
            </p>
          </div>
        </div>
      )}

      {/* ── Lifetime offer card (free users) ────────────────────────────── */}
      {!isPremium && (
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
              {t('subscription.modal_subtitle', 'One payment. Yours forever.')}
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

          <div className={styles.lifetimePricing}>
            <span className={styles.lifetimeOriginalPrice}>$12.99</span>
            <span className={styles.lifetimeSalePrice}>$9.99</span>
            <span className={styles.lifetimeBadge}>{t('subscription.launch_offer', 'Launch offer')}</span>
          </div>

          <button
            className={styles.premiumCta}
            onClick={handleLifetimeCheckout}
            disabled={subscriptionLoading}
          >
            <Crown size={18} weight="fill" />
            {t('subscription.upgrade_cta', 'Unlock Premium')}
          </button>

          <p className={styles.premiumLegal}>
            {t('subscription.modal_legal', 'One-time payment. No subscription. Future content included.')}
          </p>
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
