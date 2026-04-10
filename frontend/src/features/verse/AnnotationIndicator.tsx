import React from 'react';
import { useQuery } from '@tanstack/react-query';
import annotationsApi from '../../services/api/annotations';
import { useStreak } from '../../contexts/StreakContext';

interface AnnotationIndicatorProps {
  verseReference: string;
}

/**
 * A small gold dot shown below the verse when the user has at least one annotation.
 * Renders nothing for non-premium users or when no annotations exist.
 */
const AnnotationIndicator: React.FC<AnnotationIndicatorProps> = ({ verseReference }) => {
  const { subscription } = useStreak();
  const isPremium = subscription?.is_premium ?? false;

  const { data: annotations = [] } = useQuery({
    queryKey: ['annotations-verse', verseReference],
    queryFn: () => annotationsApi.getForVerse(verseReference),
    enabled: isPremium,
    staleTime: 1000 * 60 * 5,
  });

  if (!isPremium || annotations.length === 0) return null;

  return (
    <span
      className="inline-block w-2 h-2 rounded-full ml-1.5 align-middle"
      style={{ background: 'var(--blessing-gold)' }}
      title={`${annotations.length} annotation${annotations.length !== 1 ? 's' : ''}`}
    />
  );
};

export default AnnotationIndicator;
