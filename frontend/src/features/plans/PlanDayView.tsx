import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle, BookOpen, HandsPraying,
  Lightning, Question, Star, ArrowSquareOut, CaretDown, CaretUp, Fire,
} from '@phosphor-icons/react';
import plansApi from '../../services/api/plans';
import type { WordStudy } from '../../services/api/plans';
import { showToast } from '../../utils/toast';
import { msUntilDailyReset } from '../../lib/queryClient';
import { SoundService } from '../../services/SoundService';
import { useNavigate } from 'react-router-dom';
import PassageBlock from './PassageBlock';
import ComprehensionCheck from './ComprehensionCheck';
import MemoryVerseFlashcard from './MemoryVerseFlashcard';
import WordStudySheet from './WordStudySheet';
import PrevDayStrip from './PrevDayStrip';
import CompletionCertificate from './CompletionCertificate';
import DeepDive from './DeepDive';

interface PlanDayViewProps {
  slug: string;
  onBack: () => void;
}

const PlanDayView: React.FC<PlanDayViewProps> = ({ slug, onBack }) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [justCompleted, setJustCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [blessingsEarned, setBlessingsEarned] = useState(0);
  const [contextExpanded, setContextExpanded] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [studiedWord, setStudiedWord] = useState<{ word: string; study: WordStudy } | null>(null);

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
    onError: () => {
      showToast.error(t('plan.markReadError', 'Could not save progress. Please try again.'));
    },
    onSuccess: (data) => {
      if (navigator.vibrate) navigator.vibrate(8);
      qc.invalidateQueries({ queryKey: ['plan-today', slug] });
      qc.invalidateQueries({ queryKey: ['plan', slug] });
      qc.invalidateQueries({ queryKey: ['plans-my'] });
      qc.invalidateQueries({ queryKey: ['plans-library'] });
      qc.invalidateQueries({ queryKey: ['streak'] });
      if (data.discipline_completed) {
        qc.invalidateQueries({ queryKey: ['disciplines', 'today'] });
      }

      setBlessingsEarned(data.blessings_earned);

      if (data.just_completed) {
        setJustCompleted(true);
        setCompletedAt(new Date());
        SoundService.play('milestone');
      } else {
        SoundService.play('plan-advance');
        if (data.plan_streak === 1) {
          showToast.success(t('plan.streakStarted', 'Streak started — keep reading!'));
        } else if (data.plan_streak > 0 && data.plan_streak % 7 === 0) {
          showToast.success(t('plan.streakMilestone', '{{count}}-day reading streak!', { count: data.plan_streak }));
        }
      }
    },
  });

  const progress = plan?.user_progress;
  // undefined while plan is still loading — prevents the Mark as Read button from
  // flashing on for users who already read today (entry resolves before plan).
  const alreadyRead: boolean | undefined = plan === undefined
    ? undefined
    : progress && entry
      ? progress.last_read_day >= entry.day_number
      : false;

  const handleFlashcardDone = () => {
    setFlashcardOpen(false);
    advanceMutation.mutate();
  };

  const handleMarkRead = () => {
    if (entry?.is_memory_verse && alreadyRead === false && entry.verse_text) {
      setFlashcardOpen(true);
    } else {
      advanceMutation.mutate();
    }
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
        <p className="text-sm text-[var(--journal-text-muted)] mb-4">
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

      {/* Previous day recap strip — only shown before the user marks today as read */}
      {alreadyRead === false && entry.prev_day && (
        <PrevDayStrip prevDay={entry.prev_day} />
      )}

      {/* Day indicator */}
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          {t('plan.dayLabel', 'Day {{day}}', { day: entry.day_number })}
          {' '}{t('plan.ofLabel', 'of')}{' '}
          {plan?.length_days ?? '?'}
        </p>
        {(progress?.plan_streak ?? 0) >= 2 && (
          <span
            aria-label={t('plan.streakBadge', '{{count}}-day streak', { count: progress!.plan_streak })}
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 dark:text-orange-400"
          >
            <Fire size={14} weight="fill" aria-hidden />
            {progress!.plan_streak}
          </span>
        )}
      </div>

      {/* Day title */}
      {entry.day_title && (
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-3 leading-snug">
          {entry.day_title}
        </h2>
      )}

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

      {/* Passage block */}
      {entry.verse_text && (entry.content_type === 'passage' || entry.content_type === 'psalm' || entry.content_type === 'chapter') ? (
        <PassageBlock
          verseRef={entry.verse_ref}
          verseText={entry.verse_text}
          wordStudiesJson={entry.word_studies}
          onWordTap={(word, study) => setStudiedWord({ word, study })}
        />
      ) : entry.verse_text ? (
        <div className="mb-6">
          <p className="text-sm font-semibold text-[var(--journal-text-muted)] mb-2 tracking-wide">
            {entry.verse_ref}
          </p>
          <p className="text-xl font-serif leading-relaxed text-[var(--foreground)]">
            &ldquo;{entry.verse_text}&rdquo;
          </p>
        </div>
      ) : (
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">{entry.verse_ref}</h2>
      )}

      {/* Reflection callout */}
      {entry.reflection && (
        <blockquote
          className="border-l-4 pl-4 py-1 mb-5 italic text-sm text-[var(--journal-text-muted)] leading-relaxed"
          style={{ borderColor: 'var(--candle-amber)' }}
        >
          {entry.reflection}
        </blockquote>
      )}

      {/* Comprehension check — key resets state when entry changes between days */}
      {entry.quiz_question && (
        <ComprehensionCheck
          key={entry.id}
          question={entry.quiz_question}
          optionsJson={entry.quiz_options}
          explanation={entry.quiz_explanation}
        />
      )}

      {/* Context note — collapsible */}
      {entry.context_note && (
        <div className="mb-5">
          <button
            onClick={() => setContextExpanded(v => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-[var(--journal-text-muted)] hover:opacity-75 transition-opacity w-full text-left"
          >
            <BookOpen size={14} />
            {t('plan.historicalContext', 'Historical context')}
            <span className="ml-auto">
              {contextExpanded
                ? <CaretUp size={12} />
                : <CaretDown size={12} />
              }
            </span>
          </button>
          {contextExpanded && (
            <p className="mt-2 text-sm text-[var(--journal-text-muted)] leading-relaxed pl-5">
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
          <p className="text-sm italic text-[var(--journal-text-muted)] leading-relaxed">
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
            <p className="text-sm text-[var(--journal-text-muted)] leading-relaxed">
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
            <p className="text-sm text-[var(--journal-text-muted)] leading-relaxed">
              {entry.question}
            </p>
            <p className="text-xs text-indigo-400 dark:text-indigo-300 mt-1.5 font-medium">
              {t('plan.tapToJournal', 'Tap to write in your journal →')}
            </p>
          </div>
        </button>
      )}

      {/* Related passages */}
      {entry.passage_refs && entry.passage_refs !== '[]' && (() => {
        let refs: string[] = [];
        try { refs = JSON.parse(entry.passage_refs); } catch { /* ignore */ }
        return refs.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-xs font-semibold text-[var(--journal-text-muted)] uppercase tracking-wide">
              {t('plan.relatedPassages', 'Related')}
            </span>
            {refs.map(ref => (
              <span
                key={ref}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'color-mix(in srgb, var(--candle-amber) 10%, transparent)',
                  color: 'var(--candle-amber)',
                }}
              >
                <ArrowSquareOut size={11} weight="bold" />
                {ref}
              </span>
            ))}
          </div>
        ) : null;
      })()}

      {/* Dig deeper */}
      {entry.deep_dive_text && (
        <DeepDive
          deepDiveText={entry.deep_dive_text}
          deepDiveRefsJson={entry.deep_dive_refs ?? '[]'}
        />
      )}

      {/* Mark as Read button */}
      {alreadyRead === false && !justCompleted && (
        <button
          onClick={handleMarkRead}
          disabled={advanceMutation.isPending}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-60 mb-3"
          style={{ background: 'var(--blessing-gold)' }}
        >
          {advanceMutation.isPending ? '…' : t('plan.markRead', 'Mark as Read')}
        </button>
      )}

      {/* Already read indicator */}
      {alreadyRead === true && !justCompleted && (
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

      {/* Blessings earned inline (non-completion advance) */}
      {!justCompleted && blessingsEarned > 0 && (
        <p className="text-xs text-center font-medium mt-2" style={{ color: 'var(--blessing-gold)' }}>
          {t('plans.blessingsEarned', '+{{count}} Blessings', { count: blessingsEarned })}
        </p>
      )}

      {/* Memory verse flashcard — rendered over the whole screen */}
      {flashcardOpen && (
        <MemoryVerseFlashcard
          verseRef={entry.verse_ref}
          verseText={entry.verse_text}
          onDone={handleFlashcardDone}
        />
      )}

      {/* Word study bottom sheet */}
      {studiedWord && (
        <WordStudySheet
          word={studiedWord.word}
          study={studiedWord.study}
          onClose={() => setStudiedWord(null)}
        />
      )}

      {/* Completion certificate overlay */}
      {justCompleted && completedAt && (
        <CompletionCertificate
          planTitle={plan?.title ?? ''}
          coverVerseRef={entry.verse_ref}
          totalDays={plan?.length_days ?? 0}
          blessingsEarned={blessingsEarned}
          completedAt={completedAt}
          onBackToLibrary={onBack}
          onDismiss={() => setJustCompleted(false)}
        />
      )}
    </div>
  );
};

export default PlanDayView;
