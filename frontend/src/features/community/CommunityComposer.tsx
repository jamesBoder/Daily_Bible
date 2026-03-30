import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { AxiosError } from 'axios';
import { LockedFeatureCard } from '../../components/common/LockedFeatureCard';

interface Props {
  isPremium: boolean;
  onSubmit: (body: string) => Promise<void>;
  postType?: 'user';
  maxLength?: number;
}

export const CommunityComposer: React.FC<Props> = ({
  isPremium,
  onSubmit,
  maxLength = 500,
}) => {
  const { t } = useTranslation();
  const [body, setBody] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isPremium) {
    return (
      <LockedFeatureCard
        featureDescription={t(
          'community.composer.locked',
          'Upgrade to Devoted Member to share reflections with the community.',
        )}
      />
    );
  }

  const charsRemaining = maxLength - body.length;
  const nearLimit = charsRemaining <= 50;
  const showControls = isFocused || body.length > 0;

  const handleSubmit = async () => {
    if (!body.trim() || isSubmitting) return;
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody('');
      setIsFocused(false);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const status = axiosErr?.response?.status;
      const serverMsg = axiosErr?.response?.data?.error;
      if (status === 403) {
        setError(t('community.error.premium_required', 'Premium subscription required to post reflections.'));
      } else if (status === 422 || serverMsg === 'profanity_detected') {
        setError(t('community.error.profanity', 'Your post contains inappropriate language. Please revise and try again.'));
      } else if (status === 429) {
        setError(t('community.error.rate_limit', 'Too many posts — please wait a few minutes.'));
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
    <div
      style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'var(--journal-surface)',
        borderRadius: 8,
        border: `1px solid ${isFocused ? 'var(--candle-amber)' : 'transparent'}`,
        transition: 'border-color 0.18s ease',
      }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => { if (!body.trim()) setIsFocused(false); }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        placeholder={t('community.composer.placeholder', 'Share a reflection...')}
        maxLength={maxLength}
        className="input"
        style={{
          width: '100%',
          resize: 'none',
          fontFamily: 'inherit',
          fontSize: '0.9rem',
          color: 'var(--foreground)',
          minHeight: showControls ? '5.5rem' : '2.8rem',
          transition: 'min-height 0.18s ease',
          overflow: 'hidden',
        }}
        aria-label={t('community.composer.placeholder', 'Share a reflection...')}
      />

      {/* Controls — slide in on focus */}
      <div
        style={{
          maxHeight: showControls ? '60px' : '0',
          opacity: showControls ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.18s ease, opacity 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: showControls ? '0.4rem' : 0,
        }}
      >
        {nearLimit ? (
          <span
            style={{
              fontSize: '0.78rem',
              color: charsRemaining < 10 ? 'var(--error, #e05)' : 'var(--candle-amber)',
            }}
          >
            {t('community.composer.char_limit', '{{count}} characters remaining', { count: charsRemaining })}
          </span>
        ) : (
          <span />
        )}
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={isSubmitting || !body.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <PaperPlaneRight size={14} weight="bold" />
          {t('community.composer.post_btn', 'Post')}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--error, #e05)', fontSize: '0.82rem', marginTop: '0.3rem' }}>
          {error}
        </p>
      )}
    </div>
  );
};
