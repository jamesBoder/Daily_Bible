import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useStreak } from '../../contexts/StreakContext';
import api from '../../services/api/api';
import AvatarRing from '../../components/AvatarRing';
import JourneyStats from './JourneyStats';
import NextMilestoneBar from './NextMilestoneBar';
import MilestoneWall, { MilestoneItem } from './MilestoneWall';
import StreakCalendar from './StreakCalendar';

// ── Types ──────────────────────────────────────────────────────────────────────

interface StreakSection {
  current_streak: number;
  longest_streak: number;
  blessings_balance: number;
  grace_days_remaining: number;
  streak_recoverable: boolean;
  next_milestone: {
    key: string;
    name: string;
    days_required: number;
    blessings_awarded: number;
  } | null;
}

interface ReadingStats {
  verses_read: number;
  days_active: number;
  favorites_count: number;
  reflections_count: number;
}

interface ProfileData {
  username: string;
  email: string;
  member_since: string;
  avatar_initials: string;
  avatar_color: string;
  is_premium: boolean;
  streak: StreakSection;
  milestones: MilestoneItem[];
  reading_stats: ReadingStats;
}

// ── Skeleton helpers ──────────────────────────────────────────────────────────

const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-xl ${className}`} />
);

const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Shimmer className="w-24 h-24 rounded-full" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-6 w-40" />
        <Shimmer className="h-4 w-32" />
      </div>
    </div>
    <div className="flex gap-3">
      <Shimmer className="flex-1 h-20" />
      <Shimmer className="flex-1 h-20" />
      <Shimmer className="flex-1 h-20" />
    </div>
    <Shimmer className="h-4 w-full" />
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 9 }).map((_, i) => (
        <Shimmer key={i} className="w-16 h-16 rounded-full flex-shrink-0" />
      ))}
    </div>
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 35 }).map((_, i) => (
        <Shimmer key={i} className="w-8 h-8 rounded-full" />
      ))}
    </div>
    <div className="space-y-2">
      <Shimmer className="h-4 w-48" />
      <Shimmer className="h-4 w-36" />
    </div>
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/60 overflow-hidden">
    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
        {title}
      </h2>
    </div>
    <div className="px-4 sm:px-5 pb-4 sm:pb-5">
      {children}
    </div>
  </section>
);

// ── Main Profile page ─────────────────────────────────────────────────────────

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { useGraceDay: applyGraceDay } = useStreak();
  const navigate = useNavigate();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectionError, setSectionError] = useState(false);
  const [graceLoading, setGraceLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/profile/aggregate');
      setData(res.data);
    } catch {
      setSectionError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleGraceDay = async () => {
    setGraceLoading(true);
    const result = await applyGraceDay();
    if (result.success) {
      fetchProfile();
    }
    setGraceLoading(false);
  };

  // Highest earned milestone key for the AvatarRing tier.
  const highestMilestone = data?.milestones.filter(m => m.earned).slice(-1)[0]?.key;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
          {t('profile.section_error', 'Could not load this section. Pull to refresh.')}
        </p>
      </div>
    );
  }

  const memberSince = new Date(data.member_since).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/60 px-4 sm:px-5 py-4 sm:py-5 flex items-center gap-4">
        <AvatarRing
          username={data.username}
          userId={user?.id ?? 0}
          highestMilestoneKey={highestMilestone}
          size={68}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {data.username}
          </h1>
          {data.is_premium && (
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full text-white mt-1"
              style={{ background: 'var(--blessing-gold)' }}
            >
              {t('profile.devoted_member', 'Devoted Member')}
            </span>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t('profile.member_since', 'Member since')} {memberSince}
          </p>
        </div>
      </div>

      {/* My Journey */}
      <Section title={t('profile.my_journey', 'My Journey')}>
        {sectionError ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {t('profile.section_error', 'Could not load this section. Pull to refresh.')}
          </p>
        ) : (
          <div className="space-y-4">
            <JourneyStats
              currentStreak={data.streak.current_streak}
              longestStreak={data.streak.longest_streak}
              blessingsBalance={data.streak.blessings_balance}
            />
            <NextMilestoneBar
              currentStreak={data.streak.current_streak}
              nextMilestone={data.streak.next_milestone}
            />
            {data.streak.current_streak === 0 && (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                {t('profile.begin_desc', "Open today's verse to begin your streak. Your faithfulness will be honored here.")}
              </p>
            )}
            {data.streak.streak_recoverable && (
              <button
                onClick={handleGraceDay}
                disabled={graceLoading}
                className="w-full py-2.5 px-4 rounded-2xl border text-sm font-medium transition-colors
                           border-purple-400 text-purple-600 dark:text-purple-400
                           hover:bg-purple-50 dark:hover:bg-purple-900/20
                           disabled:opacity-50 min-h-[44px]"
              >
                {graceLoading
                  ? t('profile.grace_loading', 'Using Grace Day…')
                  : t('profile.use_grace_day', 'Use a Grace Day')}
              </button>
            )}
          </div>
        )}
      </Section>

      {/* Milestones */}
      <Section title={t('profile.milestones', 'Milestones')}>
        <MilestoneWall
          milestones={data.milestones}
          currentStreak={data.streak.current_streak}
        />
      </Section>

      {/* This Month */}
      <Section title={t('profile.this_month', 'This Month')}>
        <StreakCalendar isPremium={data.is_premium} />
      </Section>

      {/* Your Reading */}
      <Section title={t('profile.your_reading', 'Your Reading')}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: data.reading_stats.verses_read,       label: t('profile.verses_read', 'Verses Read'),  icon: '📖', color: '#3b82f6' },
            { value: data.reading_stats.favorites_count,   label: t('profile.favorites', 'Favorites'),      icon: '❤️', color: '#ef4444' },
            { value: data.reading_stats.reflections_count, label: t('profile.reflections', 'Reflections'),  icon: '📝', color: '#10b981' },
            { value: data.reading_stats.days_active,       label: t('profile.days_active', 'Days Active'),  icon: '📅', color: '#8b5cf6' },
          ].map(({ value, label, icon, color }) => (
            <div
              key={label}
              className="rounded-xl bg-gray-50 dark:bg-gray-700/50 p-4 flex flex-col gap-1"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums leading-none">
                {value}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Account */}
      <Section title={t('profile.account', 'Account')}>
        <div className="flex items-center justify-between gap-3 min-w-0">
          <span className="text-sm text-gray-600 dark:text-gray-400 truncate min-w-0">{data.email}</span>
          <button
            onClick={() => navigate('/settings')}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex-shrink-0 min-h-[44px] flex items-center"
          >
            {t('profile.account_settings', 'Account Settings')}
          </button>
        </div>
      </Section>

    </div>
  );
};
