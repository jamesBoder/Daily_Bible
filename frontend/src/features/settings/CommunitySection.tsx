import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStreak } from '../../contexts/StreakContext';
import { LockedFeatureCard } from '../../components/common/LockedFeatureCard';
import { SettingsToggle } from '../../components/ui/SettingsToggle';
import apiClient from '../../services/api/client';

/**
 * CommunitySection — displayed inside the Settings page (Account section).
 * Premium users: toggle to opt in/out of automatic milestone celebration posts.
 * Free users: locked card.
 */
export const CommunitySection: React.FC = () => {
  const { t } = useTranslation();
  const { subscription } = useStreak();
  const isPremium = subscription?.is_premium ?? false;

  const [milestoneOptIn, setMilestoneOptIn] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    apiClient.get('/settings').then((r) => {
      setMilestoneOptIn(r.data.milestone_posts_opt_in ?? true);
    }).catch(() => {});
  }, []);

  const handleToggle = async (value: boolean) => {
    if (isUpdating) return;
    setMilestoneOptIn(value); // Optimistic
    setIsUpdating(true);
    try {
      await apiClient.put('/settings', { milestone_posts_opt_in: value });
    } catch {
      setMilestoneOptIn(!value); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section aria-labelledby="community-section-heading">
      <h2
        id="community-section-heading"
        style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}
      >
        {t('settings.community.title', 'Community')}
      </h2>

      {isPremium ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, margin: 0, fontSize: '0.95rem' }}>
              {t('settings.community.milestone_posts', 'Milestone Celebrations')}
            </p>
            <p style={{ color: 'var(--grace-lavender)', fontSize: '0.82rem', margin: '0.15rem 0 0' }}>
              {t(
                'settings.community.milestone_posts_description',
                'Share your streak milestones with the community.'
              )}
            </p>
          </div>
          <SettingsToggle
            checked={milestoneOptIn}
            onChange={handleToggle}
            disabled={isUpdating}
          />
        </div>
      ) : (
        <LockedFeatureCard
          featureDescription={t(
            'settings.community.milestone_locked',
            'Upgrade to share milestones with the community.'
          )}
        />
      )}
    </section>
  );
};
