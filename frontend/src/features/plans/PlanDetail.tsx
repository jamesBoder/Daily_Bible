import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LockSimple, CheckCircle, Warning } from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import { useStreak } from '../../contexts/StreakContext';
import { useAuth } from '../../hooks/useAuth';
import { usePricingModal } from '../../hooks/usePricingModal';
import { showToast } from '../../utils/toast';
import PlanDayView from './PlanDayView';

const PlanDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { subscription } = useStreak();
  const { isAuthenticated } = useAuth();
  const { openModal } = usePricingModal();
  const isPremium = subscription?.is_premium ?? false;
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);
  const [showDayView, setShowDayView] = useState(false);

  const { data: plan, isLoading, error } = useQuery({
    queryKey: ['plan', slug],
    queryFn: () => plansApi.getPlan(slug!),
    enabled: !!slug,
  });

  // Slot usage for the cap-aware Begin button. If the query hasn't resolved
  // (or the backend predates plan_limit), the button stays enabled and the
  // error toast remains the fallback.
  const { data: myPlans } = useQuery({
    queryKey: ['plans-my'],
    queryFn: plansApi.getMyPlans,
    enabled: isAuthenticated,
  });
  const slotsUsed = (myPlans?.enrollments ?? []).filter(e => !e.completed_at).length;
  const slotLimit = myPlans?.plan_limit;
  const atCap = typeof slotLimit === 'number' && slotsUsed >= slotLimit;

  const enrollMutation = useMutation({
    mutationFn: () => plansApi.enroll(slug!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan', slug] });
      qc.invalidateQueries({ queryKey: ['plans-library'] });
      qc.invalidateQueries({ queryKey: ['plans-my'] });
      setShowDayView(true);
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { error?: string; limit?: number } } })?.response?.data;
      const code = data?.error;
      switch (code) {
        case 'max_plans_reached':
          showToast.error(
            typeof data?.limit === 'number'
              ? t('plan.enrollLimitReachedCount', 'You can have up to {{count}} active plans. Complete or leave one to begin a new path.', { count: data.limit })
              : t('plan.enrollLimitReached', 'You’ve reached your active plan limit. Complete or leave a plan to begin a new path.'),
          );
          break;
        case 'already_enrolled':
          // Refresh so the button flips to Continue instead of Begin.
          qc.invalidateQueries({ queryKey: ['plan', slug] });
          showToast.error(t('plan.enrollAlreadyEnrolled', 'You’re already on this path.'));
          break;
        case 'plan_premium_required':
          openModal();
          break;
        default:
          showToast.error(t('plan.enrollError', 'Could not start this plan. Please try again.'));
      }
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: () => plansApi.unenroll(slug!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan', slug] });
      qc.invalidateQueries({ queryKey: ['plans-library'] });
      qc.invalidateQueries({ queryKey: ['plans-my'] });
      setConfirmUnenroll(false);
    },
    onError: () => {
      showToast.error(t('plan.unenrollError', 'Could not leave this plan. Please try again.'));
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Warning size={32} className="text-red-400 mx-auto mb-2" />
        <p className="text-[var(--journal-text-muted)] text-sm">{t('plans.notFound', 'Plan not found.')}</p>
      </div>
    );
  }

  // If we just enrolled or user taps Continue, show the day view inline
  if (showDayView && plan.user_progress) {
    return <PlanDayView slug={slug!} onBack={() => setShowDayView(false)} />;
  }

  const progress = plan.user_progress;
  const isEnrolled = !!progress?.is_active;
  const isComplete = !!progress?.completed_at;
  const progressPct = plan.length_days > 0 && progress
    ? Math.min((progress.last_read_day / plan.length_days) * 100, 100)
    : 0;

  const handleEnroll = () => {
    if (navigator.vibrate) navigator.vibrate(8);
    if (plan.requires_premium && !isPremium) {
      openModal();
      return;
    }
    enrollMutation.mutate();
  };

  const handleContinue = () => {
    if (navigator.vibrate) navigator.vibrate(8);
    setShowDayView(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate('/plans')}
        className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 mb-4 hover:opacity-75 transition-opacity"
      >
        <ArrowLeft size={16} />
        {t('plans.library', 'Plan Library')}
      </button>

      {/* Header */}
      <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{plan.title}</h1>
      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-3">
        {t('plans.nDays', '{{count}} days', { count: plan.length_days })}
        {!plan.requires_premium && (
          <span className="ml-2 text-green-600 dark:text-green-400">· {t('plans.freeLabel', 'Free')}</span>
        )}
      </p>
      <p className="text-sm text-[var(--journal-text-muted)] leading-relaxed mb-6">{plan.description}</p>

      {/* Progress bar (if enrolled) */}
      {isEnrolled && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-[var(--journal-text-muted)] mb-1.5">
            <span>
              {isComplete
                ? t('plans.complete', 'Path Complete')
                : t('plans.dayOf', 'Day {{day}} of {{total}}', {
                    day: (progress?.last_read_day ?? 0) + 1,
                    total: plan.length_days,
                  })}
            </span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 rounded-full bg-amber-100 dark:bg-amber-900/30 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, background: 'var(--blessing-gold)' }}
            />
          </div>
        </div>
      )}

      {/* At-cap notice: tell the user before they tap, not via a failing toast.
          Premium-locked buttons stay tappable — they open the pricing modal. */}
      {!isEnrolled && atCap && (
        <div className="flex items-start gap-2 p-3 mb-3 rounded-xl text-xs leading-relaxed text-amber-800 dark:text-amber-200 bg-amber-100/70 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/40">
          <Warning size={16} weight="fill" className="flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden />
          <span>
            {t('plan.atCapNotice', 'You have {{used}} of {{limit}} active paths. Complete or leave one to begin this path.', { used: slotsUsed, limit: slotLimit })}
          </span>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex gap-3 mb-8">
        {!isEnrolled ? (
          <button
            onClick={handleEnroll}
            disabled={enrollMutation.isPending || (atCap && !(plan.requires_premium && !isPremium))}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm active:scale-[0.98] transition-all disabled:opacity-60"
            style={{ background: 'var(--blessing-gold)' }}
          >
            {plan.requires_premium && !isPremium ? (
              <span className="flex items-center justify-center gap-1.5">
                <LockSimple size={15} weight="fill" />
                {t('plans.premiumLabel', 'Devoted Member')}
              </span>
            ) : (
              enrollMutation.isPending ? '…' : t('plans.enroll', 'Begin this Path')
            )}
          </button>
        ) : isComplete ? (
          <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
            <CheckCircle size={20} weight="fill" />
            {t('plans.complete', 'Path Complete')}
          </div>
        ) : (
          <button
            onClick={handleContinue}
            className="flex-1 py-3 rounded-xl font-semibold text-white text-sm active:scale-[0.98] transition-all"
            style={{ background: 'var(--blessing-gold)' }}
          >
            {t('plans.continueReading', 'Continue Reading')}
          </button>
        )}

        {isEnrolled && !isComplete && (
          <button
            onClick={() => setConfirmUnenroll(true)}
            className="px-4 py-3 rounded-xl text-sm text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {t('plans.unenroll', 'Leave')}
          </button>
        )}
      </div>

      {/* Confirm unenroll modal */}
      {confirmUnenroll && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <div className="bg-[var(--theme-surface)] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {t('plans.unenrollConfirm', 'Leave "{{title}}"? Your progress will be lost.', { title: plan.title })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmUnenroll(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[var(--theme-border)] text-[var(--journal-text-muted)]"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={() => unenrollMutation.mutate()}
                disabled={unenrollMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {unenrollMutation.isPending ? '…' : t('plans.unenroll', 'Leave this Path')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry list */}
      <section>
        <h2 className="text-sm font-semibold text-[var(--journal-text-muted)] uppercase tracking-wider mb-3">
          {t('plans.nDays', '{{count}} days', { count: plan.length_days })}
        </h2>
        <div className="space-y-2">
          {plan.entries.map((entry) => {
            const isDone = progress && entry.day_number <= progress.last_read_day;
            return (
              <div
                key={entry.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${isDone ? 'border-green-200/60 dark:border-green-800/30' : 'border-amber-100/60 dark:border-amber-900/30'}`}
                style={{
                  background: isDone
                    ? 'color-mix(in srgb, #22c55e 4%, var(--card-bg))'
                    : 'var(--card-bg)',
                }}
              >
                <span
                  className="text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDone ? 'var(--blessing-gold)' : 'var(--theme-border)',
                    color: isDone ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {isDone ? '✓' : entry.day_number}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDone ? 'text-[var(--journal-text-muted)] line-through decoration-green-400/60' : 'text-[var(--foreground)]'}`}>
                    {entry.verse_ref}
                  </p>
                  {(entry.day_title || entry.reflection) && (
                    <p className="text-xs text-[var(--journal-text-muted)] mt-0.5 line-clamp-2 leading-snug italic">
                      {entry.day_title || entry.reflection}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PlanDetail;
