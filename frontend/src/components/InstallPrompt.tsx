import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInstallPromptContext } from '../contexts/InstallPromptContext';
import { useStreak } from '../contexts/StreakContext';
import { X, ShareNetwork, PlusSquare } from '@phosphor-icons/react';

/**
 * Two prompts in one component, both gated behind the user earning their first
 * streak point (current_streak >= 1) — the moment they've demonstrated intent.
 *
 * Android/Chrome: compact slide-up banner that calls the native beforeinstallprompt.
 *   Dismissal is session-scoped (sessionStorage) so it can resurface next visit.
 *
 * iOS Safari: full modal with backdrop and 3-step "Share → Add to Home Screen" guide.
 *   beforeinstallprompt never fires on iOS, so users need explicit instructions.
 *   Dismissal is permanent (localStorage). Can be re-triggered from Settings.
 */
export const InstallPrompt: React.FC = () => {
  const { t } = useTranslation();
  const { canInstall, isIOS, isInstalled, install, dismiss, iosGuideDismissed, dismissIOSGuide } =
    useInstallPromptContext();
  const { streakData } = useStreak();

  const hasFirstStreak = (streakData?.current_streak ?? 0) >= 1;

  const showAndroid = canInstall && hasFirstStreak;
  const showIOS = isIOS && !isInstalled && !iosGuideDismissed && hasFirstStreak;

  if (!showAndroid && !showIOS) return null;

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(120%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* ── Android/Chrome native install banner ────────────────────────── */}
      {showAndroid && (
        <div
          role="dialog"
          aria-label={t('pwa.install.label', 'Install app prompt')}
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
            animation: 'slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <div
            aria-hidden
            style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: 10,
              background: 'var(--candle-amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem',
            }}
          >✝</div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--foreground)' }}>
              {t('pwa.install.title', 'Add to Home Screen')}
            </p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.78rem', color: 'var(--grace-lavender)' }}>
              {t('pwa.install.subtitle', 'Open instantly, even offline.')}
            </p>
          </div>

          <button
            onClick={install}
            style={{
              flexShrink: 0, padding: '0.45rem 0.9rem', borderRadius: 20,
              background: 'var(--candle-amber)', color: '#1a1208',
              border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
            }}
          >
            {t('pwa.install.cta', 'Install')}
          </button>

          <button
            onClick={dismiss}
            aria-label={t('common.dismiss', 'Dismiss')}
            style={{
              flexShrink: 0, background: 'none', border: 'none',
              color: 'var(--grace-lavender)', cursor: 'pointer',
              padding: '0.25rem', display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* ── iOS Safari install guide — full modal with backdrop ─────────── */}
      {showIOS && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={dismissIOSGuide}
          />

          {/* Modal — pt-16 clears the h-14 sticky header; max-h accounts for bottom nav */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm animate-slide-from-top max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl">
              <div className="bg-[var(--theme-surface)] shadow-2xl overflow-hidden border border-amber-200/60 dark:border-amber-700/40 rounded-3xl">
                <div className="p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/20">

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl" role="img" aria-label="phone">📱</span>
                      <div>
                        <h2 className="text-lg font-semibold text-[var(--foreground)] leading-tight">
                          {t('pwa.iosGuide.title', 'Add to Your Home Screen')}
                        </h2>
                        <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
                          {t('pwa.iosGuide.subtitle', 'Open instantly, even offline.')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={dismissIOSGuide}
                      aria-label={t('common.dismiss', 'Dismiss')}
                      className="flex-shrink-0 p-1.5 rounded-full text-[var(--journal-text-muted)] hover:opacity-100 hover:bg-[var(--theme-surface)] transition-colors ml-2"
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>

                  {/* Steps */}
                  <ol className="space-y-3 mb-5">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                      <span className="text-sm text-[var(--foreground)]">
                        {t('pwa.settings.iosStep1', 'Tap the')}{' '}
                        <ShareNetwork size={14} weight="bold" className="inline align-middle text-blue-500" />{' '}
                        <strong>{t('pwa.settings.iosStep1Share', 'Share')}</strong>{' '}
                        {t('pwa.settings.iosStep1After', 'button at the bottom of Safari')}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                      <span className="text-sm text-[var(--foreground)]">
                        {t('pwa.settings.iosStep2', 'Scroll down and tap')}{' '}
                        <PlusSquare size={14} weight="bold" className="inline align-middle text-blue-500" />{' '}
                        <strong>{t('pwa.settings.iosStep2AddToHome', '"Add to Home Screen"')}</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
                      <span className="text-sm text-[var(--foreground)]">
                        {t('pwa.settings.iosStep3', 'Tap')}{' '}
                        <strong>{t('pwa.settings.iosStep3Add', '"Add"')}</strong>{' '}
                        {t('pwa.settings.iosStep3After', 'in the top-right corner')}
                      </span>
                    </li>
                  </ol>

                  {/* CTA */}
                  <button
                    onClick={dismissIOSGuide}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold rounded-2xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
                  >
                    {t('pwa.iosGuide.gotIt', 'Got it')}
                  </button>

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
