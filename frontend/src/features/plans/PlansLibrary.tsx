import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { LockSimple, BookmarkSimple, Star, CheckCircle } from '@phosphor-icons/react';
import plansApi, { type ReadingPlanSummary } from '../../services/api/plans';
import { useStreak } from '../../contexts/StreakContext';
import { useAuth } from '../../hooks/useAuth';
import { msUntilDailyReset } from '../../lib/queryClient';
import { usePricingModal } from '../../hooks/usePricingModal';
import { useTutorial } from '../../hooks/useTutorial';
import { PlansTutorial, PLANS_TUTORIAL_KEY } from './PlansTutorial';

const PlansLibrary: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscription } = useStreak();
  const { isAuthenticated } = useAuth();
  const isPremium = subscription?.is_premium ?? false;
  const { openModal } = usePricingModal();
  const { showTutorial, dismissTutorial, openTutorial } = useTutorial(PLANS_TUTORIAL_KEY);

  const { data: plans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['plans-library'],
    queryFn: plansApi.getLibrary,
    staleTime: msUntilDailyReset(),
  });

  // Slot usage comes from /plans/my (not the library): a free user's premium
  // enrollments are hidden from the library view but still occupy slots.
  const { data: myPlans } = useQuery({
    queryKey: ['plans-my'],
    queryFn: plansApi.getMyPlans,
    enabled: isAuthenticated,
  });
  const slotsUsed = (myPlans?.enrollments ?? []).filter(e => !e.completed_at).length;
  const slotLimit = myPlans?.plan_limit;

  const seasonalPlans = plans.filter(p => p.is_seasonal && p.is_season_active);
  const regularPlans = plans.filter(p => !p.is_seasonal || !p.is_season_active);

  const handlePlanClick = (plan: ReadingPlanSummary) => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (plan.requires_premium && !isPremium) {
      openModal();
      return;
    }
    navigate(`/plans/${plan.slug}`);
  };

  // Pull-to-refresh handled by native scroll on mobile — parent Layout wraps in overflow-y-auto

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-[var(--journal-text-muted)] mb-3">
          {t('plans.errorLoading', 'Could not load reading plans. Please try again.')}
        </p>
        <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {showTutorial && <PlansTutorial onDismiss={dismissTutorial} />}

      <div className="flex items-center gap-2">
        <BookmarkSimple size={22} style={{ color: 'var(--blessing-gold)' }} weight="fill" />
        <h1 className="text-xl font-bold text-[var(--foreground)] flex-1">
          {t('plans.title', 'Reading Plans')}
        </h1>
        {typeof slotLimit === 'number' && (
          <span
            aria-label={t('plans.activeSlots', '{{used}} of {{limit}} paths active', { used: slotsUsed, limit: slotLimit })}
            title={t('plans.activeSlots', '{{used}} of {{limit}} paths active', { used: slotsUsed, limit: slotLimit })}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40"
          >
            <span className="flex items-center gap-0.5" aria-hidden>
              {Array.from({ length: slotLimit }, (_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i < slotsUsed ? 'bg-amber-500 dark:bg-amber-400' : 'bg-amber-300/60 dark:bg-amber-700/60'}`}
                />
              ))}
            </span>
            {/* Compact count on mobile; full label on wider screens */}
            <span className="sm:hidden">{slotsUsed}/{slotLimit}</span>
            <span className="hidden sm:inline">
              {t('plans.activeSlots', '{{used}} of {{limit}} paths active', { used: slotsUsed, limit: slotLimit })}
            </span>
          </span>
        )}
        <button
          className="tap-target-44 w-8 h-8 flex items-center justify-center rounded-full text-[var(--journal-text-muted)] hover:text-amber-600 dark:hover:text-amber-400 hover:bg-[var(--theme-surface)] transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
          onClick={openTutorial}
          aria-label={t('common.help', 'Help')}
          title={t('common.help', 'Help')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-center text-[var(--journal-text-muted)] py-6">
          {t('plans.noPlansAvailable', 'No reading plans are available right now.')}
        </p>
      ) : (
        <>
      {/* Seasonal plans */}
      {seasonalPlans.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-3">
            {t('plans.seasonal', 'Seasonal')}
          </h2>
          <div className="space-y-3">
            {seasonalPlans.map(plan => (
              <PlanLibraryCard key={plan.id} plan={plan} isPremium={isPremium} onClick={() => handlePlanClick(plan)} />
            ))}
          </div>
        </section>
      )}

      {/* Regular plans */}
      <section>
        {seasonalPlans.length > 0 && (
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] mb-3">
            {t('plans.library', 'Plan Library')}
          </h2>
        )}
        <div className="space-y-3">
          {regularPlans.map(plan => (
            <PlanLibraryCard key={plan.id} plan={plan} isPremium={isPremium} onClick={() => handlePlanClick(plan)} />
          ))}
        </div>
      </section>
        </>
      )}

    </div>
  );
};

// ── Plan library card ────────────────────────────────────────────────────────

interface PlanLibraryCardProps {
  plan: ReadingPlanSummary;
  isPremium: boolean;
  onClick: () => void;
}

const PlanLibraryCard: React.FC<PlanLibraryCardProps> = ({ plan, isPremium, onClick }) => {
  const { t } = useTranslation();
  const locked = plan.requires_premium && !isPremium;
  const progress = plan.user_progress;

  return (
    <button
      onClick={onClick}
      className="relative w-full text-left p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40 active:scale-[0.98] transition-all overflow-hidden"
      style={{ background: 'var(--card-bg)' }}
    >
      {/* Lock overlay for premium-gated plans */}
      {locked && (
        <div className="absolute inset-0 bg-[var(--theme-surface)]/60 rounded-xl flex items-center justify-end pr-4 pointer-events-none">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-1 rounded-full">
            <LockSimple size={12} weight="fill" />
            {t('plans.premiumLabel', 'Devoted Member')}
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--foreground)] leading-snug truncate">
            {plan.title}
          </p>
          <p className="text-xs text-[var(--journal-text-muted)] mt-0.5 line-clamp-2 leading-snug">
            {plan.description}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
            {t('plans.nDays', '{{count}} days', { count: plan.length_days })}
            {!plan.requires_premium && (
              <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                {t('plans.freeLabel', 'Free')}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {progress && !locked && (
            progress.completed_at ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-green-700 dark:text-green-400 bg-green-100/80 dark:bg-green-900/30">
                <CheckCircle size={11} weight="fill" aria-hidden />
                {t('plans.completedBadge', 'Complete')}
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/40">
                {t('plans.activeBadge', 'Active')}
              </span>
            )
          )}
          {plan.is_seasonal && (
            <Star size={16} weight="fill" style={{ color: 'var(--candle-amber)', flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* Progress bar if enrolled */}
      {progress && !locked && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-[var(--journal-text-muted)] mb-1">
            <span>
              {progress.completed_at
                ? t('plans.complete', 'Path Complete')
                : t('plans.dayOf', 'Day {{day}} of {{total}}', {
                    day: progress.last_read_day + 1,
                    total: plan.length_days,
                  })}
            </span>
          </div>
          <div className="h-1 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((progress.last_read_day / plan.length_days) * 100, 100)}%`,
                background: 'var(--blessing-gold)',
              }}
            />
          </div>
        </div>
      )}
    </button>
  );
};

export default PlansLibrary;
