import React, { useRef } from 'react';

interface RosaryBeadsProps {
  totalBeads: number;
  completedBeads: number;
  activeBeadIndex: number;
  onAdvance?: () => void;
}

const CX = 150;
const CY = 148;
const R  = 120;
const GAP_DEG = 28; // gap at bottom where pendant chain hangs

/**
 * Our Father beads appear at these ring-bead indices (0-based).
 * Derived from buildRosarySequence(): 'our-father' steps appear at sequence
 * positions 1, 6, 19, 32, 45, 58 (all non-'complete' steps indexed 0..58).
 */
const OUR_FATHER_INDICES = new Set([1, 6, 19, 32, 45, 58]);

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const RosaryBeads: React.FC<RosaryBeadsProps> = ({
  totalBeads,
  completedBeads,
  activeBeadIndex,
  onAdvance,
}) => {
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  const gapHalf   = GAP_DEG / 2;
  const startDeg  = 180 + gapHalf;
  const endDeg    = 180 - gapHalf + 360;
  const spreadDeg = 360 - GAP_DEG;
  const stepDeg   = spreadDeg / totalBeads;

  const beads = Array.from({ length: totalBeads }, (_, i) => {
    const deg = startDeg + i * stepDeg;
    const pos = polar(CX, CY, R, deg);
    return {
      ...pos,
      done:      i < completedBeads,
      active:    i === activeBeadIndex,
      ourFather: OUR_FATHER_INDICES.has(i),
    };
  });

  // Pendant chain anchor — bottom of the main ring
  const cordAnchor = polar(CX, CY, R, 180);
  // Cross centre sits below the ring
  const crossCY = cordAnchor.y + 30;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null || touchY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    const swipeLeft = dx < -45 && Math.abs(dx) > Math.abs(dy);
    const swipeUp   = dy < -45 && Math.abs(dy) > Math.abs(dx);
    if (swipeLeft || swipeUp) onAdvance?.();
    touchX.current = null;
    touchY.current = null;
  };

  return (
    <div
      className="select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <svg
        viewBox="0 0 300 320"
        className="w-full max-w-sm mx-auto drop-shadow-sm"
        aria-hidden="true"
      >
        <defs>
          {/* Hail Mary — pearl ivory (future) */}
          <radialGradient id="rg-hm-f" cx="33%" cy="27%" r="72%">
            <stop offset="0%"   stopColor="#fef9f2" />
            <stop offset="55%"  stopColor="#e8ddd0" />
            <stop offset="100%" stopColor="#b8a898" />
          </radialGradient>
          {/* Hail Mary — warm amber (done) */}
          <radialGradient id="rg-hm-d" cx="33%" cy="27%" r="72%">
            <stop offset="0%"   stopColor="#fde68a" />
            <stop offset="55%"  stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          {/* Our Father — sapphire blue (future) */}
          <radialGradient id="rg-of-f" cx="33%" cy="27%" r="72%">
            <stop offset="0%"   stopColor="#dbeafe" />
            <stop offset="55%"  stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
          {/* Our Father — deeper blue (done) */}
          <radialGradient id="rg-of-d" cx="33%" cy="27%" r="72%">
            <stop offset="0%"   stopColor="#93c5fd" />
            <stop offset="55%"  stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>
          {/* Active bead — bright gold */}
          <radialGradient id="rg-act" cx="28%" cy="22%" r="78%">
            <stop offset="0%"   stopColor="#fffde7" />
            <stop offset="45%"  stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
          {/* Cross / bail metallic gold */}
          <linearGradient id="lg-cross" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#fcd34d" />
            <stop offset="50%"  stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          {/* Active-bead glow */}
          <filter id="f-glow" x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feComposite in="SourceGraphic" in2="b" operator="over" />
          </filter>
          {/* Bead drop-shadow */}
          <filter id="f-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.6" dy="1.1" stdDeviation="1.2" floodColor="#00000055" />
          </filter>
          {/* Cross drop-shadow */}
          <filter id="f-cross" x="-30%" y="-20%" width="160%" height="150%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1.8" floodColor="#00000060" />
          </filter>
        </defs>

        {/* ── Cord ring ──────────────────────────────────────────── */}
        <path
          d={arcPath(CX, CY, R, startDeg, endDeg)}
          fill="none"
          stroke="#6b4c1e"
          strokeWidth="2.2"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />

        {/* ── Pendant cord ───────────────────────────────────────── */}
        <line
          x1={cordAnchor.x} y1={cordAnchor.y}
          x2={CX}           y2={crossCY - 16}
          stroke="#6b4c1e"
          strokeWidth="2.2"
          strokeOpacity="0.55"
          strokeLinecap="round"
        />

        {/* ── Beads ──────────────────────────────────────────────── */}
        {beads.map((b, i) => {
          const baseR   = b.ourFather ? 6.2 : 4.0;
          const activeR = b.ourFather ? 7.2 : 5.2;
          const r       = b.active ? activeR : baseR;

          const fill = b.active
            ? 'url(#rg-act)'
            : b.ourFather
              ? (b.done ? 'url(#rg-of-d)' : 'url(#rg-of-f)')
              : (b.done ? 'url(#rg-hm-d)' : 'url(#rg-hm-f)');

          return (
            <g key={i}>
              {/* Glow halo behind active bead */}
              {b.active && (
                <circle
                  cx={b.x} cy={b.y} r={22}
                  fill="#fbbf24"
                  opacity={0.16}
                  filter="url(#f-glow)"
                />
              )}

              {/* Bead body */}
              <circle
                cx={b.x} cy={b.y} r={r}
                fill={fill}
                filter="url(#f-shadow)"
                style={{ transition: 'r 0.22s ease, fill 0.3s ease' }}
              />

              {/* Specular highlight — top-left */}
              <circle
                cx={b.x - r * 0.3}
                cy={b.y - r * 0.33}
                r={r * 0.26}
                fill="white"
                opacity={0.52}
              />
            </g>
          );
        })}

        {/* ── Cross pendant ──────────────────────────────────────── */}
        <g transform={`translate(${CX},${crossCY})`} filter="url(#f-cross)">
          {/* Bail / ring at top */}
          <ellipse
            cx="0" cy="-17"
            rx="3.5" ry="4.2"
            fill="none"
            stroke="url(#lg-cross)"
            strokeWidth="2.4"
          />
          {/* Vertical bar */}
          <rect x="-4.5" y="-13" width="9" height="31" rx="2.5"
            fill="url(#lg-cross)" />
          {/* Horizontal bar */}
          <rect x="-13.5" y="-3" width="27" height="8.5" rx="2.5"
            fill="url(#lg-cross)" />
          {/* Left-edge highlight on vertical bar */}
          <rect x="-2.5" y="-11" width="3" height="13" rx="1"
            fill="white" opacity="0.22" />
          {/* Top-edge highlight on horizontal bar */}
          <rect x="-12" y="-1.8" width="11" height="3" rx="1"
            fill="white" opacity="0.22" />
          {/* INRI inscription */}
          <text
            x="0" y="5.5"
            textAnchor="middle"
            fontSize="4.2"
            fontWeight="700"
            letterSpacing="0.5"
            fill="white"
            opacity="0.62"
          >
            INRI
          </text>
        </g>
      </svg>

      {/* Swipe hint */}
      <p className="text-center text-xs text-[var(--journal-text-muted)] mt-0.5 tracking-wide">
        swipe left or up to advance
      </p>
    </div>
  );
};

export default RosaryBeads;
