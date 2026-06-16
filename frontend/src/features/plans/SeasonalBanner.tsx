import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Star } from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import { useStreak } from '../../contexts/StreakContext';
import { usePricingModal } from '../../hooks/usePricingModal';

const SeasonalBanner: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useStreak();
  const { openModal } = usePricingModal();
  const isPremium = subscription?.is_premium ?? false;

  const { data: seasonalPlan } = useQuery({
    queryKey: ['plans-seasonal-current'],
    queryFn: plansApi.getSeasonalCurrent,
    staleTime: 1000 * 60 * 60, // 1 hour — seasons don't change mid-day
  });

  if (!seasonalPlan) return null;

  const seasonLabel = t(`plans.season.${seasonalPlan.season_key}`, seasonalPlan.season_key);

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (!isPremium) {
      openModal();
      return;
    }
    navigate(`/plans/${seasonalPlan.slug}`);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border active:scale-[0.98] transition-all mb-4 overflow-hidden relative"
      style={{
        borderColor: 'var(--candle-amber)',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--candle-amber) 14%, transparent) 0%, color-mix(in srgb, var(--candle-amber) 6%, transparent) 100%)',
      }}
    >
      {/* Decorative radiance blob */}
      <span
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--candle-amber) 20%, transparent) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <span
        className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ background: 'color-mix(in srgb, var(--candle-amber) 20%, transparent)' }}
      >
        <Star size={18} weight="fill" style={{ color: 'var(--candle-amber)' }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--candle-amber)' }}>
          {seasonLabel}
        </p>
        <p className="text-sm text-[var(--foreground)] leading-snug mt-0.5">
          {t('plans.seasonalBannerSub', 'A reading path is available for this season')}
        </p>
      </div>
      <svg className="w-4 h-4 flex-shrink-0 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default SeasonalBanner;
