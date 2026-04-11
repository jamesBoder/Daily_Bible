import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Confetti, BookOpen, HandsPraying, Lightning, Question, Star } from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import { msUntilDailyReset } from '../../lib/queryClient';
import { SoundService } from '../../services/SoundService';
import { useNavigate } from 'react-router-dom';

interface PlanDayViewProps {
  slug: string;
  onBack: () => void;
}

const PlanDayView: React.FC<PlanDayViewProps> = ({ slug, onBack }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [justCompleted, setJustCompleted] = useState(false);
  const [blessingsEarned, setBlessingsEarned] = useState(0);
  const [contextExpanded, setContextExpanded] = useState(false);

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
            ? t('plan.notEnrolled', 'You are not enrolled in this plan.')
            : t('plan.loadError', 'Unable to load today\'s reading. Please try again.')}
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
        {t('plan.dayLabel', 'Day {{day}}', { day: entry.day_number })}
        {' '}{t('plan.ofLabel', 'of')}{' '}
        {plan?.length_days ?? '?'}
      </p>

      {/* Memory verse banner */}
      {entry.is_memory_verse && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-semibold"
          style={{ background: 'color-mix(in srgb, var(--blessing-gold) 12%, transparent)', color: 'var(--blessing-gold)' }}
        >
          <Star size={14} weight="fill" />
          {t('plan.memoryVerse', "This week's memory verse")}
        </div>
      )}

      {/* Verse reference — label style */}
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wide">
        {entry.verse_ref}
      </p>

      {/* Verse text — large, readable. Falls back to bold ref if not in local DB */}
      {entry.verse_text ? (
        <p className="text-xl font-serif leading-relaxed text-gray-800 dark:text-gray-100 mb-6">
          "{entry.verse_text}"
        </p>
      ) : (
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">{entry.verse_ref}</h2>
      )}

      {/* Reflection callout */}
      {entry.reflection && (
        <blockquote
          className="border-l-4 pl-4 py-1 mb-5 italic text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
          style={{ borderColor: 'var(--candle-amber)' }}
        >
          {entry.reflection}
        </blockquote>
      )}

      {/* Context note — collapsible */}
      {entry.context_note && (
        <div className="mb-5">
          <button
            onClick={() => setContextExpanded(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:opacity-75 transition-opacity w-full text-left"
          >
            <BookOpen size={14} />
            {t('plan.historicalContext', 'Historical context')}
            <span className="ml-auto">{contextExpanded ? '▲' : '▼'}</span>
          </button>
          {contextExpanded && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed pl-5">
              {entry.context_note}
            </p>
          )}
        </div>
      )}

      {/* Prayer */}
      {entry.prayer && (
        <div
          className="flex gap-3 px-4 py-3.5 rounded-2xl mb-4"
          style={{ background: 'color-mix(in srgb, var(--candle-amber) 8%, transparent)' }}
        >
          <HandsPraying size={18} weight="duotone" className="text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">
            {entry.prayer}
          </p>
        </div>
      )}

      {/* Application */}
      {entry.application && (
        <div
          className="flex gap-3 px-4 py-3.5 rounded-2xl mb-4 border"
          style={{
            borderColor: 'color-mix(in srgb, var(--blessing-gold) 30%, transparent)',
            background: 'color-mix(in srgb, var(--blessing-gold) 5%, transparent)',
          }}
        >
          <Lightning size={18} weight="fill" style={{ color: 'var(--blessing-gold)' }} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--blessing-gold)' }}>
              {t('plan.todayLabel', 'Today')}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {entry.application}
            </p>
          </div>
        </div>
      )}

      {/* Reflection question — tap to open journal pre-filled */}
      {entry.question && (
        <button
          onClick={() => navigate('/journal', { state: { prompt: entry.question, verseRef: entry.verse_ref } })}
          className="w-full text-left flex gap-3 px-4 py-3.5 rounded-2xl mb-5 active:scale-[0.98] transition-transform"
          style={{ background: 'color-mix(in srgb, #818cf8 8%, transparent)' }}
        >
          <Question size={18} weight="bold" className="text-indigo-400 dark:text-indigo-300 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400 dark:text-indigo-300 mb-1">
              {t('plan.reflectLabel', 'Reflect')}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {entry.question}
            </p>
            <p className="text-xs text-indigo-400 dark:text-indigo-300 mt-1.5 font-medium">
              {t('plan.tapToJournal', 'Tap to write in your journal →')}
            </p>
          </div>
        </button>
      )}

      {/* Mark as Read button */}
      {!alreadyRead && !justCompleted && (
        <button
          onClick={() => advanceMutation.mutate()}
          disabled={advanceMutation.isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-colors active:scale-[0.98] transition-transform disabled:opacity-60 mb-3"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {advanceMutation.isPending ? '…' : t('plan.markRead', 'Mark as Read')}
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
            {t('plan.alreadyRead', "You've read this today")}
          </span>
        </div>
      )}

      {/* Completion overlay */}
      {justCompleted && (
        <div className="text-center py-6">
          <Confetti size={48} weight="fill" className="mx-auto mb-3" style={{ color: 'var(--blessing-gold)' }} />
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
            {t('plan.planComplete', 'Path Complete')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t('plan.planCompleteDesc', 'You have completed {{title}}. Well done.', { title: plan?.title ?? '' })}
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
        <p className="text-xs text-center font-medium mt-2" style={{ color: 'var(--blessing-gold)' }}>
          {t('plans.blessingsEarned', '+{{count}} Blessings', { count: blessingsEarned })}
        </p>
      )}
    </div>
  );
};

export default PlanDayView;
