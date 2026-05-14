import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api/client';

const STORAGE_KEY = 'visitorNudgeDismissed';
const SHOW_DELAY_MS = 4000;

const VisitorEngagementModal: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // ESC to dismiss
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isVisible]);

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleSignUp = () => {
    dismiss();
    navigate('/signup');
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await apiClient.post('/api/subscribe', { email: email.trim() });
      setStatus('success');
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (err: any) {
      const msg = err.response?.data?.error || t('visitor.emailError', 'Something went wrong. Please try again.');
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md animate-slide-from-top max-h-[calc(100dvh-8rem)] sm:max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-3xl">
          <div className="bg-[var(--theme-surface)] shadow-2xl overflow-hidden border border-amber-200/60 dark:border-amber-700/40 rounded-3xl">
            <div className="p-6 sm:p-7 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50
                           dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-orange-900/20">

              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-4xl" role="img" aria-label="open book">📖</span>
                <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                  {t('visitor.title', 'Stay in the Word')}
                </h2>
              </div>

              <p className="text-[var(--journal-text-muted)] text-sm leading-relaxed mb-5">
                {t('visitor.body', 'Get a new verse in your inbox every morning — or create a free account to track your streak, save favorites, and unlock the full experience.')}
              </p>

              {status === 'success' ? (
                /* ── Success state ── */
                <div className="text-center py-4 space-y-3">
                  <span className="text-4xl" role="img" aria-label="check">✅</span>
                  <p className="font-semibold text-[var(--foreground)]">
                    {t('visitor.successTitle', "You're on the list!")}
                  </p>
                  <p className="text-sm text-[var(--journal-text-muted)]">
                    {t('visitor.successBody', 'Check your inbox for a welcome email.')}
                  </p>
                  <button
                    onClick={dismiss}
                    className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    {t('visitor.continue', 'Continue reading')}
                  </button>
                </div>
              ) : (
                <>
                  {/* ── Email capture ── */}
                  <form onSubmit={handleSubscribe} className="space-y-2 mb-4">
                    <label className="block text-xs font-semibold text-[var(--journal-text-muted)] uppercase tracking-wide mb-1">
                      {t('visitor.emailLabel', 'Daily verse by email')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                        placeholder={t('visitor.emailPlaceholder', 'your@email.com')}
                        required
                        className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--theme-border)] bg-[var(--journal-surface)] text-sm text-[var(--foreground)] placeholder-[var(--journal-text-muted)] focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-sm font-semibold transition-colors disabled:opacity-60 shrink-0"
                      >
                        {status === 'loading'
                          ? t('visitor.subscribing', 'Sending…')
                          : t('visitor.subscribe', 'Subscribe')}
                      </button>
                    </div>
                    {status === 'error' && (
                      <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
                    )}
                  </form>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[var(--theme-border)]" />
                    <span className="text-xs text-[var(--journal-text-muted)] font-medium">
                      {t('visitor.or', 'or')}
                    </span>
                    <div className="flex-1 h-px bg-[var(--theme-border)]" />
                  </div>

                  {/* ── Sign up CTA ── */}
                  <button
                    onClick={handleSignUp}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500
                             hover:from-amber-600 hover:to-yellow-600
                             text-white font-semibold rounded-2xl
                             transform transition-all duration-200 hover:scale-[1.02]
                             focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-200 focus:ring-offset-2
                             shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30"
                  >
                    {t('visitor.signUp', 'Create a free account')}
                  </button>

                  {/* ── Dismiss ── */}
                  <button
                    onClick={dismiss}
                    className="w-full mt-3 py-2 text-sm font-medium text-[var(--journal-text-muted)]
                             hover:opacity-100 transition-colors"
                  >
                    {t('visitor.maybeLater', 'Maybe later')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VisitorEngagementModal;
