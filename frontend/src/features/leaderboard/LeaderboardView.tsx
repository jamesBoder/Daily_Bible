import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FriendsTab } from './FriendsTab';
import { CommunityTab } from './CommunityTab';

type Tab = 'friends' | 'community';

export const LeaderboardView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  return (
    <div className="leaderboard-view" style={{ maxWidth: 480, margin: '0 auto', padding: '1.25rem 1rem' }}>
      <h1
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--foreground)',
          marginBottom: '1.25rem',
        }}
      >
        {t('leaderboard.title', 'Community')}
      </h1>

      {/* Tab bar */}
      <div
        role="tablist"
        aria-label={t('leaderboard.tabs_label', 'Leaderboard tabs')}
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid var(--journal-surface)',
        }}
      >
        {(['friends', 'community'] as Tab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem 1rem',
              fontWeight: activeTab === tab ? 700 : 400,
              color: activeTab === tab ? 'var(--blessing-gold)' : 'var(--grace-lavender)',
              borderBottom: activeTab === tab ? '2px solid var(--blessing-gold)' : '2px solid transparent',
              marginBottom: '-2px',
              fontSize: '0.95rem',
              transition: 'color 0.15s',
            }}
          >
            {tab === 'friends'
              ? t('leaderboard.tab_friends', 'Friends')
              : t('leaderboard.tab_community', 'Community')}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'friends' ? <FriendsTab /> : <CommunityTab />}
    </div>
  );
};
