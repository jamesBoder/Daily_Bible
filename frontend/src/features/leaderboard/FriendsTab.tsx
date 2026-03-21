import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, UserCirclePlus, X, Check } from '@phosphor-icons/react';
import { useFriends } from '../../hooks/useFriends';

export const FriendsTab: React.FC = () => {
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
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const handleSendRequest = async () => {
    if (!username.trim()) return;
    setSendError('');
    setSendSuccess('');
    try {
      await sendRequest(username.trim());
      setSendSuccess(t('leaderboard.request_sent', 'Friend request sent!'));
      setUsername('');
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? t('leaderboard.request_failed', 'Failed to send request');
      setSendError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="leaderboard-loading" aria-busy="true">
        <span>{t('common.loading', 'Loading...')}</span>
      </div>
    );
  }

  return (
    <div className="friends-tab">
      {/* Pending incoming requests */}
      {pendingRequests.length > 0 && (
        <section className="pending-requests" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--candle-amber)', marginBottom: '0.5rem' }}>
            {t('leaderboard.pending_requests', 'Friend Requests')}
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {pendingRequests.map((req) => (
              <li
                key={req.request_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0',
                  borderBottom: '1px solid var(--journal-surface)',
                }}
              >
                <span style={{ color: 'var(--foreground)' }}>{req.username}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => acceptRequest(req.request_id)}
                    aria-label={t('leaderboard.accept', 'Accept')}
                  >
                    <Check size={16} weight="bold" />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => rejectRequest(req.request_id)}
                    aria-label={t('leaderboard.reject', 'Decline')}
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Friends list */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '1.5rem' }}>
        {friends.length === 0 ? (
          <li style={{ color: 'var(--grace-lavender)', textAlign: 'center', padding: '1rem 0' }}>
            {t('leaderboard.no_friends', 'No friends yet — add one below!')}
          </li>
        ) : (
          friends.map((friend) => (
            <li
              key={friend.friend_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0',
                borderBottom: '1px solid var(--journal-surface)',
              }}
            >
              {/* Avatar */}
              <div
                aria-hidden="true"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--candle-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: 'var(--parchment)',
                  flexShrink: 0,
                }}
              >
                {friend.avatar_initials}
              </div>

              <div style={{ flex: 1 }}>
                <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{friend.username}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                  <Flame size={14} weight="fill" style={{ color: 'var(--candle-amber)' }} aria-hidden="true" />
                  <span style={{ fontSize: '0.85rem', color: 'var(--candle-amber)' }}>
                    {t('leaderboard.days', '{{count}} days', { count: friend.current_streak })}
                  </span>
                </div>
              </div>

              <button
                className="btn btn-sm btn-ghost"
                style={{ opacity: 0.6 }}
                onClick={() => removeFriend(friend.friend_id)}
                aria-label={t('leaderboard.remove_friend', 'Remove friend')}
              >
                <X size={14} weight="bold" />
              </button>
            </li>
          ))
        )}
      </ul>

      {/* Add friend */}
      <div style={{ marginTop: '0.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--grace-lavender)', marginBottom: '0.4rem' }}>
          {t('leaderboard.add_friend_label', '+ Add a friend by username')}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
            placeholder={t('leaderboard.username_placeholder', 'Username')}
            className="input"
            style={{ flex: 1 }}
            aria-label={t('leaderboard.username_placeholder', 'Username')}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSendRequest}
            disabled={isSending || !username.trim()}
          >
            <UserCirclePlus size={16} weight="bold" />
            {t('leaderboard.send_request', 'Send Request')}
          </button>
        </div>
        {sendError && (
          <p role="alert" style={{ color: 'var(--error, #e05)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
            {sendError}
          </p>
        )}
        {sendSuccess && (
          <p role="status" style={{ color: 'var(--blessing-gold)', fontSize: '0.82rem', marginTop: '0.35rem' }}>
            {sendSuccess}
          </p>
        )}
      </div>
    </div>
  );
};
