import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStreak } from '../contexts/StreakContext';
import { useTranslation } from 'react-i18next';
import { SoundService } from '../services/SoundService';
import { Star } from '@phosphor-icons/react';

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
          'flex items-center space-x-1.5 px-2.5 py-1 min-h-[44px] md:min-h-0 rounded-lg',
          'bg-gradient-to-r from-yellow-50 to-amber-50',
          'dark:from-yellow-900/20 dark:to-amber-900/20',
          'border border-yellow-300 dark:border-yellow-700',
          'hover:shadow-md transition-all duration-200 cursor-pointer',
          isFlashing ? 'animate-blessings-flash' : '',
        ].join(' ')}
        aria-label={t('blessings.balance', 'Blessings balance')}
      >
        <Star size={18} weight="duotone" className="text-yellow-500 dark:text-yellow-400" />
        <span className="text-xs font-semibold text-[var(--foreground)]">
          {streakData.blessings_balance}
        </span>
      </button>

      {showPopover && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-60 max-w-[90vw] p-3
                     bg-[var(--theme-surface)] rounded-lg shadow-xl
                     border border-[var(--theme-border)]
                     animate-fade-in"
          style={{
            top: popoverPos.top,
            right: popoverPos.right,
            maxHeight: `calc(100dvh - ${popoverPos.top}px - 12px)`,
            overflowY: 'auto',
          }}
          onMouseEnter={() => clearTimeout(hoverTimerRef.current)}
          onMouseLeave={() => { if (isHoverSourceRef.current) closePopover(); }}
        >
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {t('blessings.popover.title', 'Blessings')}
            </h3>
            <p className="text-xs text-[var(--journal-text-muted)] leading-relaxed">
              {t('blessings.popover.description', 'Earn Blessings by engaging with daily verses, adding reflections, and maintaining your streak. Use them in the Rewards Shop (coming soon) to unlock themes and features!')}
            </p>
            <div className="pt-1.5 border-t border-[var(--theme-border)]">
              <p className="text-xs text-[var(--journal-text-muted)]">
                {t('blessings.popover.balance', 'Current balance: {{count}}', { count: streakData.blessings_balance })}
              </p>
            </div>
          </div>
          <button
            onClick={closePopover}
            className="absolute top-2 right-2 text-[var(--journal-text-muted)] hover:opacity-100"
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
