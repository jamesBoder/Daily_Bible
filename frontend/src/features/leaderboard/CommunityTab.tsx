import React from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from '@phosphor-icons/react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useStreak } from '../../contexts/StreakContext';
import { LockedFeatureCard } from '../../components/common/LockedFeatureCard';
import { SettingsToggle } from '../../components/ui/SettingsToggle';

export const CommunityTab: React.FC = () => {
  const { t } = useTranslation();
  const { communityBoard, isLoading, setVisibility, isSettingVisibility } = useLeaderboard();
  const { subscription } = useStreak();
  const isPremium = subscription?.is_premium ?? false;

  // Find current user's visibility preference from their self entry
  const selfEntry = communityBoard.find((e) => e.is_self);
  const otherEntries = communityBoard.filter((e) => !e.is_self);

  const handleVisibilityToggle = async (visible: boolean) => {
    try {
      await setVisibility(visible);
    } catch {
      // Visibility update failed silently — optimistic state handled by React Query
    }
  };

  if (isLoading) {
    return (
      <div className="leaderboard-loading" aria-busy="true">
        <span>{t('common.loading', 'Loading...')}</span>
      </div>
    );
  }

  const walkerCount = communityBoard.length;

  return (
    <div className="community-tab">
      {/* Ranked list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
        {otherEntries.length === 0 ? (
          <li style={{ color: 'var(--grace-lavender)', textAlign: 'center', padding: '1rem 0' }}>
            {t('leaderboard.community_empty', 'No one has joined the community board yet.')}
          </li>
        ) : (
          otherEntries.map((entry) => (
            <li
              key={entry.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0',
                borderBottom: '1px solid var(--journal-surface)',
              }}
            >
              <span
                style={{
                  minWidth: 28,
                  textAlign: 'right',
                  color: 'var(--candle-amber)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                {entry.rank}
              </span>
              <Flame size={16} weight="fill" style={{ color: 'var(--candle-amber)' }} aria-hidden="true" />
              <span style={{ flex: 1, color: 'var(--foreground)', fontWeight: entry.is_self ? 700 : 400 }}>
                {entry.username}
                {entry.is_self && (
                  <span style={{ color: 'var(--grace-lavender)', fontWeight: 400, marginLeft: '0.35rem', fontSize: '0.82rem' }}>
                    ({t('leaderboard.you', 'you')})
                  </span>
                )}
              </span>
              <span style={{ color: 'var(--candle-amber)', fontWeight: 600 }}>
                {t('leaderboard.days', '{{count}} days', { count: entry.current_streak })}
              </span>
            </li>
          ))
        )}
      </ul>

      {/* "Walking with N others" separator + self entry */}
      {selfEntry && (
        <>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--grace-lavender)',
              fontSize: '0.85rem',
              borderTop: '1px solid var(--journal-surface)',
              paddingTop: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            {t('leaderboard.walking_with', 'Walking with {{count}} others', { count: walkerCount - 1 })}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0',
            }}
          >
            <Flame size={16} weight="fill" style={{ color: 'var(--blessing-gold)' }} aria-hidden="true" />
            <span style={{ flex: 1, color: 'var(--foreground)', fontWeight: 700 }}>
              {t('leaderboard.you', 'You')} ({selfEntry.username})
            </span>
            <span style={{ color: 'var(--blessing-gold)', fontWeight: 600 }}>
              {t('leaderboard.days', '{{count}} days', { count: selfEntry.current_streak })}
            </span>
          </div>
        </>
      )}

      {/* Visibility toggle (premium) or locked card (free) */}
      <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--journal-surface)', paddingTop: '1.25rem' }}>
        {isPremium ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>
                {t('leaderboard.appear_on_board', 'Appear on the leaderboard')}
              </p>
              <p style={{ color: 'var(--grace-lavender)', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>
                {t('leaderboard.appear_description', 'Let others see your faithfulness journey')}
              </p>
            </div>
            <SettingsToggle
              checked={selfEntry !== undefined}
              onChange={handleVisibilityToggle}
              disabled={isSettingVisibility}
            />
          </div>
        ) : (
          <LockedFeatureCard
            featureDescription={t(
              'leaderboard.locked_visibility',
              'Upgrade to Premium to appear on the community leaderboard and inspire others with your faithfulness.'
            )}
          />
        )}
      </div>
    </div>
  );
};
