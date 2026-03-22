import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { communityApi } from '../../services/api/community';

interface Props {
  onPublished: () => void; // call reload() after a successful post
}

export const AdminComposer: React.FC<Props> = ({ onPublished }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState<'announcement' | 'challenge'>('announcement');
  const [body, setBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const MAX_LENGTH = 500;
  const charsRemaining = MAX_LENGTH - body.length;
  const nearLimit = charsRemaining <= 50;

  const handleSubmit = async () => {
    if (!body.trim() || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await communityApi.createAdminPost(
        postType,
        body.trim(),
        isPinned,
        expiresAt || undefined,
      );
      setBody('');
      setIsPinned(false);
      setExpiresAt('');
      setOpen(false);
      onPublished();
    } catch {
      setError(t('community.admin.error', 'Failed to publish post.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem', borderRadius: 8, border: '1px solid var(--candle-amber)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          background: 'var(--candle-amber)',
          color: '#1a1208',
          fontWeight: 700,
          fontSize: '0.82rem',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          letterSpacing: '0.03em',
        }}
      >
        {open ? '▲' : '▼'} {t('community.admin.panel_title', 'Admin — New Post')}
      </button>

      {open && (
        <div style={{ padding: '0.75rem', background: 'var(--journal-surface)' }}>
          {/* Post type selector */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
            {(['announcement', 'challenge'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                style={{
                  padding: '0.25rem 0.7rem',
                  borderRadius: 20,
                  border: `1px solid ${postType === type ? 'var(--candle-amber)' : 'var(--journal-surface)'}`,
                  background: postType === type ? 'var(--candle-amber)22' : 'transparent',
                  color: postType === type ? 'var(--candle-amber)' : 'var(--grace-lavender)',
                  fontWeight: postType === type ? 700 : 400,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  textTransform: 'capitalize',
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            placeholder={t('community.admin.body_placeholder', 'Write an announcement or challenge...')}
            maxLength={MAX_LENGTH}
            rows={3}
            className="input"
            style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem' }}
          />

          {/* Controls row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--grace-lavender)', cursor: 'pointer' }}>
              <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              {t('community.admin.pin_label', 'Pin to top')}
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--grace-lavender)' }}>
              {t('community.admin.expires_label', 'Expires:')}
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="input"
                style={{ fontSize: '0.78rem', padding: '0.15rem 0.3rem' }}
              />
            </label>

            {nearLimit && (
              <span style={{ fontSize: '0.78rem', color: charsRemaining < 10 ? 'var(--error, #e05)' : 'var(--candle-amber)', marginLeft: 'auto' }}>
                {charsRemaining}
              </span>
            )}

            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={isSubmitting || !body.trim()}
              style={{ marginLeft: 'auto' }}
            >
              {isSubmitting
                ? t('community.admin.publishing', 'Publishing...')
                : t('community.admin.publish_btn', 'Publish')}
            </button>
          </div>

          {error && (
            <p role="alert" style={{ color: 'var(--error, #e05)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
