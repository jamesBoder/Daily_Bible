import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  qKey: string;
  aKey: string;
  sectionKey?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  { qKey: 'about.faq.q1', aKey: 'about.faq.a1' },
  { qKey: 'about.faq.q2', aKey: 'about.faq.a2' },
  { qKey: 'about.faq.q3', aKey: 'about.faq.a3' },
  { qKey: 'about.faq.q4', aKey: 'about.faq.a4' },
  { qKey: 'about.faq.q5', aKey: 'about.faq.a5' },
  { qKey: 'about.faq.q6', aKey: 'about.faq.a6' },
  { qKey: 'about.faq.q7', aKey: 'about.faq.a7' },
  { qKey: 'about.faq.q8', aKey: 'about.faq.a8' },
  { qKey: 'about.faq.q9',  aKey: 'about.faq.a9',  sectionKey: 'about.faq.troubleshootingSection' },
  { qKey: 'about.faq.q10', aKey: 'about.faq.a10' },
  { qKey: 'about.faq.q11', aKey: 'about.faq.a11' },
  { qKey: 'about.faq.q12', aKey: 'about.faq.a12' },
  { qKey: 'about.faq.q13', aKey: 'about.faq.a13' },
];

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 sm:px-6">
      <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-primary-600 dark:text-primary-400">
        {t('about.faqTitle', 'Frequently Asked Questions')}
      </h2>
      <p className="text-center text-[var(--journal-text-muted)] mb-10">
        {t('about.faqSubtitle', 'Quick answers to the most common questions.')}
      </p>

      <div className="space-y-3">
        {FAQ_ITEMS.map(({ qKey, aKey, sectionKey }, i) => {
          const isOpen = openIndex === i;
          return (
            <React.Fragment key={qKey}>
              {sectionKey && (
                <div className="flex items-center gap-3 pt-4 pb-1">
                  <div className="flex-1 h-px bg-[var(--theme-border)]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] shrink-0">
                    {t(sectionKey)}
                  </span>
                  <div className="flex-1 h-px bg-[var(--theme-border)]" />
                </div>
              )}
              <div
                className={[
                  'rounded-2xl border transition-all duration-200',
                  isOpen
                    ? 'border-primary-300 dark:border-primary-700 bg-primary-50/60 dark:bg-primary-900/20'
                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)]',
                ].join(' ')}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-[var(--foreground)] text-sm sm:text-base">
                    {t(qKey)}
                  </span>
                  <svg
                    className={[
                      'shrink-0 w-5 h-5 text-primary-500 dark:text-primary-400 transition-transform duration-200',
                      isOpen ? 'rotate-180' : '',
                    ].join(' ')}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div
                  className={[
                    'overflow-hidden transition-all duration-200',
                    isOpen ? 'max-h-[32rem]' : 'max-h-0',
                  ].join(' ')}
                >
                  <p className="px-6 pb-5 text-sm sm:text-base text-[var(--foreground)] leading-relaxed">
                    {t(aKey)}
                  </p>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};
