import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useStreak } from '../../contexts/StreakContext';
import api from '../../services/api/api';
import { profileService } from '../../services/api/profile';
import AvatarRing from '../../components/AvatarRing';
import JourneyStats from './JourneyStats';
import NextMilestoneBar from './NextMilestoneBar';
import MilestoneWall, { MilestoneItem } from './MilestoneWall';
import StreakCalendar from './StreakCalendar';
import { StreakShareCard } from '../streak/StreakShareCard';

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
  pending_email?: string;
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

// Small icon shown inside edit inputs to indicate availability check status
const FieldStatusIcon: React.FC<{ status: 'idle' | 'checking' | 'available' | 'taken' }> = ({ status }) => {
  if (status === 'idle') return null;
  return (
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
      {status === 'checking' && (
        <svg className="w-3.5 h-3.5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {status === 'available' && (
        <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'taken' && (
        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
    </span>
  );
};

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
  <section className="bg-[var(--theme-surface)] rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/60 transition-shadow duration-200 hover:shadow-md">
    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-2 sm:pb-3">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-[var(--journal-text-muted)]">
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
  const qc = useQueryClient();

  const { data, isLoading: loading, isError: sectionError, refetch } = useQuery<ProfileData>({
    queryKey: ['profile-aggregate'],
    queryFn: () => api.get('/api/profile/aggregate').then(r => r.data),
    staleTime: 5 * 60 * 1000,
    enabled: !!user,
  });

  const [graceLoading, setGraceLoading] = useState(false);

  // Inline edit state
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmailConfirm, setEditEmailConfirm] = useState('');
  const [editCurrentPassword, setEditCurrentPassword] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Availability check state
  type AvailStatus = 'idle' | 'checking' | 'available' | 'taken';
  const [usernameStatus, setUsernameStatus] = useState<AvailStatus>('idle');
  const [emailStatus, setEmailStatus] = useState<AvailStatus>('idle');
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const emailTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleEditOpen = () => {
    if (!data) return;
    setEditUsername(data.username);
    setEditEmail(data.email);
    setEditEmailConfirm('');
    setEditCurrentPassword('');
    setEditError(null);
    setUsernameStatus('idle');
    setEmailStatus('idle');
    setEditMode(true);
  };

  const handleEditCancel = () => {
    clearTimeout(usernameTimerRef.current);
    clearTimeout(emailTimerRef.current);
    setEditMode(false);
    setEditError(null);
    setEditEmailConfirm('');
    setEditCurrentPassword('');
    setUsernameStatus('idle');
    setEmailStatus('idle');
  };

  const handleUsernameChange = (value: string) => {
    setEditUsername(value);
    clearTimeout(usernameTimerRef.current);
    if (!data || value === data.username) {
      setUsernameStatus('idle');
      return;
    }
    if (value.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/api/profile/check-availability?username=${encodeURIComponent(value)}`);
        setUsernameStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 500);
  };

  const handleEmailChange = (value: string) => {
    setEditEmail(value);
    clearTimeout(emailTimerRef.current);
    if (!data || value === data.email) {
      setEmailStatus('idle');
      return;
    }
    if (!value.includes('@')) {
      setEmailStatus('idle');
      return;
    }
    setEmailStatus('checking');
    emailTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/api/profile/check-availability?email=${encodeURIComponent(value)}`);
        setEmailStatus(res.data.available ? 'available' : 'taken');
      } catch {
        setEmailStatus('idle');
      }
    }, 600);
  };

  const emailChanging = data ? editEmail !== data.email : false;
  const emailConfirmMismatch = emailChanging && editEmailConfirm !== editEmail;

  const handleEditSave = async () => {
    if (!data) return;
    if (usernameStatus === 'taken' || emailStatus === 'taken') return;
    if (emailConfirmMismatch) return;
    setEditSaving(true);
    setEditError(null);
    try {
      const payload: Record<string, string> = { username: editUsername, email: editEmail };
      if (editCurrentPassword) payload.current_password = editCurrentPassword;
      const result = await profileService.updateProfile(payload);
      // If an email change is pending, keep the old email displayed; update username only
      qc.setQueryData<ProfileData>(['profile-aggregate'], prev => {
        if (!prev) return prev;
        return {
          ...prev,
          username: editUsername,
          // email stays unchanged until verified
          pending_email: emailChanging ? editEmail : (result as any).pending_email,
        };
      });
      setEditCurrentPassword('');
      setEditEmailConfirm('');
      setEditMode(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || t('profile.edit_error', 'Failed to update profile');
      setEditError(msg);
    } finally {
      setEditSaving(false);
    }
  };

  const handleGraceDay = async () => {
    setGraceLoading(true);
    const result = await applyGraceDay();
    if (result.success) {
      qc.invalidateQueries({ queryKey: ['profile-aggregate'] });
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
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-[var(--journal-text-muted)]">
          {t('profile.section_error', 'Could not load your profile.')}
        </p>
        <button
          onClick={() => refetch()}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ background: 'var(--blessing-gold)', color: '#000' }}
        >
          {t('common.retry', 'Retry')}
        </button>
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
      <div className="bg-[var(--theme-surface)] rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700/60 px-4 sm:px-5 py-4 sm:py-5 transition-shadow duration-200 hover:shadow-md">
        <div className="flex items-center gap-4">
          <AvatarRing
            username={editMode ? editUsername || data.username : data.username}
            userId={user?.id ?? 0}
            highestMilestoneKey={highestMilestone}
            size={68}
          />
          <div className="flex-1 min-w-0">
            {!editMode ? (
              <div key="display" className="animate-fade-in">
                <h1 className="text-xl font-bold text-[var(--foreground)] break-all">
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
                <p className="text-xs text-[var(--journal-text-muted)] mt-1">
                  {t('profile.member_since', 'Member since')} {memberSince}
                </p>
              </div>
            ) : (
              <div key="edit" className="space-y-2 w-full animate-fade-in">
                {/* Username field */}
                <div className="relative">
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => handleUsernameChange(e.target.value)}
                    placeholder={t('profile.username_placeholder', 'Username')}
                    className={[
                      'w-full text-sm px-3 py-1.5 pr-8 rounded-lg border bg-[var(--journal-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2',
                      usernameStatus === 'taken'
                        ? 'border-red-400 focus:ring-red-300'
                        : usernameStatus === 'available'
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-[var(--theme-border)] focus:ring-primary-400',
                    ].join(' ')}
                  />
                  <FieldStatusIcon status={usernameStatus} />
                </div>
                {usernameStatus === 'taken' && (
                  <p className="text-xs text-red-500 dark:text-red-400 -mt-1">
                    {t('profile.username_taken', 'Username already taken')}
                  </p>
                )}

                {/* Email field */}
                <div className="relative">
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder={t('profile.email_placeholder', 'Email')}
                    className={[
                      'w-full text-sm px-3 py-1.5 pr-8 rounded-lg border bg-[var(--journal-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2',
                      emailStatus === 'taken'
                        ? 'border-red-400 focus:ring-red-300'
                        : emailStatus === 'available'
                        ? 'border-green-400 focus:ring-green-300'
                        : 'border-[var(--theme-border)] focus:ring-primary-400',
                    ].join(' ')}
                  />
                  <FieldStatusIcon status={emailStatus} />
                </div>
                {emailStatus === 'taken' && (
                  <p className="text-xs text-red-500 dark:text-red-400 -mt-1">
                    {t('profile.email_taken', 'Email already in use')}
                  </p>
                )}

                {/* Confirm new email — shown when email is being changed */}
                {emailChanging && (
                  <div className="space-y-1">
                    <input
                      type="email"
                      value={editEmailConfirm}
                      onChange={e => setEditEmailConfirm(e.target.value)}
                      placeholder={t('profile.confirm_email_placeholder', 'Confirm new email')}
                      className={[
                        'w-full text-sm px-3 py-1.5 rounded-lg border bg-[var(--journal-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2',
                        emailConfirmMismatch && editEmailConfirm
                          ? 'border-red-400 focus:ring-red-300'
                          : editEmailConfirm && !emailConfirmMismatch
                          ? 'border-green-400 focus:ring-green-300'
                          : 'border-[var(--theme-border)] focus:ring-primary-400',
                      ].join(' ')}
                      autoComplete="off"
                    />
                    {emailConfirmMismatch && editEmailConfirm && (
                      <p className="text-xs text-red-500 dark:text-red-400">
                        {t('profile.email_confirm_mismatch', 'Email addresses do not match')}
                      </p>
                    )}
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {t('profile.pending_email_info', 'Your current email stays active until you click the confirmation link we send to the new address.')}
                    </p>
                  </div>
                )}

                {/* Current password — required when changing email on password-based accounts */}
                {emailChanging && (
                  <div className="space-y-1">
                    <input
                      type="password"
                      value={editCurrentPassword}
                      onChange={e => setEditCurrentPassword(e.target.value)}
                      placeholder={t('profile.current_password_placeholder', 'Current password to confirm')}
                      className="w-full text-sm px-3 py-1.5 rounded-lg border border-amber-400 bg-[var(--journal-surface)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-300"
                      autoComplete="current-password"
                    />
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {t('profile.password_required_for_email', 'Password required to change your email address')}
                    </p>
                  </div>
                )}

                {editError && (
                  <p className="text-xs text-red-500 dark:text-red-400">{editError}</p>
                )}
              </div>
            )}
          </div>

          {/* Edit / Save / Cancel buttons */}
          {!editMode ? (
            <button
              onClick={handleEditOpen}
              className="flex-shrink-0 p-2 rounded-lg text-[var(--journal-text-muted)] hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={t('profile.edit_profile', 'Edit profile')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6 3.536 3.536-6 6H9v-3.536z" />
              </svg>
            </button>
          ) : (
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={handleEditSave}
                disabled={editSaving || usernameStatus === 'taken' || emailStatus === 'taken' || usernameStatus === 'checking' || emailStatus === 'checking' || emailConfirmMismatch}
                className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors min-h-[32px]"
              >
                {editSaving ? t('common.saving', 'Saving…') : t('common.save', 'Save')}
              </button>
              <button
                onClick={handleEditCancel}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] text-[var(--foreground)] font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[32px]"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pending email change banner */}
      {data.pending_email && (
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-300 dark:ring-amber-700/60">
          <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {t('profile.pending_email_banner', 'Email change pending — check {{email}} for a confirmation link. Your current email remains active until you verify the new one.', { email: data.pending_email })}
          </p>
        </div>
      )}

      {/* My Journey */}
      <Section title={t('profile.my_journey', 'My Journey')}>
        {sectionError ? (
          <p className="text-sm text-[var(--journal-text-muted)]">
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
              <p className="text-sm text-center text-[var(--journal-text-muted)] py-2">
                {t('profile.begin_desc', "Open today's verse to begin your streak. Your faithfulness will be honored here.")}
              </p>
            )}
            {data.streak.current_streak > 0 && (
              <div
                className="rounded-xl px-4 py-3 text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(var(--candle-amber-rgb, 217,119,6), 0.12), rgba(251,191,36,0.08))',
                  border: '1px solid rgba(217,119,6,0.25)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--candle-amber, #d97706)' }}>
                  {data.streak.next_milestone
                    ? t('profile.streak_keep_going', '🕯 {{days}}-day streak — keep going! {{remaining}} more days to {{name}}.', {
                        days: data.streak.current_streak,
                        remaining: Math.max(data.streak.next_milestone.days_required - data.streak.current_streak, 0),
                        name: data.streak.next_milestone.name,
                      })
                    : t('profile.streak_amazing', '🕯 {{days}}-day streak — amazing dedication!', {
                        days: data.streak.current_streak,
                      })}
                </p>
              </div>
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
            {/* Phase 9: Streak Share Card — premium only */}
            <StreakShareCard
              currentStreak={data.streak.current_streak}
              milestoneName={data.milestones.filter(m => m.earned).slice(-1)[0]?.name}
              isPremium={data.is_premium}
            />
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
              className="rounded-xl bg-[var(--theme-surface)] p-4 flex flex-col items-center text-center gap-1 transition-transform duration-150 hover:scale-[1.03] hover:shadow-sm cursor-default"
              style={{ borderTop: `3px solid ${color}` }}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums leading-none">
                {value}
              </span>
              <span className="text-xs text-[var(--journal-text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </Section>

    </div>
  );
};
