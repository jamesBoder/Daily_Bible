import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@phosphor-icons/react';
import RosaryView from './RosaryView';

type PrayerView = 'home' | 'rosary';

const GuidedPrayerHome: React.FC = () => {
  const { t } = useTranslation();
  const [view, setView] = useState<PrayerView>('home');

  if (view === 'rosary') {
    return <RosaryView onBack={() => setView('home')} />;
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4 max-w-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'color-mix(in srgb, var(--blessing-gold) 15%, transparent)' }}
        >
          <span className="text-xl">🙏</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)] leading-tight">
            {t('prayer.guidedPrayerTitle', 'Guided Prayer')}
          </h1>
          <p className="text-xs text-[var(--journal-text-muted)] mt-0.5">
            {t('prayer.guidedPrayerSubtitle', 'Structured prayer to draw you closer to God')}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Rosary card — featured */}
        <button
          onClick={() => { if (navigator.vibrate) navigator.vibrate(8); setView('rosary'); }}
          className="w-full text-left px-4 py-5 rounded-2xl border border-amber-200/70 dark:border-amber-800/50 active:scale-[0.98] transition-all"
          style={{
            background: 'color-mix(in srgb, var(--candle-amber) 5%, var(--card-bg))',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'color-mix(in srgb, var(--candle-amber) 15%, transparent)' }}
            >
              📿
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--foreground)]">
                {t('prayer.rosaryTitle', 'The Rosary')}
              </p>
              <p className="text-xs text-[var(--journal-text-muted)] mt-0.5 leading-snug">
                {t('prayer.rosaryDesc', 'Pray all 59 beads with guided prayers and mysteries.')}
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--candle-amber)', flexShrink: 0 }} />
          </div>
        </button>

        {/* Coming soon section label */}
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--journal-text-muted)] px-1 mt-2">
          {t('prayer.comingSoonLabel', 'Coming Soon')}
        </p>

        {/* Coming soon cards */}
        {[
          { icon: '🕊️', key: 'lectio', label: "Lectio Divina", desc: "Meditative scripture reading in four movements." },
          { icon: '🕯️', key: 'examens', label: "Daily Examen", desc: "Reflect on your day in five prayerful steps." },
        ].map(item => (
          <div
            key={item.key}
            className="px-4 py-4 rounded-2xl border border-[var(--theme-border)] opacity-55 pointer-events-none select-none"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-[var(--theme-surface)]">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {item.label}
                </p>
                <p className="text-xs text-[var(--journal-text-muted)] mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuidedPrayerHome;
