import React, { useState, useEffect } from 'react';
import { WifiSlash } from '@phosphor-icons/react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  // Keep the banner mounted briefly after going back online so it can animate out
  const [visible, setVisible] = useState(!isOnline);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setAnimating(false);
    } else if (visible) {
      // slide up before unmounting
      setAnimating(true);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: 'var(--theme-surface, #1a1208)',
        borderBottom: '2px solid var(--candle-amber, #b45309)',
        color: 'var(--candle-amber, #b45309)',
        padding: '0.4rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.82rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        transform: animating ? 'translateY(-100%)' : 'translateY(0)',
        opacity: animating ? 0 : 1,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
      }}
    >
      <WifiSlash size={15} weight="bold" />
      You're offline — reading from cache
    </div>
  );
};
