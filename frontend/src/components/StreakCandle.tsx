import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useTranslation } from 'react-i18next';

const POPOVER_WIDTH = 208;
const POPOVER_ID = 'streak';

const StreakCandle: React.FC = () => {
  const { streakData } = useStreak();
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isHoverSourceRef = useRef(false);

  // Right-aligns with the button but clamps to stay within viewport
  const calcPos = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const right = Math.max(8, Math.min(
        window.innerWidth - rect.right,
        window.innerWidth - POPOVER_WIDTH - 8
      ));
      setPopoverPos({ top: rect.bottom + 8, right });
    }
  }, []);

  const closePopover = useCallback(() => {
    setShowPopover(false);
    isHoverSourceRef.current = false;
    clearTimeout(autoCloseTimerRef.current);
  }, []);

  const openPopover = useCallback((fromHover: boolean) => {
    calcPos();
    isHoverSourceRef.current = fromHover;
    setShowPopover(true);
    // Tell the other chip to close
    window.dispatchEvent(new CustomEvent('popover-open', { detail: POPOVER_ID }));
    // Auto-close click-opened popovers after 8s
    if (!fromHover) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(closePopover, 8000);
    }
  }, [calcPos, closePopover]);

  // Close when the other chip opens
  useEffect(() => {
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail !== POPOVER_ID) closePopover();
    };
    window.addEventListener('popover-open', handler);
    return () => window.removeEventListener('popover-open', handler);
  }, [closePopover]);

  // Click-away to close
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        closePopover();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopover, closePopover]);

  const handleMouseEnter = () => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    hoverTimerRef.current = setTimeout(() => openPopover(true), 600);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimerRef.current);
    if (isHoverSourceRef.current) closePopover();
  };

  const handleClick = () => {
    clearTimeout(hoverTimerRef.current);
    if (showPopover && !isHoverSourceRef.current) {
      closePopover();
    } else {
      openPopover(false);
    }
  };

  if (!streakData || streakData.current_streak < 1) return null;

  return (
    <>
      <div
        ref={buttonRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={e => e.key === 'Enter' && handleClick()}
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg
                   bg-gradient-to-r from-orange-50 to-amber-50
                   dark:from-orange-900/20 dark:to-amber-900/20
                   border border-orange-200 dark:border-orange-800
                   hover:shadow-md transition-all duration-200 cursor-pointer select-none"
        aria-label={t('streak.tooltip', 'Day {{count}} streak', { count: streakData.current_streak })}
      >
        <div className="relative flex-shrink-0">
          <svg className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C11.45 2 11 2.45 11 3V15C11 15.55 11.45 16 12 16C12.55 16 13 15.55 13 15V3C13 2.45 12.55 2 12 2Z" />
            <path d="M12 22C13.1 22 14 21.1 14 20H10C10 21.1 10.9 22 12 22Z" />
          </svg>
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-2.5
                       bg-gradient-to-t from-yellow-400 to-orange-400 rounded-full"
            style={{ filter: 'blur(0.5px)', animation: 'flicker 2s ease-in-out infinite' }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {streakData.current_streak}
        </span>
      </div>

      {showPopover && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-52 max-w-[calc(100vw-1rem)] p-3
                     bg-white dark:bg-gray-800 rounded-lg shadow-xl
                     border border-gray-200 dark:border-gray-700
                     animate-fade-in"
          style={{ top: popoverPos.top, right: popoverPos.right }}
          onMouseEnter={() => clearTimeout(hoverTimerRef.current)}
          onMouseLeave={() => { if (isHoverSourceRef.current) closePopover(); }}
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              🕯 {t('streak.popover.title', '{{count}}-Day Streak', { count: streakData.current_streak })}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('streak.popover.description', "You've been reading daily for {{count}} days in a row. Keep it up!", { count: streakData.current_streak })}
            </p>
            {streakData.grace_days_remaining > 0 && (
              <div className="pt-1.5 border-t border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {t('streak.popover.graceDays', '{{count}} Grace Day(s) available', { count: streakData.grace_days_remaining })}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={closePopover}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600
                       dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default StreakCandle;
