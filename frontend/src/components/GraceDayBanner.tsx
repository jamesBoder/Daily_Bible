import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../contexts/StreakContext';
import { toast } from 'react-hot-toast';

const GraceDayBanner: React.FC = () => {
  const { t } = useTranslation();
  const { streakData, useGraceDay: applyGraceDay } = useStreak();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('graceDayBannerDismissed') === 'true';
    setIsDismissed(wasDismissed);
  }, []);

  // Slide in after a short delay, then auto-dismiss after 9 seconds
  useEffect(() => {
    if (!isDismissed && streakData?.streak_recoverable) {
      const showTimer = setTimeout(() => setIsVisible(true), 400);
      const hideTimer = setTimeout(() => handleDismiss(), 9400); // 400ms delay + 9s visible
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDismissed, streakData?.streak_recoverable]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem('graceDayBannerDismissed', 'true');
    }, 280);
  };

  const handleUseGraceDay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const result = await applyGraceDay();
    if (result.success) {
      toast.success(
        t('graceDay.success', 'Grace Day used — your streak is preserved.'),
        { duration: 4000, style: { background: '#9B8FC4', color: '#fff' } }
      );
      handleDismiss();
    } else {
      toast.error(
        t(`graceDay.errors.${result.error}`, result.error || 'Failed to use grace day'),
        { duration: 4000 }
      );
    }
    setIsProcessing(false);
  };

  if (!streakData || !streakData.streak_recoverable || isDismissed) {
    return null;
  }

  return (
    <div
      className={`fixed top-[68px] left-3 right-3 z-40
                  transition-all duration-300 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}
      style={{ maxWidth: 480, margin: '0 auto' }}
    >
      <div
        className="relative rounded-xl shadow-lg border-l-4 border-purple-400
                   dark:border-purple-500 p-3"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Top row: icon + message + close */}
        <div className="flex items-start gap-2">
          <span className="text-base flex-shrink-0 mt-px" role="img" aria-label="dove">🕊</span>
          <p className="text-xs text-gray-700 flex-1 leading-snug">
            {t(
              'graceDay.banner.message',
              'Missed yesterday? Preserve your {{current_streak}}-day streak with a Grace Day.',
              { current_streak: streakData.current_streak }
            )}
          </p>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-0.5"
            aria-label={t('common.close', 'Close')}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Bottom row: actions */}
        <div className="mt-2 flex items-center gap-2 pl-6">
          <button
            onClick={handleUseGraceDay}
            disabled={isProcessing}
            className="px-3 py-1 bg-purple-500 hover:bg-purple-600
                       text-white rounded-md font-medium text-xs
                       transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1"
          >
            {isProcessing
              ? t('graceDay.banner.processing', 'Processing...')
              : t('graceDay.banner.useGraceDay', 'Use Grace Day')}
          </button>

          <button
            onClick={handleDismiss}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t('graceDay.banner.notNow', 'Not now')}
          </button>

          <span className="ml-auto text-xs text-gray-400">
            {streakData.grace_days_remaining}× left
          </span>
        </div>
      </div>
    </div>
  );
};

export default GraceDayBanner;
