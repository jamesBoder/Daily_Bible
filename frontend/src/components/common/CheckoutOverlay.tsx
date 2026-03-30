import React from 'react';
import { useTranslation } from 'react-i18next';

interface CheckoutOverlayProps {
  visible: boolean;
  onCancel: () => void;
}

// §8.18.4 — Full-screen overlay shown while a Stripe checkout redirect is in flight.
// Covers the entire viewport (including safe areas) so the user cannot interact with
// anything behind it. A subtle Cancel link allows escape if the user changes their mind.
export const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ visible, onCancel }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div
      className="checkout-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t('subscription.checkout_overlay.label', 'Preparing checkout')}
    >
      <div className="checkout-overlay__card">
        {/* App wordmark */}
        <p className="checkout-overlay__brand">Words of Praise</p>

        {/* Spinner */}
        <div className="checkout-overlay__spinner" aria-hidden="true" />

        <p className="checkout-overlay__message">
          {t('subscription.checkout_overlay.message', 'Preparing your secure checkout\u2026')}
        </p>

        {/* Subtle cancel — not a prominent button */}
        <button
          className="checkout-overlay__cancel"
          onClick={onCancel}
          aria-label={t('common.cancel', 'Cancel')}
        >
          {t('common.cancel', 'Cancel')}
        </button>
      </div>
    </div>
  );
};
