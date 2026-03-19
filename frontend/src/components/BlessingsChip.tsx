import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../services/SoundService';

const POPOVER_WIDTH = 240;
const POPOVER_ID = 'blessings';

interface BlessingsChipProps {
  showZero?: boolean;
}

const BlessingsChip: React.FC<BlessingsChipProps> = ({ showZero = false }) => {
  const { streakData } = useStreak();
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);
  const [hasShownExplanation, setHasShownExplanation] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, right: 0 });
  const [isFlashing, setIsFlashing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isHoverSourceRef = useRef(false);
  const prevBalanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem('blessings_explained')) setHasShownExplanation(true);
  }, []);

  // Flash animation when balance increases
  useEffect(() => {
    const balance = streakData?.blessings_balance ?? null;
    if (balance !== null && prevBalanceRef.current !== null && balance > prevBalanceRef.current) {
      setIsFlashing(true);
      SoundService.play('blessings-earned');
      const timer = setTimeout(() => setIsFlashing(false), 700);
      return () => clearTimeout(timer);
    }
    prevBalanceRef.current = balance;
  }, [streakData?.blessings_balance]);

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
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !popoverRef.current?.contains(t)) {
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
    if (!hasShownExplanation) {
      localStorage.setItem('blessings_explained', 'true');
      setHasShownExplanation(true);
    }
    if (showPopover && !isHoverSourceRef.current) {
      closePopover();
    } else {
      openPopover(false);
    }
  };

  if (!streakData) return null;
  if (streakData.blessings_balance === 0 && !showZero) return null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'flex items-center space-x-1.5 px-2.5 py-1 rounded-lg',
          'bg-gradient-to-r from-yellow-50 to-amber-50',
          'dark:from-yellow-900/20 dark:to-amber-900/20',
          'border border-yellow-300 dark:border-yellow-700',
          'hover:shadow-md transition-all duration-200 cursor-pointer',
          isFlashing ? 'animate-blessings-flash' : '',
        ].join(' ')}
        aria-label={t('blessings.balance', 'Blessings balance')}
      >
        <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
          {streakData.blessings_balance}
        </span>
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-60 max-w-[calc(100vw-1rem)] p-3
                     bg-white dark:bg-gray-800 rounded-lg shadow-xl
                     border border-gray-200 dark:border-gray-700
                     animate-fade-in"
          style={{ top: popoverPos.top, right: popoverPos.right }}
          onMouseEnter={() => clearTimeout(hoverTimerRef.current)}
          onMouseLeave={() => { if (isHoverSourceRef.current) closePopover(); }}
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t('blessings.popover.title', 'Blessings')}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('blessings.popover.description', 'Earn Blessings by engaging with daily verses, adding reflections, and maintaining your streak. Use them in the Rewards Shop (coming soon) to unlock themes and features!')}
            </p>
            <div className="pt-1.5 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {t('blessings.popover.balance', 'Current balance: {{count}}', { count: streakData.blessings_balance })}
              </p>
            </div>
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

export default BlessingsChip;
