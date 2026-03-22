import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import { PostResponse } from '../../services/api/community';
import { CommunityPostCard } from './CommunityPostCard';
import { CommunityPostSkeleton } from './CommunityPostSkeleton';

interface Props {
  posts: PostResponse[];
  isLoading: boolean;
  onCreatePrayer: (body: string, anonymous: boolean) => Promise<void>;
  onAddReaction: (postId: number, reactionType: string) => void;
  onRemoveReaction: (postId: number, reactionType: string) => void;
  onDelete: (postId: number) => void;
}

const SKELETON_COUNT = 2;

export const PrayerWallTab: React.FC<Props> = ({
  posts,
  isLoading,
  onCreatePrayer,
  onAddReaction,
  onRemoveReaction,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const prayerPosts = posts.filter((p) => p.post_type === 'prayer');

  const MAX_LENGTH = 280;
  const charsRemaining = MAX_LENGTH - body.length;
  const nearLimit = charsRemaining <= 50;

  const handleSubmit = async () => {
    if (!body.trim() || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onCreatePrayer(body.trim(), anonymous);
      setBody('');
      setAnonymous(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const status = axiosErr?.response?.status;
      const serverMsg = axiosErr?.response?.data?.error;
      if (status === 422 || serverMsg === 'profanity_detected') {
        setError(t('community.error.profanity', 'Your post contains inappropriate language. Please revise and try again.'));
      } else if (status === 429) {
        setError(t('community.error.rate_limit', 'Too many posts — please wait a few minutes.'));
      } else if (status === 401) {
        setError(t('community.error.login_required', 'Please log in to submit a prayer request.'));
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError(t('community.error.post_failed', 'Could not post. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="prayer-wall-tab">
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.75rem 1rem',
        borderRadius: 12,
        background: 'rgba(155, 143, 196, 0.10)',
        border: '1px solid rgba(155, 143, 196, 0.25)',
        marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🙏</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foreground)' }}>
            {t('community.prayer.wall_title', 'Prayer Wall')}
          </div>
          <div style={{ color: 'var(--grace-lavender)', fontSize: '0.78rem' }}>
            {t('community.prayer.expire_notice', 'Prayer requests expire after 7 days.')}
          </div>
        </div>
      </div>

      {isLoading && prayerPosts.length === 0 ? (
        Array.from({ length: SKELETON_COUNT }).map((_, i) => <CommunityPostSkeleton key={i} />)
      ) : prayerPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🙏</div>
          <p style={{ color: 'var(--grace-lavender)', margin: 0 }}>
            {t('community.empty.prayer', 'No prayer requests yet. Share what\'s on your heart.')}
          </p>
        </div>
      ) : (
        prayerPosts.map((post, i) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            index={i}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onDelete={post.is_self ? onDelete : undefined}
          />
        ))
      )}

      {/* Prayer composer */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          background: 'var(--journal-surface)',
          borderRadius: 8,
          border: '1px solid var(--grace-lavender)44',
        }}
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          placeholder={t('community.prayer.placeholder', 'Submit a prayer request...')}
          maxLength={MAX_LENGTH}
          rows={3}
          className="input"
          style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem', color: 'var(--foreground)' }}
          aria-label={t('community.prayer.placeholder', 'Submit a prayer request...')}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: 'var(--grace-lavender)',
            }}
          >
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            {t('community.prayer.anonymous_label', 'Post anonymously')}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {nearLimit && (
              <span
                style={{
                  fontSize: '0.78rem',
                  color: charsRemaining < 10 ? 'var(--error, #e05)' : 'var(--candle-amber)',
                }}
              >
                {charsRemaining}
              </span>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <PaperPlaneRight size={14} weight="bold" />
              {t('community.prayer.submit_btn', 'Submit')}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" style={{ color: 'var(--error, #e05)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
            {error}
          </p>
        )}
        <p style={{ color: 'var(--grace-lavender)', fontSize: '0.78rem', marginTop: '0.5rem' }}>
          {t('community.prayer.open_to_all', 'Prayer requests are open to all members.')}
        </p>
      </div>
    </div>
  );
};
