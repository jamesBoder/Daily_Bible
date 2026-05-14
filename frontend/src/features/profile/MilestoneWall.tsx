import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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

/** One-sentence description of what each milestone requires. */
const BADGE_DESCRIPTIONS: Record<string, string> = {
  first_steps:    'Read your first daily verse.',
  week_in_word:   'Maintain a 7-day reading streak.',
  rooted:         'Stay consistent for 21 days.',
  month_of_grace: 'Complete a full 30-day streak.',
  steadfast:      'Keep reading for 60 days straight.',
  three_month:    'Reach a 90-day reading streak.',
  half_year:      'Read every day for 6 months (180 days).',
  nine_months:    'Sustain your streak for 270 days.',
  full_year:      'Complete a full year (365 days) of daily reading.',
};

interface TooltipState {
  key: string;
  x: number;
  y: number;
  above: boolean;
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

  const handleClick = (e: React.MouseEvent) => {
    if ((e.nativeEvent as PointerEvent).pointerType !== 'touch') {
      onTap(milestone.key);
    }
  };

  const handleMouseEnter = () => {
    if (badgeRef.current) {
      onMouseEnter(milestone.key, badgeRef.current.getBoundingClientRect());
    }
  };

  const daysAway = Math.max(milestone.days_required - currentStreak, 0);
  const ariaLabel = milestone.earned
    ? `${milestone.name} — Earned`
    : `${milestone.name} — ${daysAway} days away`;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        ref={badgeRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        aria-label={ariaLabel}
        className={[
          'milestone-badge',
          milestone.earned ? 'milestone-badge--earned' : 'milestone-badge--locked',
          milestone.earned && milestone.badge_variant === 'premium' ? 'milestone-badge--premium-earned' : '',
          'focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
        ].join(' ')}
      >
        {BADGE_EMOJIS[milestone.key] ?? '✦'}
      </button>
      {/* Label under badge */}
      <span
        className={`text-[10px] font-semibold text-center leading-tight max-w-[4.5rem] truncate ${
          milestone.earned
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-gray-400 dark:text-gray-600'
        }`}
        title={milestone.name}
      >
        {milestone.name}
      </span>
    </div>
  );
};

const MilestoneWall: React.FC<MilestoneWallProps> = ({ milestones, currentStreak }) => {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);

  const handleMouseEnter = (key: string, rect: DOMRect) => {
    // Decide whether to show the tooltip above or below the badge
    const above = rect.top > 140;
    setTooltip({
      key,
      x: rect.left + rect.width / 2,
      y: above ? rect.top - 8 : rect.bottom + 8,
      above,
    });
  };
  const handleMouseLeave = () => setTooltip(null);
  const handleTap = (key: string) => setSheet(key);

  const buildTooltipContent = (key: string) => {
    const m = milestones.find(m => m.key === key);
    if (!m) return null;
    const name = t(`milestone.${m.key}.name`, m.name);
    const desc = t(`milestone.${m.key}.description`, BADGE_DESCRIPTIONS[m.key] ?? '');
    const daysAway = Math.max(m.days_required - currentStreak, 0);

    if (m.earned && m.achieved_at) {
      const date = new Date(m.achieved_at).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      return (
        <>
          <p className="font-bold text-amber-300">{name}</p>
          <p className="opacity-80 mt-0.5">{desc}</p>
          <p className="mt-1 text-amber-300/80">Earned {date} · +{m.blessings_awarded} ✦</p>
        </>
      );
    }
    return (
      <>
        <p className="font-bold">{name}</p>
        <p className="opacity-80 mt-0.5">{desc}</p>
        <p className="mt-1 text-amber-300/80">
          {daysAway > 0 ? `${daysAway} days to go` : 'Almost there!'} · +{m.blessings_awarded} ✦
        </p>
      </>
    );
  };

  const sheetMilestone = sheet ? milestones.find(m => m.key === sheet) : null;

  return (
    <>
      {/* Desktop: 3×3 grid with labels */}
      <div className="hidden md:grid grid-cols-3 gap-y-5 gap-x-4 justify-items-center">
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

      {/* Mobile: horizontal scroll row */}
      <div className="md:hidden milestone-wall--mobile flex gap-4 pb-2">
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

      {/* Desktop hover tooltip — multi-line, well-positioned */}
      {tooltip && (
        <div
          className={[
            'fixed z-50 w-56 px-3 py-2.5 rounded-xl pointer-events-none',
            'bg-gray-900/95 text-white text-xs shadow-xl',
            'transform -translate-x-1/2',
            tooltip.above ? '-translate-y-full' : 'translate-y-0',
          ].join(' ')}
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {buildTooltipContent(tooltip.key)}
        </div>
      )}

      {/* Tap / click bottom sheet (mobile + desktop click) — rendered via portal so it
          escapes any ancestor overflow:hidden / stacking-context that would clip it.
          Backdrop uses onPointerDown (not onClick) to prevent touch click-through. */}
      {sheetMilestone && createPortal(
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onPointerDown={() => setSheet(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--theme-surface)] rounded-t-3xl p-6 animate-slide-up">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`milestone-badge ${sheetMilestone.earned ? 'milestone-badge--earned' : 'milestone-badge--locked'} text-4xl w-20 h-20`}
              >
                {BADGE_EMOJIS[sheetMilestone.key] ?? '✦'}
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)] text-center">
                {t(`milestone.${sheetMilestone.key}.name`, sheetMilestone.name)}
              </h3>
              <p className="text-sm text-[var(--journal-text-muted)] text-center leading-relaxed">
                {t(`milestone.${sheetMilestone.key}.description`, BADGE_DESCRIPTIONS[sheetMilestone.key] ?? '')}
              </p>
              {sheetMilestone.earned && sheetMilestone.achieved_at ? (
                <p className="text-sm text-center text-[var(--journal-text-muted)]">
                  Earned {new Date(sheetMilestone.achieved_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              ) : (
                <p className="text-sm text-center text-[var(--journal-text-muted)]">
                  {Math.max(sheetMilestone.days_required - currentStreak, 0)} {t('profile.days_to', 'days to')} {t(`milestone.${sheetMilestone.key}.name`, sheetMilestone.name)}
                </p>
              )}
              <p className="text-xs font-bold tabular-nums" style={{ color: 'var(--blessing-gold, #d97706)' }}>
                +{sheetMilestone.blessings_awarded} {t('profile.blessings', 'Blessings')} ✦
              </p>
              <button
                onClick={() => setSheet(null)}
                className="mt-2 px-6 py-2 rounded-2xl bg-[var(--theme-surface)] text-[var(--foreground)] font-medium min-h-[44px]"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default MilestoneWall;
