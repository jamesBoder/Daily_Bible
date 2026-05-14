import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface NextMilestoneBarProps {
  currentStreak: number;
  nextMilestone: {
    key: string;
    name: string;
    days_required: number;
    blessings_awarded: number;
  } | null;
}

const NextMilestoneBar: React.FC<NextMilestoneBarProps> = ({ currentStreak, nextMilestone }) => {
  const { t } = useTranslation();
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!nextMilestone) return;
    const pct = Math.min((currentStreak / nextMilestone.days_required) * 100, 100);
    // Animate to the target width after mount.
    const raf = requestAnimationFrame(() => setBarWidth(pct));
    return () => cancelAnimationFrame(raf);
  }, [currentStreak, nextMilestone]);

  // All milestones complete.
  if (!nextMilestone) {
    return (
      <p className="text-sm font-semibold text-center py-2" style={{ color: 'var(--blessing-gold)' }}>
        {t('profile.all_milestones_complete', "You've walked with the Word for a full year.")}
      </p>
    );
  }

  const pct = Math.min((currentStreak / nextMilestone.days_required) * 100, 100);
  const daysRemaining = Math.max(nextMilestone.days_required - currentStreak, 0);
  const milestoneName = t(`milestone.${nextMilestone.key}.name`, nextMilestone.name);
  // For large milestones, emphasize the text progress label over the thin bar fill.
  const isLargeMilestone = nextMilestone.days_required > 60;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-text-muted)]">
          {t('profile.next_milestone', 'Next')}
        </span>
        <span className="text-xs font-medium text-[var(--journal-text-muted)] tabular-nums">
          {isLargeMilestone
            ? `${currentStreak} / ${nextMilestone.days_required} ${t('profile.days_label', 'days')}`
            : `${daysRemaining} ${t('profile.days_remaining', 'days to go')}`}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
        <span className="text-sm font-semibold text-[var(--foreground)] truncate">{milestoneName}</span>
        <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: 'var(--blessing-gold)' }}>
          +{nextMilestone.blessings_awarded} ✦
        </span>
      </div>

      {/* Progress track */}
      <div
        className="w-full h-3 rounded-full bg-[var(--theme-surface)] overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${barWidth}%`,
            background: 'linear-gradient(90deg, var(--candle-amber), var(--blessing-gold))',
            transition: 'width 1s ease-out',
            willChange: 'width',
          }}
        />
      </div>

      <span className="sr-only">{Math.round(pct)}% towards {milestoneName}</span>
    </div>
  );
};

export default NextMilestoneBar;
