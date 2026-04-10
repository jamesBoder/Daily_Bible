import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Confetti } from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import { msUntilDailyReset } from '../../lib/queryClient';
import { SoundService } from '../../services/SoundService';

interface PlanDayViewProps {
  slug: string;
  onBack: () => void;
}

const PlanDayView: React.FC<PlanDayViewProps> = ({ slug, onBack }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [justCompleted, setJustCompleted] = useState(false);
  const [blessingsEarned, setBlessingsEarned] = useState(0);

  const { data: plan } = useQuery({
    queryKey: ['plan', slug],
    queryFn: () => plansApi.getPlan(slug),
  });

  const { data: entry, isLoading, error: entryError, refetch } = useQuery({
    queryKey: ['plan-today', slug],
    queryFn: () => plansApi.getTodayEntry(slug),
    staleTime: msUntilDailyReset(),
    retry: 1,
  });

  const advanceMutation = useMutation({
    mutationFn: () => plansApi.advance(slug),
    onSuccess: (data) => {
      if (navigator.vibrate) navigator.vibrate(8);
      qc.invalidateQueries({ queryKey: ['plan-today', slug] });
      qc.invalidateQueries({ queryKey: ['plan', slug] });
      qc.invalidateQueries({ queryKey: ['plans-my'] });
      qc.invalidateQueries({ queryKey: ['plans-library'] });
      qc.invalidateQueries({ queryKey: ['streak'] });

      setBlessingsEarned(data.blessings_earned);

      if (data.just_completed) {
        setJustCompleted(true);
        SoundService.play('milestone');
      }
    },
  });

  const progress = plan?.user_progress;
  const alreadyRead = progress && entry ? progress.last_read_day >= entry.day_number : false;

  // Pull-to-refresh
  const [isPTR, setIsPTR] = useState(false);
  const handleRefresh = async () => {
    setIsPTR(true);
    await refetch();
    setIsPTR(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!entry) {
    const isNotEnrolled = entryError && (entryError as any)?.response?.status === 403;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isNotEnrolled
            ? t('plans.notEnrolled', 'You are not enrolled in this plan.')
            : t('plans.loadError', 'Unable to load today\'s reading. Please try again.')}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {t('common.retry', 'Retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 mb-5 hover:opacity-75 transition-opacity"
      >
        <ArrowLeft size={16} />
        {plan?.title ?? 'Back'}
      </button>

      {/* Day indicator */}
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
        {t('plans.dayOf', 'Day {{day}} of {{total}}', {
          day: entry.day_number,
          total: plan?.length_days ?? '?',
        })}
      </p>

      {/* Verse reference */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{entry.verse_ref}</h2>

      {/* Reflection callout */}
      {entry.reflection && (
        <blockquote
          className="border-l-4 pl-4 py-1 mb-6 italic text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
          style={{ borderColor: 'var(--candle-amber)' }}
        >
          {entry.reflection}
        </blockquote>
      )}

      {/* Mark as Read button */}
      {!alreadyRead && !justCompleted && (
        <button
          onClick={() => advanceMutation.mutate()}
          disabled={advanceMutation.isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-colors active:scale-[0.98] transition-transform disabled:opacity-60 mb-3"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {advanceMutation.isPending ? '…' : t('plans.markRead', 'Mark as Read')}
        </button>
      )}

      {/* Already read indicator */}
      {alreadyRead && !justCompleted && (
        <div
          className="flex items-center gap-2.5 py-3 px-4 rounded-2xl border border-green-200/60 dark:border-green-800/40"
          style={{ background: 'color-mix(in srgb, #22c55e 6%, transparent)' }}
        >
          <CheckCircle size={20} weight="fill" className="text-green-500 dark:text-green-400 flex-shrink-0" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            {t('plans.alreadyRead', 'You\'ve read this today')}
          </span>
        </div>
      )}

      {/* Completion overlay */}
      {justCompleted && (
        <div className="text-center py-6">
          <Confetti size={48} weight="fill" className="mx-auto mb-3" style={{ color: 'var(--blessing-gold)' }} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
            {t('plans.complete', 'Path Complete')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t('plans.completionMessage', 'You have completed {{title}}. Well done.', { title: plan?.title ?? '' })}
          </p>
          {blessingsEarned > 0 && (
            <p className="text-sm font-semibold" style={{ color: 'var(--blessing-gold)' }}>
              {t('plans.blessingsEarned', '+{{count}} Blessings', { count: blessingsEarned })}
            </p>
          )}
        </div>
      )}

      {/* Blessings earned inline (non-completion advance) */}
      {!justCompleted && blessingsEarned > 0 && (
        <p className="text-xs text-center font-medium" style={{ color: 'var(--blessing-gold)' }}>
          {t('plans.blessingsEarned', '+{{count}} Blessings', { count: blessingsEarned })}
        </p>
      )}
    </div>
  );
};

export default PlanDayView;
