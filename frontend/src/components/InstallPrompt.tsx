import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { X } from '@phosphor-icons/react';

/**
 * Slide-up banner that appears after the user has viewed the daily verse
 * INSTALL_TRIGGER_VIEWS times, nudging them to install the PWA.
 * Shown only on Android/Chrome where beforeinstallprompt fires.
 * iOS users get the native "Add to Home Screen" flow via the manifest.
 */
export const InstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      role="dialog"
      aria-label={t('pwa.install.label', 'Install app prompt')}
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)', // clears BottomNav
        left: '1rem',
        right: '1rem',
        zIndex: 50,
        background: 'var(--header-bg)',
        border: '1px solid var(--candle-amber)',
        borderRadius: 16,
        padding: '1rem 1rem 1rem 1.1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(120%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'var(--candle-amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
        }}
      >
        ✝
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>
          {t('pwa.install.title', 'Add to Home Screen')}
        </p>
        <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--grace-lavender)' }}>
          {t('pwa.install.subtitle', 'Open instantly, even offline.')}
        </p>
      </div>

      {/* Install button */}
      <button
        onClick={install}
        style={{
          flexShrink: 0,
          padding: '0.45rem 0.9rem',
          borderRadius: 20,
          background: 'var(--candle-amber)',
          color: '#1a1208',
          border: 'none',
          fontWeight: 700,
          fontSize: '0.82rem',
          cursor: 'pointer',
        }}
      >
        {t('pwa.install.cta', 'Install')}
      </button>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        aria-label={t('common.dismiss', 'Dismiss')}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: 'var(--grace-lavender)',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={16} weight="bold" />
      </button>
    </div>
  );
};
