import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Confetti, Star } from '@phosphor-icons/react'
import { useAuth } from '../../hooks/useAuth'

interface PerfectCycleCelebrationProps {
  perfectCycles: number
}

// Scoped per user ID — this app is used as an installed PWA and multiple
// family members plausibly share a device/browser profile. A bare global key
// would either wrongly suppress a second account's first celebration or
// misfire on account switch.
function storageKey(userID: number | undefined): string {
  return `disciplines_perfect_cycles_seen_${userID ?? 'anon'}`
}

export default function PerfectCycleCelebration({ perfectCycles }: PerfectCycleCelebrationProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [show, setShow] = useState(false)

  const previousFocusRef = useRef<HTMLElement | null>(null)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const ctaButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (perfectCycles <= 0) return
    const key = storageKey(user?.id)
    const seen = Number(localStorage.getItem(key) ?? '0')
    if (perfectCycles > seen) {
      setShow(true)
    }
  }, [perfectCycles, user?.id])

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey(user?.id), String(perfectCycles))
    setShow(false)
    previousFocusRef.current?.focus()
  }, [perfectCycles, user?.id])

  // On open: save previous focus, move focus to the CTA.
  useEffect(() => {
    if (!show) return
    previousFocusRef.current = document.activeElement as HTMLElement
    ctaButtonRef.current?.focus()
  }, [show])

  // ESC to dismiss.
  useEffect(() => {
    if (!show) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [show, dismiss])

  // Focus trap: keep Tab/Shift+Tab inside the modal.
  useEffect(() => {
    if (!show) return
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled'))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [show])

  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfect-cycle-title"
      ref={modalRef}
    >
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[var(--theme-surface)]">
        <div className="h-1.5 w-full" style={{ background: 'var(--blessing-gold)' }} />

        <div className="px-7 pt-8 text-center" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'color-mix(in srgb, var(--blessing-gold) 15%, transparent)' }}
          >
            <Confetti size={30} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--journal-text-muted)] mb-1.5">
            {t('plan.certificate.appName', 'Words of Praise')}
          </p>

          <h2 id="perfect-cycle-title" className="text-2xl font-bold font-serif leading-tight mb-2" style={{ color: 'var(--blessing-gold)' }}>
            {t('disciplines.stats.perfectCycleCelebration.title', 'Perfect Cycle!')}
          </h2>

          <p className="text-sm text-[var(--journal-text-muted)] mb-5 leading-relaxed">
            {t(
              'disciplines.stats.perfectCycleCelebration.body',
              "You completed every discipline offered in a full 14-day cycle. That's cycle #{{count}}.",
              { count: perfectCycles }
            )}
          </p>

          <button
            ref={ctaButtonRef}
            onClick={dismiss}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-all active:scale-[0.98] min-h-[44px]"
            style={{ background: 'var(--blessing-gold)' }}
          >
            {t('disciplines.stats.perfectCycleCelebration.cta', 'Keep going')}
          </button>
        </div>

        <Star size={10} weight="fill" className="absolute top-5 left-5 opacity-20" style={{ color: 'var(--blessing-gold)' }} />
        <Star size={8} weight="fill" className="absolute top-7 right-8 opacity-20" style={{ color: 'var(--blessing-gold)' }} />
        <Star size={12} weight="fill" className="absolute bottom-24 left-4 opacity-10" style={{ color: 'var(--blessing-gold)' }} />
      </div>
    </div>
  )
}
