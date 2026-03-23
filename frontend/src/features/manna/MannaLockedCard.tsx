import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePricingModal } from '../../hooks/usePricingModal';
import { useStreak } from '../../contexts/StreakContext';
import { mannaApi, YesterdayResult } from '../../services/api/manna';
import { MannaTile } from './MannaTile';
import { MannaKeyboard } from './MannaKeyboard';
import './manna.css';

interface MannaLockedCardProps {
  // Passed from MannaPuzzle when the locked response already contains yesterday's word,
  // avoiding a redundant extra API call.
  yesterday?: YesterdayResult | null;
}

export const MannaLockedCard: React.FC<MannaLockedCardProps> = ({ yesterday: initialYesterday }) => {
  const { t } = useTranslation();
  const { openModal } = usePricingModal();
  const { subscription } = useStreak();
  const isPremium = subscription?.is_premium ?? false;
  const [yesterday, setYesterday] = useState<YesterdayResult | null>(initialYesterday ?? null);

  useEffect(() => {
    // Only fetch if the parent didn't already supply yesterday's data
    if (!yesterday) {
      mannaApi.getYesterday().then(setYesterday).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fake blurred grid — 6 rows of 5 blank tiles
  const blurredGrid = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 5 }, (_, i) => (
      <MannaTile key={i} letter="" state="empty" index={i} />
    ))
  );

  return (
    <div className="manna-scene flex flex-col items-center gap-6 py-8 px-4 max-w-sm mx-auto">
      {/* Floating motes — decorative */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[
          { left: '18%', bottom: '20%', size: 3, duration: '6.5s', delay: '0s'   },
          { left: '55%', bottom: '12%', size: 4, duration: '8s',   delay: '1.8s' },
          { left: '78%', bottom: '25%', size: 3, duration: '7s',   delay: '3.2s' },
          { left: '35%', bottom: '8%',  size: 5, duration: '9s',   delay: '0.6s' },
        ].map((m, i) => (
          <span
            key={i}
            className="manna-mote"
            style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, animationDuration: m.duration, animationDelay: m.delay }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-5xl mb-2" aria-hidden>🌾</div>
        <h1 className="manna-title-glow text-2xl font-display font-bold" style={{ color: 'var(--blessing-gold)' }}>
          {t('manna.title', "Today's Manna")}
        </h1>
        <p className="manna-muted text-sm mt-1">
          {t('manna.subtitle', 'A new Biblical word puzzle each day.')}
        </p>
      </div>

      {/* Blurred puzzle preview */}
      <div className="manna-locked-blur w-full" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col items-center gap-1.5">
          {blurredGrid.map((row, r) => (
            <div key={r} className="flex gap-1.5">{row}</div>
          ))}
        </div>
        <div className="mt-3">
          <MannaKeyboard keyStates={{}} onKey={() => {}} disabled />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => openModal('plans')}
        className="manna-cta-btn w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {t('manna.unlockCta', 'Unlock with a Words of Praise membership')}
      </button>

      {/* M-21: Social proof — static count communicates active community */}
      <p className="manna-muted text-xs text-center" style={{ position: 'relative', zIndex: 1 }}>
        {t('manna.socialProof', '{{n}} devotees are solving today\'s word', { n: 247 })}
      </p>

      {/* Yesterday's word — always visible to drive curiosity */}
      {yesterday && (
        <div
          className="manna-result-panel w-full"
          aria-label={t('manna.yesterdaySection', "Yesterday's word")}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <p className="manna-muted text-xs uppercase tracking-wide mb-1">
            {t('manna.yesterdaysWord', "Yesterday's word")}
          </p>
          <p className="manna-title-glow text-2xl font-bold font-display tracking-widest" style={{ color: 'var(--blessing-gold)' }}>
            {yesterday.word}
          </p>
          {/* M-25: full scripture text is premium-only; free users see only the reference */}
          {isPremium ? (
            <blockquote className="manna-scripture">
              <p>{yesterday.scripture_text}</p>
              <cite className="not-italic font-semibold text-xs mt-1 block" style={{ color: 'var(--blessing-gold)' }}>
                — {yesterday.scripture_reference}
              </cite>
            </blockquote>
          ) : (
            <p className="manna-muted text-xs mt-1">
              — {yesterday.scripture_reference}
              {' '}
              <button
                onClick={() => openModal('plans')}
                className="underline"
                style={{ color: 'var(--blessing-gold)' }}
              >
                {t('manna.unlockScripture', 'Unlock full text')}
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
