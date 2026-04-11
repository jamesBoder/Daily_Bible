import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Crown, Star, BookOpen, Palette, Calendar, Scroll } from '@phosphor-icons/react';
import { usePricingModal } from '../../hooks/usePricingModal';
import { useStreak } from '../../contexts/StreakContext';
import { FocusTrap } from './FocusTrap';
import { useSwipe } from '../../hooks/useSwipe';

const PLAN_FEATURES: string[] = [
  'subscription.feature.all_themes',
  'subscription.feature.journal',
  'subscription.feature.prompts',
  'subscription.feature.translations',
  'subscription.feature.streak_calendar',
  'subscription.feature.blessings_multiplier',
  'subscription.feature.reflection_archive',
];

const FEATURE_ICONS: React.ReactNode[] = [
  <Palette size={18} weight="duotone" key="palette" />,
  <BookOpen size={18} weight="duotone" key="journal" />,
  <Star size={18} weight="duotone" key="prompts" />,
  <Scroll size={18} weight="duotone" key="translations" />,
  <Calendar size={18} weight="duotone" key="calendar" />,
  <Crown size={18} weight="duotone" key="blessings" />,
  <BookOpen size={18} weight="duotone" key="reflections" />,
];

const OTP_MODAL_ITEMS = [
  { key: 'journal_unlock',      titleKey: 'otp.journal_unlock.title',      priceKey: 'otp.journal_unlock.price' },
  { key: 'reflection_archive',  titleKey: 'otp.reflection_archive.title',  priceKey: 'otp.reflection_archive.price' },
  { key: 'modern_translations', titleKey: 'otp.modern_translations.title', priceKey: 'otp.modern_translations.price' },
  { key: 'grace_day_pack',      titleKey: 'otp.grace_day_pack.title',      priceKey: 'otp.grace_day_pack.price' },
  { key: 'full_theme_library',  titleKey: 'otp.full_theme_library.title',  priceKey: 'otp.full_theme_library.price' },
  { key: 'theme_sanctuary',     titleKey: 'otp.theme_sanctuary.title',     priceKey: 'otp.theme_sanctuary.price' },
  { key: 'theme_desert_sand',   titleKey: 'otp.theme_desert_sand.title',   priceKey: 'otp.theme_desert_sand.price' },
  { key: 'theme_celestial',     titleKey: 'otp.theme_celestial.title',     priceKey: 'otp.theme_celestial.price' },
  { key: 'theme_scarlet_grace', titleKey: 'otp.theme_scarlet_grace.title', priceKey: 'otp.theme_scarlet_grace.price' },
  { key: 'premium_badges',      titleKey: 'otp.premium_badges.title',      priceKey: 'otp.premium_badges.price' },
  { key: 'support_developer',   titleKey: 'otp.support_developer.title',   priceKey: 'otp.support_developer.price' },
];

// Duration must match the CSS exit animations (pricing-panel-exit / pricing-overlay-exit).
const CLOSE_ANIMATION_MS = 200;

export const PricingModal: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, initialView, closeModal } = usePricingModal();
  const { startCheckout, subscriptionLoading, startOneTimePurchase, subscription } = useStreak();
  const [planChoice, setPlanChoice] = useState<'monthly' | 'annual'>('annual');
  const [view, setView] = useState<'plans' | 'otp'>(initialView);
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  // §8.18.1: prevent double-tap before overlay appears
  const checkoutInFlight = useRef(false);

  // Animated close: play exit animation then remove from DOM.
  const handleClose = useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      closeModal();
      return;
    }
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);
  }, [closeModal]);

  // Sync view when the modal is re-opened with a different initialView
  useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Swipe down on the modal panel closes it on mobile
  const swipeHandlers = useSwipe({ onSwipeDown: handleClose });

  if (!isOpen && !isClosing) return null;

  const handleCheckout = async () => {
    if (checkoutInFlight.current) return;
    checkoutInFlight.current = true;
    try {
      await startCheckout(planChoice);
    } catch {
      // redirect in progress or cancelled
    } finally {
      checkoutInFlight.current = false;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) handleClose();
  };

  return (
    <div
      className={`pricing-modal-overlay${isClosing ? ' pricing-modal-overlay--closing' : ''}`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={t('subscription.modal_label', 'Premium subscription')}
    >
      <FocusTrap active={true}>
        <div className={`pricing-modal${isClosing ? ' pricing-modal--closing' : ''}`} {...swipeHandlers}>
          {/* Mobile bottom-sheet drag handle */}
          <div className="pricing-modal__drag-handle" aria-hidden="true" />

          <button
            className="pricing-modal__close"
            onClick={handleClose}
            aria-label={t('common.close', 'Close')}
          >
            <X size={20} weight="bold" />
          </button>

          <div className="pricing-modal__header">
            <Crown size={32} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
            <h2 className="pricing-modal__title">
              {view === 'plans'
                ? t('subscription.modal_title', 'Go Premium')
                : t('otp.section_title', 'Add-ons')}
            </h2>
          </div>

          {/* Tab switcher */}
          <div className="pricing-modal__tabs" role="tablist">
            <button
              role="tab"
              aria-selected={view === 'plans'}
              className={`pricing-modal__tab${view === 'plans' ? ' pricing-modal__tab--active' : ''}`}
              onClick={() => setView('plans')}
            >
              {t('subscription.title', 'Premium')}
            </button>
            <button
              role="tab"
              aria-selected={view === 'otp'}
              className={`pricing-modal__tab${view === 'otp' ? ' pricing-modal__tab--active' : ''}`}
              onClick={() => setView('otp')}
            >
              {t('subscription.view_addons', 'Add-ons')}
            </button>
          </div>

          {view === 'plans' && (
            <div className="pricing-modal__tab-content">
              <ul className="pricing-modal__features">
                {PLAN_FEATURES.map((key, i) => (
                  <li key={key} className="pricing-modal__feature">
                    <span className="pricing-modal__feature-icon">{FEATURE_ICONS[i]}</span>
                    {t(key, key)}
                  </li>
                ))}
              </ul>

              <div className="pricing-modal__plans" role="radiogroup" aria-label={t('subscription.choose_plan', 'Choose plan')}>
                <label className={`pricing-modal__plan${planChoice === 'monthly' ? ' pricing-modal__plan--selected' : ''}`}>
                  <input
                    type="radio"
                    name="pricing-plan"
                    value="monthly"
                    checked={planChoice === 'monthly'}
                    onChange={() => setPlanChoice('monthly')}
                    className="sr-only"
                  />
                  <span className="pricing-modal__plan-name">{t('subscription.plan.monthly', 'Monthly')}</span>
                  <span className="pricing-modal__plan-price">{t('subscription.plan.monthly_price', '$2.99 / mo')}</span>
                </label>

                <label className={`pricing-modal__plan${planChoice === 'annual' ? ' pricing-modal__plan--selected' : ''}`}>
                  <input
                    type="radio"
                    name="pricing-plan"
                    value="annual"
                    checked={planChoice === 'annual'}
                    onChange={() => setPlanChoice('annual')}
                    className="sr-only"
                  />
                  <span className="pricing-modal__plan-name">{t('subscription.plan.annual', 'Annual')}</span>
                  <span className="pricing-modal__plan-price">{t('subscription.plan.annual_price', '$29.99 / yr')}</span>
                  <span className="pricing-modal__plan-badge">{t('subscription.plan.annual_save', 'Save 17%')}</span>
                </label>
              </div>

              <button
                className="pricing-modal__cta"
                onClick={handleCheckout}
                disabled={subscriptionLoading}
              >
                <Crown size={18} weight="fill" />
                {t('subscription.upgrade_cta', 'Upgrade to Premium')}
              </button>

              <p className="pricing-modal__legal">
                {t('subscription.modal_legal', 'Cancel anytime. No hidden fees.')}
              </p>
            </div>
          )}

          {view === 'otp' && (
            <div className="pricing-modal__tab-content pricing-modal__otp-list">
              {OTP_MODAL_ITEMS.map(item => {
                const isOwned = (subscription?.owned_purchase_keys ?? []).includes(item.key);
                return (
                  <div key={item.key} className={`pricing-modal__otp-item${isOwned ? ' pricing-modal__otp-item--owned' : ''}`}>
                    <span className="pricing-modal__otp-item-name">{t(item.titleKey, item.key)}</span>
                    {isOwned ? (
                      <span className="otp-card__owned-badge">{t('otp.owned', 'Owned')}</span>
                    ) : (
                      <button
                        className="pricing-modal__otp-buy"
                        onClick={() => startOneTimePurchase(item.key)}
                      >
                        {t(item.priceKey, 'Buy')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  );
};
