import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from '@phosphor-icons/react';
import { usePricingModal } from '../../hooks/usePricingModal';

interface LockedFeatureCardProps {
  /** Short description of what the user will unlock */
  featureDescription: string;
  className?: string;
}

/**
 * Reusable placeholder shown when a premium feature is not available to the current user.
 * Shows a lock icon, a feature description, and a "Go Premium" CTA that opens PricingModal.
 */
export const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({
  featureDescription,
  className = '',
}) => {
  const { t } = useTranslation();
  const { openModal } = usePricingModal();

  return (
    <div
      className={`locked-feature-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px dashed var(--grace-lavender)',
        background: 'var(--theme-surface)',
        textAlign: 'center',
      }}
    >
      <Lock
        size={28}
        weight="duotone"
        style={{ color: 'var(--grace-lavender)' }}
        aria-hidden="true"
      />
      <p style={{ color: 'var(--foreground)', margin: 0, fontSize: '0.95rem' }}>
        {featureDescription}
      </p>
      <button
        onClick={() => openModal('plans')}
        className="btn btn-primary btn-sm"
        style={{ marginTop: '0.25rem' }}
      >
        {t('premium.go_premium', 'Go Premium')}
      </button>
    </div>
  );
};
