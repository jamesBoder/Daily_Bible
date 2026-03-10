import React from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useTranslation } from 'react-i18next';

const StreakCandle: React.FC = () => {
  const { streakData } = useStreak();
  const { t } = useTranslation();

  // Don't show if no streak
  if (!streakData || streakData.current_streak < 1) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg
                    bg-gradient-to-r from-orange-50 to-amber-50 
                    dark:from-orange-900/20 dark:to-amber-900/20
                    border border-orange-200 dark:border-orange-800
                    hover:shadow-md transition-all duration-200">
      {/* Candle icon with flicker animation */}
      <div className="relative">
        <svg
          className="w-5 h-5 text-orange-500 dark:text-orange-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C11.45 2 11 2.45 11 3V15C11 15.55 11.45 16 12 16C12.55 16 13 15.55 13 15V3C13 2.45 12.55 2 12 2Z" />
          <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
        </svg>
        {/* Flame */}
        <div 
          className="absolute -top-1 left-1/2 transform -translate-x-1/2
                     w-2 h-3 bg-gradient-to-t from-yellow-400 to-orange-400
                     rounded-full animate-flicker"
          style={{
            filter: 'blur(0.5px)',
            animation: 'flicker 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Streak count */}
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        {streakData.current_streak}
      </span>

      {/* Tooltip on hover */}
      <div className="group relative">
        <span className="sr-only">
          {t('streak.tooltip', 'Day {{count}} streak', { count: streakData.current_streak })}
        </span>
      </div>
    </div>
  );
};

export default StreakCandle;