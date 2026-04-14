import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X } from '@phosphor-icons/react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useInstallPromptContext } from '../contexts/InstallPromptContext';
import { useStreak } from '../contexts/StreakContext';

const DISMISSED_KEY = 'push_prompt_dismissed';

/**
 * Compact slide-up banner that prompts the user to enable push notifications.
 * Triggers after the user earns their first streak point (current_streak >= 1),
 * confirming intent. Only shown when:
 *   - browser supports Web Push
 *   - user is not already subscribed
 *   - permission hasn't been denied
 *   - user hasn't dismissed this prompt before
 *   - the PWA install banner is not showing (avoid stacking banners)
 */
export const PushPrompt: React.FC = () => {
  const { t } = useTranslation();
  const { isSupported, permission, subscribed, loading, subscribe } = usePushNotifications();
  const { canInstall } = useInstallPromptContext();
  const { streakData } = useStreak();

  const [dismissed, setDismissed] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY) === 'true'
  );

  // Re-check localStorage on mount in case it was set during this session.
  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISSED_KEY) === 'true');
  }, []);

  const hasFirstStreak = (streakData?.current_streak ?? 0) >= 1;

  const show =
    isSupported &&
    !subscribed &&
    permission !== 'denied' &&
    !dismissed &&
    hasFirstStreak &&
    !canInstall; // don't stack on top of the install banner

  if (!show) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  const handleEnable = async () => {
    await subscribe();
    // If permission was granted, the banner will disappear because subscribed → true.
    // If the user denied, hide the banner permanently so we don't keep asking.
    if (Notification.permission === 'denied') {
      handleDismiss();
    }
  };

  return (
    <>
      <style>{`
        @keyframes pushPromptSlideUp {
          from { transform: translateY(120%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <div
        role="dialog"
        aria-label={t('push.prompt.label', 'Enable push notifications prompt')}
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom) + 4.5rem)',
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
          animation: 'pushPromptSlideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        {/* Bell icon badge */}
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
          }}
        >
          <Bell size={20} weight="fill" color="#1a1208" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>
            {t('push.prompt.title', 'Never miss a day')}
          </p>
          <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--grace-lavender)' }}>
            {t('push.prompt.subtitle', 'Get a daily verse reminder on your device.')}
          </p>
        </div>

        {/* Enable button */}
        <button
          onClick={handleEnable}
          disabled={loading}
          style={{
            flexShrink: 0,
            padding: '0.45rem 0.9rem',
            borderRadius: 20,
            background: loading ? 'var(--grace-lavender)' : 'var(--candle-amber)',
            color: '#1a1208',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? t('push.prompt.enabling', 'Enabling…')
            : t('push.prompt.cta', 'Enable')}
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
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
    </>
  );
};
