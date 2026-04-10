import React from 'react';

interface RosaryBeadsProps {
  totalBeads: number;
  completedBeads: number;
  activeBeadIndex: number;
}

const CX = 50;
const CY = 52;
const R  = 38;
// Gap at bottom (degrees) where the cross pendant hangs
const GAP_DEG = 42;

/** Convert polar (angle in degrees) to cartesian coordinates */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Build an SVG arc path between two angles (always the short way round, clockwise) */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polar(cx, cy, r, startDeg);
  const end   = polar(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${sweep} 1 ${end.x} ${end.y}`;
}

const RosaryBeads: React.FC<RosaryBeadsProps> = ({ totalBeads, completedBeads, activeBeadIndex }) => {
  // The gap sits at the bottom (180° = straight down). Beads are distributed
  // clockwise starting just past the gap.
  const gapHalf   = GAP_DEG / 2;
  const startDeg  = 180 + gapHalf;          // just past gap, going clockwise
  const endDeg    = 180 - gapHalf + 360;    // just before gap (full circle minus gap)
  const spreadDeg = 360 - GAP_DEG;
  const step = spreadDeg / totalBeads;

  const beads = Array.from({ length: totalBeads }, (_, i) => {
    const deg = startDeg + i * step;
    const pos = polar(CX, CY, R, deg);
    const done   = i < completedBeads;
    const active = i === activeBeadIndex;
    return { ...pos, done, active };
  });

  // Cross pendant hangs below the gap
  const crossY = CY + R + 8;
  const cordBottom = polar(CX, CY, R, 180);

  return (
    <svg
      viewBox="0 0 100 112"
      className="w-full max-w-[260px] mx-auto"
      aria-hidden="true"
      role="img"
    >
      <defs>
        {/* Soft glow filter for the active bead */}
        <filter id="bead-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Cord arc — the ring minus the gap */}
      <path
        d={arcPath(CX, CY, R, startDeg, endDeg)}
        fill="none"
        stroke="var(--candle-amber, #b45309)"
        strokeWidth="0.7"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Cord from ring to cross */}
      <line
        x1={cordBottom.x}
        y1={cordBottom.y}
        x2={CX}
        y2={crossY - 5}
        stroke="var(--candle-amber, #b45309)"
        strokeWidth="0.7"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />

      {/* Beads */}
      {beads.map((b, i) => (
        <g key={i}>
          {/* Glow halo behind active bead */}
          {b.active && (
            <circle
              cx={b.x}
              cy={b.y}
              r={6}
              fill="var(--blessing-gold, #d97706)"
              opacity={0.28}
              filter="url(#bead-glow)"
            />
          )}
          <circle
            cx={b.x}
            cy={b.y}
            r={b.active ? 3.6 : 2.2}
            fill={
              b.active
                ? 'var(--blessing-gold, #d97706)'
                : b.done
                ? 'var(--candle-amber, #b45309)'
                : 'var(--card-bg, #f9fafb)'
            }
            stroke={b.done || b.active ? 'none' : 'var(--candle-amber, #b45309)'}
            strokeWidth={0.7}
            strokeOpacity={0.45}
            style={{ transition: 'r 0.2s ease, fill 0.25s ease' }}
          />
        </g>
      ))}

      {/* Cross pendant */}
      <g transform={`translate(${CX}, ${crossY})`}>
        {/* Vertical bar */}
        <rect x="-1.3" y="-4" width="2.6" height="10" rx="0.9"
          fill="var(--candle-amber, #b45309)" opacity="0.65" />
        {/* Horizontal bar */}
        <rect x="-4.5" y="0.5" width="9" height="2.6" rx="0.9"
          fill="var(--candle-amber, #b45309)" opacity="0.65" />
      </g>
    </svg>
  );
};

export default RosaryBeads;
