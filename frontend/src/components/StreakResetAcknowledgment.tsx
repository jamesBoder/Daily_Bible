import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../contexts/StreakContext';

const StreakResetAcknowledgment: React.FC = () => {
  const { t } = useTranslation();
  const { streakData } = useStreak();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!streakData || hasShown) return;

    // Check if we've stored a previous streak value
    const storedStreakKey = 'lastSeenStreak';
    const resetShownKey = 'streakResetShown';

    const lastSeenStreak = localStorage.getItem(storedStreakKey);
    const resetAlreadyShown = sessionStorage.getItem(resetShownKey) === 'true';

    if (resetAlreadyShown) {
      setHasShown(true);
      return;
    }

    // Only show reset message when streak has been reset to 0
    if (lastSeenStreak !== null) {
      const lastStreak = parseInt(lastSeenStreak, 10);
      if (lastStreak > 0 && streakData.current_streak === 0) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem(resetShownKey, 'true');

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }

    // Update stored streak value
    localStorage.setItem(storedStreakKey, String(streakData.current_streak));
  }, [streakData, hasShown]);

  if (!isVisible) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 mb-6">
      <div
        className="text-center py-4 px-5 rounded-2xl animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.35), rgba(234, 88, 12, 0.28))',
          border: '1px solid rgba(251, 146, 60, 0.7)',
          boxShadow: '0 2px 12px rgba(251, 146, 60, 0.25)',
        }}
      >
        <p className="text-sm font-bold animate-flash-text" style={{ color: '#ea580c' }}>
          {t('streak.resetMessage', 'Your streak has restarted — don\'t worry, start fresh!')}
        </p>
      </div>
    </div>
  );
};

export default StreakResetAcknowledgment;
