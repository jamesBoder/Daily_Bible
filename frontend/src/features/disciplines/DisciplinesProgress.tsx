import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Scroll, NotePencil, Heart, Export, Pencil, Path, TextT, Lightning,
  ChatCircleText, Trophy, HandsPraying, Fire, CaretLeft,
} from '@phosphor-icons/react'
import { useDisciplineStats } from './useDisciplineStats'
import { useStreak } from '../../contexts/StreakContext'
import { usePricingModal } from '../../hooks/usePricingModal'
import type { DisciplineStat, HistoryDay } from '../../services/api/disciplines'
import PerfectCycleCelebration from './PerfectCycleCelebration'

const BLESSINGS_SYMBOL = '✦'

// Reuses the same icon already assigned to each concept elsewhere in the app
// (Header/BottomNav/AnnotationPanel/CompletionCertificate) wherever one exists,
// for visual consistency rather than inventing a parallel icon set.
const DISCIPLINE_ICONS: Record<string, React.ComponentType<{ size?: number; weight?: 'regular' | 'duotone' | 'fill'; className?: string }>> = {
  read_verse: Scroll,
  write_journal: NotePencil,
  favorite_verse: Heart,
  share_verse: Export,
  annotate_verse: Pencil,
  advance_plan_day: Path,
  solve_manna_any: TextT,
  solve_manna_4: TextT,
  write_reflection_50: ChatCircleText,
  complete_reading_plan: Trophy,
  complete_rosary: HandsPraying,
}

function badgeTierClass(streak: number): string {
  if (streak <= 0) return 'discipline-badge--dormant'
  // "Strong" tier once a discipline has been kept up for a full rotation
  // cycle's worth of appearances — mirrors the 14-day cycle the app already
  // organizes around, not an arbitrary number.
  if (streak >= 14) return 'discipline-badge--active-strong'
  return 'discipline-badge--active'
}

function DisciplineStatRow({ stat, isPremium }: { stat: DisciplineStat; isPremium: boolean }) {
  const { t } = useTranslation()
  const { openModal } = usePricingModal()
  const Icon = DISCIPLINE_ICONS[stat.key] ?? Scroll
  const isLocked = stat.requires_premium && !isPremium
  const label = t(`disciplines.keys.${stat.key}`, stat.key)
  const streakLabel = t('disciplines.stats.streakUnit', '{{count}} day streak', { count: stat.current_streak })
  const rateLabel = `${stat.lifetime_completions}/${stat.times_offered}`

  return (
    <div
      className={`tap-target-44 flex items-center gap-3 min-h-[44px] px-2 py-2 rounded-xl transition-colors ${
        isLocked ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10' : ''
      }`}
      onClick={isLocked ? () => openModal('plans') : undefined}
      role={isLocked ? 'button' : undefined}
      aria-label={
        isLocked
          ? t('disciplines.unlockPremium', 'Unlock with Premium')
          : `${label} — ${stat.current_streak > 0 ? streakLabel : t('disciplines.stats.noStreak', 'no active streak')}, ${rateLabel}`
      }
    >
      <div className={`discipline-badge ${isLocked ? 'discipline-badge--locked' : badgeTierClass(stat.current_streak)}`} aria-hidden="true">
        {isLocked ? (
          <span className="text-sm">🔒</span>
        ) : (
          <div className="relative">
            <Icon size={20} weight="duotone" />
            {stat.key === 'solve_manna_4' && (
              <Lightning size={11} weight="fill" className="absolute -top-1 -right-1.5 text-amber-700" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">{label}</p>
        <p className="text-xs text-[var(--journal-text-muted)] tabular-nums">
          {isLocked
            ? t('common.premium', 'Premium')
            : t('disciplines.stats.completionRate', '{{rate}} · +{{blessings}} {{symbol}} earned', {
                rate: rateLabel,
                blessings: stat.lifetime_blessings_earned,
                symbol: BLESSINGS_SYMBOL,
              })}
        </p>
      </div>

      {!isLocked && stat.current_streak > 0 && (
        <div
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800"
          aria-hidden="true"
        >
          <Fire size={14} weight="duotone" className="animate-flame-flicker text-orange-500 dark:text-orange-400" />
          <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">{stat.current_streak}</span>
        </div>
      )}
    </div>
  )
}

function HistoryChip({ day, isToday, isUpcoming }: { day: HistoryDay; isToday: boolean; isUpcoming: boolean }) {
  const { t } = useTranslation()
  const dateObj = new Date(day.date + 'T00:00:00')
  const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
  const offered = day.offered.length
  const completed = day.completed.length
  const isFull = offered > 0 && completed === offered
  const isPartial = completed > 0 && completed < offered

  // The fraction text itself is the primary signal (not color alone), so the
  // chip's state is legible even with color removed.
  const stateLabel = isUpcoming
    ? t('disciplines.stats.upcomingDay', 'upcoming')
    : isFull
    ? t('disciplines.stats.fullyComplete', 'fully complete')
    : isPartial
    ? t('disciplines.stats.partiallyComplete', 'partially complete')
    : t('disciplines.stats.missed', 'missed')

  return (
    <div
      className={`shrink-0 w-14 flex flex-col items-center gap-1 px-1.5 py-2 rounded-xl border ${
        isUpcoming
          ? 'border-dashed border-[var(--theme-border)] opacity-60'
          : isFull
          ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20'
          : isPartial
          ? 'border-amber-200 dark:border-amber-800'
          : 'border-[var(--theme-border)] opacity-70'
      } ${isToday ? 'animate-reward-pulse' : ''}`}
      role="listitem"
      aria-label={`${dayLabel} — ${offered > 0 ? `${completed}/${offered}` : t('disciplines.stats.noneOffered', 'nothing offered')}, ${stateLabel}`}
    >
      <span className="text-[10px] font-semibold uppercase text-[var(--journal-text-muted)]">{dayLabel}</span>
      <span className="text-xs font-bold tabular-nums text-[var(--foreground)]">
        {offered > 0 ? `${completed}/${offered}` : '—'}
      </span>
    </div>
  )
}

export default function DisciplinesProgress() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { subscription } = useStreak()
  const isPremium = subscription?.is_premium ?? false
  const { data, isLoading, isError, refetch } = useDisciplineStats()

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="tap-target-44 w-8 h-8 flex items-center justify-center rounded-full text-[var(--journal-text-muted)] hover:bg-[var(--theme-surface)] transition-colors"
          aria-label={t('common.back', 'Back')}
        >
          <CaretLeft size={18} weight="bold" />
        </button>
        <h1 className="text-lg font-bold text-[var(--foreground)]">
          {t('disciplines.stats.title', 'Discipline Progress')}
        </h1>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      )}

      {isError && (
        <div className="text-center py-10">
          <p className="text-sm text-[var(--journal-text-muted)] mb-3">
            {t('disciplines.stats.error', 'Progress temporarily unavailable.')}
          </p>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {data && <DisciplinesProgressContent data={data} isPremium={isPremium} />}
    </div>
  )
}

function DisciplinesProgressContent({
  data,
  isPremium,
}: {
  data: NonNullable<ReturnType<typeof useDisciplineStats>['data']>
  isPremium: boolean
}) {
  const { t } = useTranslation()
  const isBrandNew = data.stats.every(s => s.lifetime_completions === 0)

  // Deterministic tie-break: first max encountered, scanning in the same
  // fixed order the backend already builds `stats` in (DisciplineDefinitions
  // order) — not a map/object-key iteration, which Go/JS don't guarantee.
  let bestStreak: DisciplineStat | null = null
  for (const s of data.stats) {
    if (!bestStreak || s.current_streak > bestStreak.current_streak) bestStreak = s
  }

  const totalBlessings = data.stats.reduce((sum, s) => sum + s.lifetime_blessings_earned, 0)
  const cyclePct = data.current_cycle.offered_count > 0
    ? Math.min(100, Math.round((data.current_cycle.completed_count / data.current_cycle.offered_count) * 100))
    : 0

  const today = data.date
  const timeline = [...data.recent, ...data.upcoming]

  return (
    <>
      {/* Hero row */}
      {isBrandNew ? (
        <p className="text-sm text-center text-[var(--journal-text-muted)] py-6">
          {t('disciplines.stats.noHistory', "Complete your first discipline to start tracking progress.")}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Best streak */}
          <div className="rounded-xl border border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-text-muted)] mb-1">
              {t('disciplines.stats.currentStreak', 'Best streak')}
            </p>
            {bestStreak && bestStreak.current_streak > 0 ? (
              <div className="flex items-center gap-1.5">
                <Fire size={20} weight="duotone" className="animate-flame-flicker text-orange-500 dark:text-orange-400" />
                <span className="text-xl font-bold tabular-nums text-[var(--foreground)]">{bestStreak.current_streak}</span>
                <span className="text-xs text-[var(--journal-text-muted)] truncate">
                  {t(`disciplines.keys.${bestStreak.key}`, bestStreak.key)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-[var(--journal-text-muted)]">{t('disciplines.stats.noStreak', 'no active streak')}</span>
            )}
          </div>

          {/* This cycle */}
          <div className="rounded-xl border border-[var(--theme-border)] p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-text-muted)]">
                {t('disciplines.stats.thisCycle', 'This cycle')}
              </p>
              <span className="text-xs font-medium tabular-nums text-[var(--journal-text-muted)]">
                {data.current_cycle.completed_count}/{data.current_cycle.offered_count}
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-[var(--theme-surface)] overflow-hidden" aria-hidden="true">
              <div
                className="relative h-full overflow-hidden rounded-full"
                style={{
                  width: `${cyclePct}%`,
                  background: 'linear-gradient(90deg, var(--candle-amber), var(--blessing-gold))',
                  transition: 'width 1s ease-out',
                }}
              >
                {cyclePct > 0 && cyclePct < 100 && (
                  <span
                    aria-hidden="true"
                    className="animate-progress-sheen absolute inset-y-0 left-0 w-1/3"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)' }}
                  />
                )}
              </div>
            </div>
            <span className="sr-only">{cyclePct}% {t('disciplines.stats.thisCycle', 'this cycle')}</span>
          </div>

          {/* Total blessings + perfect cycles */}
          <div className="rounded-xl border border-[var(--theme-border)] p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-text-muted)] mb-1">
              {t('disciplines.stats.lifetimeBlessings', 'Blessings earned')}
            </p>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--blessing-gold)' }}>
              {totalBlessings} {BLESSINGS_SYMBOL}
            </p>
            {data.perfect_cycles > 0 && (
              <span
                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-amber-900"
                style={{ background: 'radial-gradient(circle at 35% 35%, #fde68a, #f59e0b)' }}
              >
                🏆 {t('disciplines.stats.perfectCycles', '{{count}} Perfect Cycles', { count: data.perfect_cycles })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Per-discipline rows */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] mb-2">
          {t('disciplines.title', "Today's Disciplines")}
        </h2>
        <div className="flex flex-col gap-1">
          {data.stats.map(stat => (
            <DisciplineStatRow key={stat.key} stat={stat} isPremium={isPremium} />
          ))}
        </div>
      </section>

      {/* History / Upcoming strip */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] mb-2">
          {t('disciplines.stats.recentHistory', 'Last 14 days')}
        </h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" role="list">
          {timeline.map(day => (
            <HistoryChip
              key={day.date}
              day={day}
              isToday={day.date === today}
              isUpcoming={day.date > today}
            />
          ))}
        </div>
      </section>

      <PerfectCycleCelebration perfectCycles={data.perfect_cycles} />
    </>
  )
}
