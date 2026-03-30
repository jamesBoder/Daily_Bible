import React from 'react';
import { useTranslation } from 'react-i18next';
import { PostResponse } from '../../services/api/community';
import { CommunityPostCard } from './CommunityPostCard';
import { CommunityPostSkeleton } from './CommunityPostSkeleton';

interface Props {
  posts: PostResponse[];
  isLoading: boolean;
  onAddReaction: (postId: number, reactionType: string) => void;
  onRemoveReaction: (postId: number, reactionType: string) => void;
}

const SKELETON_COUNT = 1;

export const ChallengesTab: React.FC<Props> = ({ posts, isLoading, onAddReaction, onRemoveReaction }) => {
  const { t } = useTranslation();

  const challengePosts = posts.filter((p) => p.post_type === 'challenge');

  if (isLoading && challengePosts.length === 0) {
    return (
      <>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <CommunityPostSkeleton key={i} />
        ))}
      </>
    );
  }

  if (challengePosts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚡</div>
        <p style={{ color: 'var(--grace-lavender)', margin: 0 }}>
          {t('community.empty.challenge', 'No active challenge this week — one will be posted soon.')}
        </p>
      </div>
    );
  }

  return (
    <div className="challenges-tab">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1rem',
        borderRadius: 12,
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.22)',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⚡</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>
            {t('community.tab.challenges', 'Challenges')}
          </div>
          <div style={{ color: 'var(--grace-lavender)', fontSize: '0.78rem' }}>
            {t('community.challenges.subtitle', 'Weekly faith challenges from the community')}
          </div>
        </div>
      </div>
      {challengePosts.map((post, i) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          index={i}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
        />
      ))}
    </div>
  );
};
