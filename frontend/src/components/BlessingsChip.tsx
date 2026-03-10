import React, { useState, useEffect } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useTranslation } from 'react-i18next';

const BlessingsChip: React.FC = () => {
  const { streakData } = useStreak();
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);
  const [hasShownExplanation, setHasShownExplanation] = useState(false);

  useEffect(() => {
    // Check localStorage for first-time explanation
    const explained = localStorage.getItem('blessings_explained');
    if (explained) {
      setHasShownExplanation(true);
    }
  }, []);

  const handleClick = () => {
    if (!hasShownExplanation) {
      setShowPopover(true);
      localStorage.setItem('blessings_explained', 'true');
      setHasShownExplanation(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowPopover(false);
      }, 5000);
    } else {
      setShowPopover(!showPopover);
    }
  };

  // Don't show if no blessings
  if (!streakData || streakData.blessings_balance === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg
                   bg-gradient-to-r from-yellow-50 to-amber-50 
                   dark:from-yellow-900/20 dark:to-amber-900/20
                   border border-yellow-300 dark:border-yellow-700
                   hover:shadow-md transition-all duration-200
                   cursor-pointer"
        aria-label={t('blessings.balance', 'Blessings balance')}
      >
        {/* Blessing icon */}
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>

        {/* Balance */}
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {streakData.blessings_balance}
        </span>
      </button>

      {/* Popover */}
      {showPopover && (
        <div className="absolute top-full mt-2 right-0 z-50 w-64 p-4
                        bg-white dark:bg-gray-800 rounded-lg shadow-xl
                        border border-gray-200 dark:border-gray-700
                        animate-fade-in">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {t('blessings.popover.title', 'Blessings')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t(
                'blessings.popover.description',
                'Earn Blessings by engaging with daily verses, adding reflections, and maintaining your streak. Use them in the Rewards Shop (coming soon) to unlock themes and features!'
              )}
            </p>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t('blessings.popover.balance', 'Current balance: {{count}}', {
                  count: streakData.blessings_balance,
                })}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowPopover(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600
                       dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default BlessingsChip;