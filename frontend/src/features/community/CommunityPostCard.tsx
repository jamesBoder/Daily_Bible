import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PostResponse } from '../../services/api/community';
import { HandsPraying, Heart, SmileySticker, Users, Flame, PushPin, Trash } from '@phosphor-icons/react';
import './community.css';

interface Props {
  post: PostResponse;
  index?: number;
  onAddReaction: (postId: number, reactionType: string) => void;
  onRemoveReaction: (postId: number, reactionType: string) => void;
  onDelete?: (postId: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  announcement: 'community.post_type.announcement',
  milestone: 'community.post_type.milestone',
  prayer: 'community.post_type.prayer',
  challenge: 'community.post_type.challenge',
};

const REACTION_ICONS: Record<string, React.ReactNode> = {
  amen:  <SmileySticker size={14} weight="fill" />,
  pray:  <HandsPraying size={14} weight="fill" />,
  heart: <Heart size={14} weight="fill" />,
  join:  <Users size={14} weight="fill" />,
};

function relativeTime(
  isoString: string,
  t: (key: string, fallback: string, opts?: Record<string, unknown>) => string,
): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return t('community.time.just_now',   'just now');
  if (mins < 60) return t('community.time.mins_ago',   '{{count}}m ago', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return t('community.time.hours_ago',  '{{count}}h ago', { count: hrs });
  const days = Math.floor(hrs / 24);
  return t('community.time.days_ago', '{{count}}d ago', { count: days });
}

function prayerDaysLeft(expiresAt: string): number {
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

export const CommunityPostCard: React.FC<Props> = React.memo(({
  post,
  index = 0,
  onAddReaction,
  onRemoveReaction,
  onDelete,
}) => {
  const { t } = useTranslation();
  // Track which reaction type was just selected so we can fire the pop animation.
  const [poppedReaction, setPoppedReaction] = useState<string | null>(null);
  // Long post truncation — "Show more / Show less"
  const BODY_CHAR_LIMIT = 280;
  const isLong = post.body.length > BODY_CHAR_LIMIT;
  const [expanded, setExpanded] = useState(false);

  const isAnnouncement = post.post_type === 'announcement';
  const isMilestone   = post.post_type === 'milestone';
  const isPrayer      = post.post_type === 'prayer';
  const isChallenge   = post.post_type === 'challenge';

  const accentColor = isAnnouncement
    ? 'var(--candle-amber)'
    : isMilestone
    ? 'var(--blessing-gold)'
    : isPrayer
    ? 'var(--grace-lavender)'
    : isChallenge
    ? 'var(--challenge-accent)'
    : 'var(--theme-border, var(--journal-border))';

  // Keep borderColor alias so reaction bar code stays unchanged
  const borderColor = accentColor;

  const avatarBg = isAnnouncement || isChallenge
    ? 'var(--candle-amber)'
    : isMilestone
    ? 'var(--blessing-gold)'
    : isPrayer
    ? 'var(--grace-lavender)'
    : 'var(--journal-surface-alt, #ede8da)';

  const avatarLabel = post.is_admin
    ? '✝'
    : isPrayer
    ? '🙏'
    : isMilestone
    ? '🔥'
    : isChallenge
    ? '⚡'
    : (post.username ?? '?').slice(0, 2).toUpperCase();

  const showTypeLabel = post.post_type !== 'user';
  const typeKey = TYPE_LABELS[post.post_type];

  const handleReaction = useCallback(
    (type: string) => {
      if (post.user_reacted.includes(type)) {
        onRemoveReaction(post.id, type);
      } else {
        onAddReaction(post.id, type);
        // Trigger pop animation, then clear after it finishes.
        setPoppedReaction(type);
        setTimeout(() => setPoppedReaction(null), 400);
      }
    },
    [post.id, post.user_reacted, onAddReaction, onRemoveReaction],
  );

  const reactionTypes = isPrayer
    ? ['pray', 'heart']
    : isChallenge
    ? ['join', 'amen', 'heart']
    : ['amen', 'heart'];

  // Stagger entrance: cap at 300ms so long feeds don't feel slow.
  const entranceDelay = `${Math.min(index * 0.04, 0.3)}s`;

  const fullTimestamp = new Date(post.created_at).toLocaleString();

  return (
    <div
      className="community-card-enter community-post-card"
      style={{
        borderTop: `3px solid ${accentColor}`,
        padding: '0.9rem 1rem 0.75rem',
        marginBottom: '0.85rem',
        background: 'var(--card-bg, var(--parchment))',
        borderRadius: 16,
        position: 'relative',
        animationDelay: entranceDelay,
        boxShadow: post.is_pinned
          ? `0 2px 12px ${accentColor}33`
          : '0 1px 6px rgba(0,0,0,0.07)',
      }}
    >
      {/* Pinned indicator */}
      {post.is_pinned && (
        <span
          style={{
            position: 'absolute',
            top: '0.55rem',
            right: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            color: 'var(--candle-amber)',
          }}
        >
          <span className="pin-drop" style={{ display: 'inline-flex' }}>
            <PushPin size={13} weight="fill" />
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.8, letterSpacing: '0.03em' }}>
            {t('community.pinned_label', 'Pinned')}
          </span>
        </span>
      )}

      {/* Header row with avatar */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', marginBottom: '0.5rem' }}>
        {/* Avatar */}
        <div
          style={{
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: avatarBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: post.is_admin || isPrayer || isMilestone || isChallenge ? '0.95rem' : '0.72rem',
            fontWeight: 700,
            color: isAnnouncement || isMilestone || isChallenge ? '#1a1208' : 'var(--foreground)',
            border: `1.5px solid ${accentColor}55`,
            userSelect: 'none',
          }}
          aria-hidden
        >
          {avatarLabel}
        </div>

        {/* Name + type badge + timestamp */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {isMilestone && <Flame size={13} weight="duotone" style={{ color: 'var(--blessing-gold)', flexShrink: 0 }} />}
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--foreground)',
                fontWeight: post.is_admin ? 700 : 600,
              }}
            >
              {post.is_admin ? t('community.admin_author', 'Words of Praise') : post.username}
            </span>
            {showTypeLabel && typeKey && (
              <span className="community-type-badge" style={{ color: accentColor, borderColor: `${accentColor}55` }}>
                {t(typeKey, post.post_type)}
              </span>
            )}
            <span
              title={fullTimestamp}
              style={{ fontSize: '0.73rem', color: 'var(--grace-lavender)', marginLeft: 'auto', cursor: 'default', flexShrink: 0 }}
            >
              {relativeTime(post.created_at, t)}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <p style={{
        color: 'var(--foreground)',
        fontSize: '0.92rem',
        lineHeight: 1.5,
        margin: '0 0 0.5rem',
        ...(!expanded && isLong ? {
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        } : {}),
      }}>
        {isPrayer && <span style={{ marginRight: '0.3rem', fontSize: '1rem' }}>🙏</span>}
        {post.body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0 0 0.4rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--candle-amber)',
            cursor: 'pointer',
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Prayer expiry countdown — shown when <= 3 days remain */}
      {isPrayer && post.expires_at && (() => {
        const daysLeft = prayerDaysLeft(post.expires_at);
        if (daysLeft > 3) return null;
        return (
          <p
            style={{
              color: daysLeft <= 1 ? 'var(--error, #e05)' : 'var(--candle-amber)',
              fontSize: '0.75rem',
              margin: '0 0 0.4rem',
            }}
          >
            {daysLeft <= 0
              ? t('community.expiry.expiring_soon', 'Expiring soon')
              : t('community.expiry.expires_in_days', 'Expires in {{count}} day', { count: daysLeft })}
          </p>
        );
      })()}

      {/* Challenge join count */}
      {isChallenge && (post.reactions.join ?? 0) > 0 && (
        <p style={{ color: 'var(--grace-lavender)', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>
          <Users size={12} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />
          {t('community.challenge.joined_count', '{{count}} people joined', { count: post.reactions.join })}
        </p>
      )}

      {/* Reaction bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {reactionTypes.map((type) => {
          const reacted = post.user_reacted.includes(type);
          const count   = post.reactions[type] ?? 0;
          const isPopping = poppedReaction === type;

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.5rem 0.75rem',
                minHeight: 44,
                borderRadius: 20,
                border: `1px solid ${reacted ? borderColor : 'var(--journal-surface)'}`,
                background: reacted ? `${borderColor}22` : 'transparent',
                color: reacted ? borderColor : 'var(--grace-lavender)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: reacted ? 700 : 400,
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
              aria-pressed={reacted}
              aria-label={`${t(`community.reaction.${type}`, type)} (${count})`}
            >
              <span className={isPopping ? 'reaction-pop' : undefined} style={{ display: 'inline-flex' }}>
                {REACTION_ICONS[type]}
              </span>
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}

        {/* Delete button for own posts */}
        {post.is_self && onDelete && (
          <button
            onClick={() => {
              if (window.confirm(t('community.delete.confirm', 'Delete this post?'))) {
                onDelete(post.id);
              }
            }}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--grace-lavender)',
              cursor: 'pointer',
              opacity: 0.6,
              padding: '0.15rem',
              transition: 'opacity 0.15s',
            }}
            aria-label={t('community.delete.btn', 'Delete')}
          >
            <Trash size={13} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
});
