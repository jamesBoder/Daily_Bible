import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface BlessingsToastItem {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
}

interface BlessingsToastProps {
  // This component will be used by other components to show blessing notifications
}

// Global toast queue management
let toastQueue: BlessingsToastItem[] = [];
let addToastCallback: ((toast: BlessingsToastItem) => void) | null = null;

// Export function to add toasts from anywhere in the app
export const showBlessingsToast = (amount: number, reason: string) => {
  const newToast: BlessingsToastItem = {
    id: `${Date.now()}-${Math.random()}`,
    amount,
    reason,
    timestamp: Date.now(),
  };

  // Check for duplicate within 5 seconds
  const isDuplicate = toastQueue.some(
    (toast) =>
      toast.reason === reason &&
      toast.amount === amount &&
      Date.now() - toast.timestamp < 5000
  );

  if (isDuplicate) return;

  // Cap queue at 3 items
  if (toastQueue.length >= 3) {
    toastQueue.shift();
  }

  toastQueue.push(newToast);

  if (addToastCallback) {
    addToastCallback(newToast);
  }
};

const BlessingsToast: React.FC<BlessingsToastProps> = () => {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<BlessingsToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    toastQueue = toastQueue.filter((toast) => toast.id !== id);
  }, []);

  useEffect(() => {
    // Register callback for adding toasts
    addToastCallback = (toast: BlessingsToastItem) => {
      setToasts((prev) => [...prev, toast]);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
    };

    return () => {
      addToastCallback = null;
    };
  }, [removeToast]);

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'daily_view':
        return t('blessings.earned.daily_view', 'Daily verse viewed');
      case 'reflection_written':
        return t('blessings.earned.reflection', 'Reflection added');
      case 'verse_favorited':
        return t('blessings.earned.favorite', 'Verse favorited');
      case 'milestone_achieved':
        return t('blessings.earned.milestone', 'Milestone achieved');
      default:
        return t('blessings.earned.generic', 'Blessings earned');
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-in-right bg-gradient-to-r from-yellow-50 to-amber-50 
                     dark:from-yellow-900/20 dark:to-amber-900/20 
                     border border-yellow-300 dark:border-yellow-700
                     rounded-lg shadow-lg p-4 flex items-center space-x-3
                     transform transition-all duration-300 hover:scale-105"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          {/* Blessing icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              +{toast.amount} {t('blessings.label', 'Blessings')}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {getReasonText(toast.reason)}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 
                       dark:text-gray-500 dark:hover:text-gray-300
                       transition-colors"
            aria-label="Dismiss"
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
      ))}
    </div>
  );
};

export default BlessingsToast;