import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  qKey: string;
  aKey: string;
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
      <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
        {t('about.faqSubtitle', 'Quick answers to the most common questions.')}
      </p>

      <div className="space-y-3">
        {FAQ_ITEMS.map(({ qKey, aKey }, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={qKey}
              className={[
                'rounded-2xl border transition-all duration-200',
                isOpen
                  ? 'border-primary-300 dark:border-primary-700 bg-primary-50/60 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60',
              ].join(' ')}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
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
                  isOpen ? 'max-h-96' : 'max-h-0',
                ].join(' ')}
              >
                <p className="px-6 pb-5 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t(aKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
