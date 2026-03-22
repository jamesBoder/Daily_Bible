import React from 'react';
import './community.css';

export const CommunityPostSkeleton: React.FC = () => (
  <div
    style={{
      borderLeft: '3px solid var(--journal-surface)',
      padding: '0.75rem 1rem',
      marginBottom: '0.75rem',
      background: 'var(--card-bg, var(--parchment))',
      borderRadius: '0 6px 6px 0',
    }}
  >
    {/* Header row: type badge + username + timestamp */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
      <div className="skeleton-block" style={{ width: 56, height: 10 }} />
      <div className="skeleton-block" style={{ width: 90, height: 10 }} />
      <div className="skeleton-block" style={{ width: 36, height: 10, marginLeft: 'auto' }} />
    </div>
    {/* Body: two lines */}
    <div className="skeleton-block" style={{ width: '92%', height: 13, marginBottom: '0.4rem' }} />
    <div className="skeleton-block" style={{ width: '68%', height: 13, marginBottom: '0.65rem' }} />
    {/* Reaction pills */}
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <div className="skeleton-block" style={{ width: 46, height: 24, borderRadius: 20 }} />
      <div className="skeleton-block" style={{ width: 46, height: 24, borderRadius: 20 }} />
    </div>
  </div>
);
