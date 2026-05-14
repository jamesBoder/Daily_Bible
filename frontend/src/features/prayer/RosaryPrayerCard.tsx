import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type RosaryStep } from './data/rosaryData';

const STEP_LABELS: Record<string, string> = {
  'apostles-creed':  "Apostles' Creed",
  'our-father':      'Our Father',
  'hail-mary':       'Hail Mary',
  'glory-be':        'Glory Be',
  'fatima':          'Fatima Prayer',
  'hail-holy-queen': 'Hail Holy Queen',
};

interface RosaryPrayerCardProps {
  step: RosaryStep;
  prayer: string;
  mystery: { title: string; scripture: string; meditation: string } | null;
  completedBeads: number;
  totalBeads: number;
  isComplete: boolean;
  onAdvance: () => void;
  onReset: () => void;
}

const RosaryPrayerCard: React.FC<RosaryPrayerCardProps> = ({
  step, prayer, mystery, completedBeads, totalBeads, isComplete, onAdvance, onReset,
}) => {
  const { t } = useTranslation();
  const [showFullPrayer, setShowFullPrayer] = useState(false);
  // Prevent double-tap: disable button briefly after each tap
  const advancingRef = useRef(false);

  const handleAdvance = () => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    onAdvance();
    setTimeout(() => { advancingRef.current = false; }, 350);
  };

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-5 py-10 px-4 text-center">
        {/* Radiant cross icon */}
        <div className="relative flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute w-28 h-28 rounded-full opacity-20 blur-xl"
            style={{ background: 'var(--blessing-gold)' }}
          />
          {/* Inner soft ring */}
          <div
            className="absolute w-20 h-20 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, var(--blessing-gold) 0%, transparent 70%)' }}
          />
          {/* SVG cross */}
          <svg width="52" height="68" viewBox="0 0 52 68" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="20" y="0" width="12" height="68" rx="6" fill="var(--blessing-gold, #d97706)" />
            <rect x="0" y="18" width="52" height="12" rx="6" fill="var(--blessing-gold, #d97706)" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {t('prayer.rosaryComplete', 'Rosary Complete')}
          </h2>
          <p className="text-sm text-[var(--journal-text-muted)] max-w-xs leading-relaxed">
            {t('prayer.rosaryCompleteDesc', 'You have prayed the Rosary. May Our Lady intercede for you and bring your intentions before God.')}
          </p>
        </div>

        <button
          onClick={onReset}
          className="mt-1 px-8 py-3 rounded-2xl text-sm font-semibold text-white active:scale-[0.97] transition-transform"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {t('prayer.prayAgain', 'Pray Again')}
        </button>
      </div>
    );
  }

  const stepLabel = STEP_LABELS[step.stepType] ?? step.stepType;
  const hasCounter = step.totalInStep > 1;
  const progress = Math.round((completedBeads / totalBeads) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-[var(--theme-surface)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'var(--blessing-gold)' }}
        />
      </div>
      <p className="text-xs text-right text-[var(--journal-text-muted)] -mt-2">
        {completedBeads}/{totalBeads}
      </p>

      {/* Mystery card (shown at decade boundaries) */}
      {mystery && (
        <div
          className="px-4 py-3 rounded-xl border border-amber-200/60 dark:border-amber-800/40"
          style={{ background: 'var(--card-bg)', borderLeft: '3px solid var(--candle-amber)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
            {t('prayer.mysteryLabel', 'Mystery')} {step.decadeIndex + 1}
          </p>
          <p className="text-sm font-semibold text-[var(--foreground)]">{mystery.title}</p>
          <p className="text-xs text-[var(--journal-text-muted)] mt-0.5 italic">{mystery.scripture}</p>
          <p className="text-xs text-[var(--journal-text-muted)] mt-1.5 leading-relaxed">{mystery.meditation}</p>
        </div>
      )}

      {/* Step header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)]">
            {stepLabel}
          </p>
          {hasCounter && (
            <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
              {step.beadIndex + 1} / {step.totalInStep}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFullPrayer(v => !v)}
          className="text-xs text-amber-600 dark:text-amber-400 hover:opacity-75 transition-opacity"
        >
          {showFullPrayer ? t('prayer.hideText', 'Hide') : t('prayer.showText', 'Show text')}
        </button>
      </div>

      {/* Prayer text */}
      {showFullPrayer && prayer && (
        <div
          className="px-4 py-3 rounded-xl text-sm text-[var(--foreground)] leading-relaxed"
          style={{ background: 'var(--card-bg)' }}
        >
          {prayer}
        </div>
      )}

      {/* Advance button */}
      <button
        onClick={handleAdvance}
        className="w-full py-4 rounded-2xl text-base font-bold text-white active:scale-[0.97] transition-transform"
        style={{ background: 'var(--blessing-gold)' }}
      >
        {t('prayer.nextBead', 'Next')}
      </button>
    </div>
  );
};

export default RosaryPrayerCard;
