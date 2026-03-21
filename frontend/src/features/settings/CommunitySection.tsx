import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCirclePlus, X, Check } from '@phosphor-icons/react';
import { useFriends } from '../../hooks/useFriends';

/**
 * CommunitySection — displayed inside the Settings page (Account section).
 * Shows the friend list, pending requests, and an add-friend form.
 * Layout is compact (list-style) as opposed to the full-page LeaderboardView.
 */
export const CommunitySection: React.FC = () => {
  const { t } = useTranslation();
  const {
    friends,
    pendingRequests,
    isLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    isSending,
  } = useFriends();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async () => {
    if (!username.trim()) return;
    setError('');
    setSuccess('');
    try {
      await sendRequest(username.trim());
      setSuccess(t('leaderboard.request_sent', 'Friend request sent!'));
      setUsername('');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('leaderboard.request_failed', 'Failed to send request');
      setError(msg);
    }
  };

  if (isLoading) return null;

  return (
    <section aria-labelledby="community-section-heading">
      <h2 id="community-section-heading" style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--foreground)' }}>
        {t('settings.community', 'Community')}
      </h2>

      {/* Pending incoming requests */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--candle-amber)', marginBottom: '0.4rem' }}>
            {t('leaderboard.pending_requests', 'Friend Requests')} ({pendingRequests.length})
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pendingRequests.map((req) => (
              <li
                key={req.request_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.45rem 0',
                  borderBottom: '1px solid var(--journal-surface)',
                }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>{req.username}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => acceptRequest(req.request_id)}
                    aria-label={t('leaderboard.accept', 'Accept')}
                  >
                    <Check size={14} weight="bold" />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => rejectRequest(req.request_id)}
                    aria-label={t('leaderboard.reject', 'Decline')}
                  >
                    <X size={14} weight="bold" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Friends list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1rem' }}>
        {friends.length === 0 ? (
          <li style={{ color: 'var(--grace-lavender)', fontSize: '0.9rem', padding: '0.5rem 0' }}>
            {t('leaderboard.no_friends', 'No friends yet — add one below!')}
          </li>
        ) : (
          friends.map((friend) => (
            <li
              key={friend.friend_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.45rem 0',
                borderBottom: '1px solid var(--journal-surface)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--candle-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--parchment)',
                  flexShrink: 0,
                }}
              >
                {friend.avatar_initials}
              </div>
              <span style={{ flex: 1, color: 'var(--foreground)', fontSize: '0.9rem' }}>{friend.username}</span>
              <span style={{ color: 'var(--candle-amber)', fontSize: '0.82rem' }}>
                {friend.current_streak} {t('leaderboard.days_short', 'd')}
              </span>
              <button
                className="btn btn-sm btn-ghost"
                style={{ opacity: 0.6 }}
                onClick={() => removeFriend(friend.friend_id)}
                aria-label={t('leaderboard.remove_friend', 'Remove friend')}
              >
                <X size={13} weight="bold" />
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Add friend input */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t('leaderboard.username_placeholder', 'Username')}
          className="input"
          style={{ flex: 1, minWidth: 140 }}
          aria-label={t('leaderboard.username_placeholder', 'Username')}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSend}
          disabled={isSending || !username.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <UserCirclePlus size={15} weight="bold" />
          {t('leaderboard.add', 'Add')}
        </button>
      </div>
      {error && (
        <p role="alert" style={{ color: 'var(--error, #e05)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
          {error}
        </p>
      )}
      {success && (
        <p role="status" style={{ color: 'var(--blessing-gold)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
          {success}
        </p>
      )}
    </section>
  );
};
