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

    // If we have a stored streak and current is lower (and not 0), show reset message
    if (lastSeenStreak !== null) {
      const lastStreak = parseInt(lastSeenStreak, 10);
      if (lastStreak > streakData.current_streak && streakData.current_streak > 0) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem(resetShownKey, 'true');
        
        // Auto-hide after 4 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 4000);

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
        className="text-center py-3 px-4 rounded-lg animate-fade-in"
        style={{
          color: 'rgba(232, 150, 58, 0.9)',
          backgroundColor: 'rgba(232, 150, 58, 0.05)',
        }}
      >
        <p className="text-sm font-medium">
          {t('streak.resetMessage', 'Your streak has restarted. Every day is a new beginning.')}
        </p>
      </div>
    </div>
  );
};

export default StreakResetAcknowledgment;