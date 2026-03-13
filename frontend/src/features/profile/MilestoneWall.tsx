import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface MilestoneItem {
  key: string;
  days_required: number;
  name: string;
  blessings_awarded: number;
  earned: boolean;
  achieved_at?: string;
  badge_variant: string;
}

interface MilestoneWallProps {
  milestones: MilestoneItem[];
  currentStreak: number;
}

const BADGE_EMOJIS: Record<string, string> = {
  first_steps:    '👣',
  week_in_word:   '📖',
  rooted:         '🌳',
  month_of_grace: '🕊️',
  steadfast:      '⚓',
  three_month:    '🙏',
  half_year:      '⌛',
  nine_months:    '🌿',
  full_year:      '👑',
};

interface TooltipState {
  key: string;
  x: number;
  y: number;
}

interface BadgeProps {
  milestone: MilestoneItem;
  currentStreak: number;
  onMouseEnter: (key: string, rect: DOMRect) => void;
  onMouseLeave: () => void;
  onTap: (key: string) => void;
}

const MilestoneBadge: React.FC<BadgeProps> = ({
  milestone,
  currentStreak,
  onMouseEnter,
  onMouseLeave,
  onTap,
}) => {
  const badgeRef = useRef<HTMLButtonElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      onTap(milestone.key);
    }
  };

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      onMouseEnter(milestone.key, badgeRef.current.getBoundingClientRect());
    }
  };

  return (
    <button
      ref={badgeRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={handlePointerDown}
      aria-label={`${milestone.name}${milestone.earned ? ' — Earned' : ` — ${Math.max(milestone.days_required - currentStreak, 0)} days away`}`}
      className={[
        'milestone-badge',
        milestone.earned ? 'milestone-badge--earned' : 'milestone-badge--locked',
        milestone.earned && milestone.badge_variant === 'premium' ? 'milestone-badge--premium-earned' : '',
        'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
      ].join(' ')}
    >
      {BADGE_EMOJIS[milestone.key] ?? '✦'}
    </button>
  );
};

const MilestoneWall: React.FC<MilestoneWallProps> = ({ milestones, currentStreak }) => {
  const { t } = useTranslation();
  const [mouseTooltip, setMouseTooltip] = useState<TooltipState | null>(null);
  const [touchSheet, setTouchSheet] = useState<string | null>(null);

  const handleMouseEnter = (key: string, rect: DOMRect) => {
    setMouseTooltip({ key, x: rect.left + rect.width / 2, y: rect.top - 8 });
  };
  const handleMouseLeave = () => setMouseTooltip(null);
  const handleTap = (key: string) => setTouchSheet(key);

  const getTooltipText = (key: string): string => {
    const m = milestones.find(m => m.key === key);
    if (!m) return '';
    const name = t(`milestone.${m.key}.name`, m.name);
    if (m.earned && m.achieved_at) {
      const date = new Date(m.achieved_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      return `${name} · ${date}`;
    }
    const daysAway = Math.max(m.days_required - currentStreak, 0);
    return `${daysAway} ${t('profile.days_to', 'days to')} ${name}`;
  };

  const touchMilestone = touchSheet ? milestones.find(m => m.key === touchSheet) : null;

  return (
    <>
      {/* Desktop: 3×3 grid */}
      <div className="hidden md:grid grid-cols-3 gap-4 justify-items-center">
        {milestones.map(m => (
          <MilestoneBadge
            key={m.key}
            milestone={m}
            currentStreak={currentStreak}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTap={handleTap}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll row with right fade */}
      <div className="md:hidden milestone-wall--mobile flex gap-3 pb-2">
        {milestones.map(m => (
          <MilestoneBadge
            key={m.key}
            milestone={m}
            currentStreak={currentStreak}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTap={handleTap}
          />
        ))}
      </div>

      {/* Mouse tooltip (hover: hover only) */}
      {mouseTooltip && (
        <div
          className="fixed z-50 px-3 py-1.5 bg-gray-900/90 text-white text-xs rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: mouseTooltip.x, top: mouseTooltip.y }}
        >
          {getTooltipText(mouseTooltip.key)}
        </div>
      )}

      {/* Touch bottom sheet */}
      {touchMilestone && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setTouchSheet(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-slide-up">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`milestone-badge ${touchMilestone.earned ? 'milestone-badge--earned' : 'milestone-badge--locked'} text-4xl w-20 h-20`}
              >
                {BADGE_EMOJIS[touchMilestone.key] ?? '✦'}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t(`milestone.${touchMilestone.key}.name`, touchMilestone.name)}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {touchMilestone.earned && touchMilestone.achieved_at
                  ? new Date(touchMilestone.achieved_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
                  : `${Math.max(touchMilestone.days_required - currentStreak, 0)} ${t('profile.days_to', 'days to')} ${t(`milestone.${touchMilestone.key}.name`, touchMilestone.name)}`
                }
              </p>
              <button
                onClick={() => setTouchSheet(null)}
                className="mt-2 px-6 py-2 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium min-h-[44px]"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MilestoneWall;
