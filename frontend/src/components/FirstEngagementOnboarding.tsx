import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../contexts/StreakContext';
import { useAuth } from '../hooks/useAuth';

const FirstEngagementOnboarding: React.FC = () => {
  const { t } = useTranslation();
  const { streakData } = useStreak();
  const { isGuest } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [hasAppeared, setHasAppeared] = useState(false);

  useEffect(() => {
    // Don't show for guests
    if (isGuest) return;

    // Check if user has seen the intro
    const hasSeenIntro = localStorage.getItem('hasSeenStreakIntro') === 'true';
    
    if (hasSeenIntro || hasAppeared) return;

    // Show when user gets their first streak point
    if (streakData && streakData.current_streak === 1 && streakData.blessings_balance > 0) {
      // Delay appearance by 2 seconds to let user read the verse first
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAppeared(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [streakData, isGuest, hasAppeared]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenStreakIntro', 'true');
  };

  // Handle ESC key
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 animate-fade-in"
        onClick={handleDismiss}
      />
      
      {/* Onboarding card */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div 
            className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 
                       dark:from-amber-900/20 dark:to-yellow-900/20"
          >
            {/* Header with candle icon */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl" role="img" aria-label="candle">
                🕯
              </span>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('onboarding.title', 'Your journey begins')}
              </h2>
            </div>
            
            {/* Content */}
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                {t('onboarding.line1', 'Each day you open the Word, your streak grows.')}
              </p>
              <p>
                {t('onboarding.line2', 'Miss a day? Grace Days can preserve your streak.')}
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {t('onboarding.line3', 'Your faithfulness is worth honoring.')}
              </p>
            </div>
            
            {/* Features list */}
            <div className="mt-4 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.feature1', 'Earn Blessings by reading daily verses and adding reflections')}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.feature2', 'Achieve milestones as your streak grows')}
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-amber-500 mt-0.5">✦</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('onboarding.feature3', 'Track your spiritual journey in your profile')}
                </p>
              </div>
            </div>
            
            {/* Action button */}
            <div className="mt-6">
              <button
                onClick={handleDismiss}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 
                         hover:from-amber-600 hover:to-yellow-600
                         text-white font-semibold rounded-lg
                         transform transition-all duration-200 hover:scale-[1.02]
                         focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              >
                {t('onboarding.begin', 'Begin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirstEngagementOnboarding;