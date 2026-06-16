import React from 'react';
import { useTranslation } from 'react-i18next';
import { Confetti, Export, Star, Books } from '@phosphor-icons/react';

interface CompletionCertificateProps {
  planTitle: string;
  coverVerseRef: string;
  totalDays: number;
  blessingsEarned: number;
  completedAt: Date;
  onBackToLibrary: () => void;
  onDismiss: () => void;
}

const CompletionCertificate: React.FC<CompletionCertificateProps> = ({
  planTitle,
  coverVerseRef,
  totalDays,
  blessingsEarned,
  completedAt,
  onBackToLibrary,
  onDismiss,
}) => {
  const { t } = useTranslation();

  const dateStr = completedAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    const text = t(
      'plan.certificate.shareText',
      'I just completed "{{title}}" — a {{days}}-day reading plan on Words of Praise! 🙏',
      { title: planTitle, days: totalDays }
    );
    if (navigator.share) {
      try {
        await navigator.share({ title: planTitle, text });
      } catch {
        // user dismissed the share sheet — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // clipboard unavailable — ignore silently
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[var(--theme-surface)]"
      >
        {/* Gold accent bar */}
        <div className="h-1.5 w-full" style={{ background: 'var(--blessing-gold)' }} />

        <div
          className="px-7 pt-8 text-center"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          {/* Confetti icon in gold circle */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'color-mix(in srgb, var(--blessing-gold) 15%, transparent)' }}
          >
            <Confetti size={30} weight="fill" style={{ color: 'var(--blessing-gold)' }} />
          </div>

          {/* App name */}
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--journal-text-muted)] mb-1.5">
            {t('plan.certificate.appName', 'Words of Praise')}
          </p>

          {/* Certificate heading */}
          <p className="text-xs font-semibold text-[var(--journal-text-muted)] mb-3">
            {t('plan.certificate.title', 'Certificate of Completion')}
          </p>

          {/* Plan name */}
          <h2
            className="text-2xl font-bold font-serif leading-tight mb-2"
            style={{ color: 'var(--blessing-gold)' }}
          >
            {planTitle}
          </h2>

          {/* Cover verse ref */}
          <p className="text-xs italic text-[var(--journal-text-muted)] mb-5">
            {coverVerseRef}
          </p>

          {/* Thin gold divider */}
          <div
            className="w-10 h-px mx-auto mb-5"
            style={{ background: 'color-mix(in srgb, var(--blessing-gold) 40%, transparent)' }}
          />

          {/* Stats row */}
          <div className="flex justify-center gap-10 mb-5">
            <div>
              <p className="text-3xl font-bold text-[var(--foreground)] leading-none">{totalDays}</p>
              <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
                {t('plan.certificate.days', 'days')}
              </p>
            </div>
            {blessingsEarned > 0 && (
              <div>
                <p className="text-3xl font-bold leading-none" style={{ color: 'var(--blessing-gold)' }}>
                  +{blessingsEarned}
                </p>
                <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
                  {t('plan.certificate.blessings', 'blessings')}
                </p>
              </div>
            )}
          </div>

          {/* Completion date */}
          <p className="text-xs text-[var(--journal-text-muted)] mb-7">
            {t('plan.certificate.completedOn', 'Completed on {{date}}', { date: dateStr })}
          </p>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-all active:scale-[0.98]"
            style={{ background: 'var(--blessing-gold)' }}
          >
            <Export size={16} weight="bold" />
            {t('plan.certificate.share', 'Share your achievement')}
          </button>

          {/* Back to library */}
          <button
            onClick={onBackToLibrary}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-[var(--journal-text-muted)] border border-[var(--theme-border)] mb-3 transition-all active:scale-[0.98] hover:opacity-75"
          >
            <Books size={15} weight="duotone" />
            {t('plan.certificate.backToLibrary', 'Back to Library')}
          </button>

          {/* Dismiss link */}
          <button
            onClick={onDismiss}
            className="text-xs text-[var(--journal-text-muted)] hover:opacity-70 transition-opacity pb-1"
          >
            {t('plan.certificate.dismiss', 'Dismiss')}
          </button>
        </div>

        {/* Decorative corner stars */}
        <Star
          size={10}
          weight="fill"
          className="absolute top-5 left-5 opacity-20"
          style={{ color: 'var(--blessing-gold)' }}
        />
        <Star
          size={8}
          weight="fill"
          className="absolute top-7 right-8 opacity-20"
          style={{ color: 'var(--blessing-gold)' }}
        />
        <Star
          size={12}
          weight="fill"
          className="absolute bottom-24 left-4 opacity-10"
          style={{ color: 'var(--blessing-gold)' }}
        />
      </div>
    </div>
  );
};

export default CompletionCertificate;
