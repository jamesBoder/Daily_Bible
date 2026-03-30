import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { communityApi } from '../../services/api/community';
import './community.css';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export const WalkingToday: React.FC = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = async () => {
    try {
      const data = await communityApi.getWalkingToday();
      setCount(data.count);
    } catch {
      // Silently ignore — non-critical stat
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (count === null) return null;

  return (
    <div
      className="candle-glow community-walking-banner"
    >
      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🕯</span>
      <div>
        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--candle-amber)' }}>
          {count.toLocaleString()}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
          {t('community.walking_today_label', 'people read the Word today')}
        </div>
      </div>
    </div>
  );
};
