import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AvatarRingProps {
  username: string;
  userId: number;
  /** The highest milestone key earned, or undefined for no milestone. */
  highestMilestoneKey?: string;
  /** When true, force the premium gold ring regardless of milestone tier. */
  isPremium?: boolean;
  /** Size in px for the overall SVG. Default 100. */
  size?: number;
}

// Warm palette for avatar background, deterministic from user ID.
const AVATAR_COLORS = ['#C9A84C', '#E8963A', '#B8860B', '#CD7F32', '#9B8FC4'];

// Ring appearance per milestone tier.
// stroke values match spec; we use CSS vars for the gold tones so they
// adapt automatically if the design tokens change.
const RING_TIERS: Record<string, { stroke: string; strokeWidth: number; filter?: string; rotating?: boolean }> = {
  none:           { stroke: '#D1D5DB',             strokeWidth: 2 },
  first_steps:    { stroke: '#C0C0C0',             strokeWidth: 2.5 },
  week_in_word:   { stroke: '#CD7F32',             strokeWidth: 3 },
  rooted:         { stroke: '#B8860B',             strokeWidth: 3 },
  month_of_grace: { stroke: 'var(--blessing-gold)', strokeWidth: 3 },
  steadfast:      { stroke: 'var(--blessing-gold)', strokeWidth: 3.5, filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' },
  three_month:    { stroke: 'var(--blessing-gold)', strokeWidth: 3.5, filter: 'drop-shadow(0 0 7px rgba(251,191,36,0.6))' },
  half_year:      { stroke: 'var(--blessing-gold)', strokeWidth: 4,   filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.7))' },
  nine_months:    { stroke: 'var(--blessing-gold)', strokeWidth: 4.5, filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.75))' },
  full_year:      { stroke: 'var(--blessing-gold)', strokeWidth: 4.5, filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.8))', rotating: true },
};

function getInitials(username: string): string {
  if (!username) return '?';
  const words = username.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return username[0].toUpperCase();
}

const PREMIUM_RING = {
  stroke: 'var(--blessing-gold)',
  strokeWidth: 3.5,
  filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.65))',
  rotating: false,
};

const AvatarRing: React.FC<AvatarRingProps> = ({
  username,
  userId,
  highestMilestoneKey,
  isPremium = false,
  size = 100,
}) => {
  const { t } = useTranslation();
  // Premium ring overrides milestone tier when the user is a subscriber
  const tier = isPremium
    ? PREMIUM_RING
    : (RING_TIERS[highestMilestoneKey ?? 'none'] ?? RING_TIERS.none);
  const avatarColor = AVATAR_COLORS[userId % AVATAR_COLORS.length];
  const initials = getInitials(username);

  // Draw-in animation: start with full offset (invisible), animate to 0 (fully drawn).
  const padding = tier.strokeWidth + 4;
  const center = size / 2;
  const radius = center - padding;
  const circumference = 2 * Math.PI * radius;

  const [offset, setOffset] = useState(circumference);
  useEffect(() => {
    // Double-rAF ensures the starting state is painted before the transition fires.
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(() => setOffset(0));
    });
    return () => cancelAnimationFrame(raf1);
  }, [circumference]);

  const tooltipLabel = isPremium
    ? t('avatar.ring.tooltip.premium', 'Premium member')
    : highestMilestoneKey
      ? t('avatar.ring.tooltip.milestone', '{{milestone}} milestone', {
          milestone: highestMilestoneKey.replace(/_/g, ' '),
        })
      : t('avatar.ring.tooltip.none', 'No milestone yet');

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={tooltipLabel}
      className={tier.rotating ? 'avatar-ring--full-year' : undefined}
      style={{ filter: tier.filter, overflow: 'visible' }}
    >
      {/* Avatar background circle */}
      <circle cx={center} cy={center} r={radius - 4} fill={avatarColor} />

      {/* Initials text */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={size * 0.28}
        fontWeight="600"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {initials}
      </text>

      {/* Milestone ring — draws in on mount */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={tier.strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          stroke: tier.stroke,
          transition: 'stroke-dashoffset 1.2s ease-out',
          willChange: 'stroke-dashoffset',
          transformOrigin: 'center',
          transform: 'rotate(-90deg)',
        }}
      />
    </svg>
  );
};

export default AvatarRing;
