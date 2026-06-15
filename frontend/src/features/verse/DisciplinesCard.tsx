import { useRef, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { disciplinesApi, DisciplinesTodayResponse } from '../../services/api/disciplines'
import { useStreak } from '../../contexts/StreakContext'
import { usePricingModal } from '../../hooks/usePricingModal'
import { showBlessingsToast } from '../../components/BlessingsToast'
import { SoundService } from '../../services/SoundService'

const BLESSINGS_SYMBOL = '✦'

function DisciplineRowSkeleton() {
  return (
    <div className="flex items-center gap-3 min-h-[44px] px-1 animate-pulse">
      <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/30 shrink-0" />
      <div className="flex-1 h-3.5 rounded bg-amber-100 dark:bg-amber-900/30" />
      <div className="w-12 h-3.5 rounded bg-amber-100 dark:bg-amber-900/30" />
    </div>
  )
}

interface RowProps {
  statusKey: string
  blessings: number
  completed: boolean
  requiresPremium: boolean
  isPremium: boolean
  enrolledInPlan: boolean
}

function DisciplineRow({ statusKey, blessings, completed, requiresPremium, isPremium, enrolledInPlan }: RowProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openModal } = usePricingModal()
  const isLocked = requiresPremium && !isPremium

  const label = t(`disciplines.keys.${statusKey}`, statusKey)
  const showPlanCTA = statusKey === 'advance_plan_day' && !completed && !enrolledInPlan

  const handleLockedTap = () => {
    openModal('plans')
  }

  return (
    <div
      className={`flex items-start gap-3 min-h-[44px] px-1 py-1 rounded-lg transition-colors ${
        isLocked ? 'cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/10 active:bg-amber-100 dark:active:bg-amber-900/20' : ''
      }`}
      onClick={isLocked ? handleLockedTap : undefined}
      role={isLocked ? 'button' : undefined}
      aria-label={isLocked ? t('disciplines.unlockPremium', 'Unlock with Premium') : undefined}
    >
      {/* Status icon */}
      <div className="mt-0.5 shrink-0 w-5 h-5 flex items-center justify-center">
        {isLocked ? (
          <span className="text-amber-400 dark:text-amber-500 text-sm" aria-hidden="true">🔒</span>
        ) : completed ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center transition-all duration-200">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-amber-400 dark:border-amber-500" aria-hidden="true" />
        )}
      </div>

      {/* Label + optional CTA */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm leading-tight ${
          completed
            ? 'text-gray-400 dark:text-gray-500 line-through'
            : isLocked
            ? 'text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-200'
        }`}>
          {label}
        </span>
        {showPlanCTA && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/plans') }}
            className="block text-xs text-gray-400 dark:text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 mt-0.5 transition-colors"
          >
            {t('disciplines.startPlan', 'Start a reading plan →')}
          </button>
        )}
        {statusKey === 'advance_plan_day' && !completed && enrolledInPlan && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/plans') }}
            className="block text-xs text-amber-600 dark:text-amber-400 hover:underline mt-0.5"
          >
            {t('disciplines.continuePlan', 'Continue your plan →')}
          </button>
        )}
      </div>

      {/* Blessings chip */}
      <div className="shrink-0 mt-0.5">
        {isLocked ? (
          <span className="text-xs font-medium text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2 py-0.5">
            {t('common.premium', 'Premium')}
          </span>
        ) : (
          <span className={`text-xs font-semibold tabular-nums ${
            completed
              ? 'text-gray-400 dark:text-gray-500'
              : 'text-amber-600 dark:text-amber-400'
          }`}>
            +{blessings} {BLESSINGS_SYMBOL}
          </span>
        )}
      </div>
    </div>
  )
}

export default function DisciplinesCard() {
  const { t } = useTranslation()
  const { subscription } = useStreak()
  const isPremium = subscription?.is_premium ?? false

  const { data, isLoading, isError } = useQuery<DisciplinesTodayResponse>({
    queryKey: ['disciplines', 'today'],
    queryFn: disciplinesApi.getToday,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  })

  // Track previous data to detect newly completed disciplines.
  const prevDataRef = useRef<DisciplinesTodayResponse | null>(null)
  const [allDoneGlow, setAllDoneGlow] = useState(false)
  const allDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!data) return
    const prev = prevDataRef.current

    if (prev) {
      // Detect newly completed disciplines and show blessings toasts.
      for (const disc of data.disciplines) {
        const wasCompleted = prev.disciplines.find(d => d.key === disc.key)?.completed
        if (!wasCompleted && disc.completed) {
          showBlessingsToast(disc.blessings, 'discipline_complete')
        }
      }
    }

    // Check if all applicable disciplines are now complete.
    const applicable = data.disciplines.filter(d => !d.requires_premium || isPremium)
    const allDone = applicable.length > 0 && applicable.every(d => d.completed)
    if (allDone && prev && !prev.disciplines.every(d => d.completed || (d.requires_premium && !isPremium))) {
      // Transition to all-done — play sound and show glow.
      SoundService.play('discipline-complete')
      setAllDoneGlow(true)
      if (allDoneTimerRef.current) clearTimeout(allDoneTimerRef.current)
      allDoneTimerRef.current = setTimeout(() => setAllDoneGlow(false), 1200)
    }

    prevDataRef.current = data
  }, [data, isPremium])

  useEffect(() => {
    return () => {
      if (allDoneTimerRef.current) clearTimeout(allDoneTimerRef.current)
    }
  }, [])

  if (isError) return null

  const disciplines = data?.disciplines ?? []
  const enrolledInPlan = data?.enrolled_in_plan ?? false

  // Progress: count completed disciplines, excluding locked ones for non-premium users.
  const applicable = disciplines.filter(d => !d.requires_premium || isPremium)
  const completedCount = applicable.filter(d => d.completed).length
  const totalCount = applicable.length
  const allDone = totalCount > 0 && completedCount === totalCount

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-900 p-4 transition-all duration-300 ${
        allDoneGlow
          ? 'border-amber-400 shadow-lg shadow-amber-100 dark:shadow-amber-900/20 animate-pulse'
          : 'border-amber-200 dark:border-amber-800/50'
      }`}
      aria-label={t('disciplines.title', "Today's Disciplines")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
          {t('disciplines.title', "Today's Disciplines")}
        </h3>
        {!isLoading && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {allDone
              ? <span className="text-amber-600 dark:text-amber-400">{t('disciplines.allDone', 'All done')} {BLESSINGS_SYMBOL}</span>
              : t('disciplines.progress', '{{done}} of {{total}} complete', { done: completedCount, total: totalCount })
            }
          </span>
        )}
      </div>

      {/* Discipline rows */}
      <div className="flex flex-col gap-0.5">
        {isLoading ? (
          <>
            <DisciplineRowSkeleton />
            <DisciplineRowSkeleton />
            <DisciplineRowSkeleton />
          </>
        ) : disciplines.length === 0 ? null : (
          disciplines.map(disc => (
            <DisciplineRow
              key={disc.key}
              statusKey={disc.key}
              blessings={disc.blessings}
              completed={disc.completed}
              requiresPremium={disc.requires_premium}
              isPremium={isPremium}
              enrolledInPlan={enrolledInPlan}
            />
          ))
        )}
      </div>
    </div>
  )
}
