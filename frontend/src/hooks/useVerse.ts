import { useState, useEffect } from 'react';
import { Verse } from '../types/verse';
import { verseService } from '../services/api/verse';

export const useVerse = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyVerse = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await verseService.getDailyVerse();
      setVerse(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load verse');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyVerse();
  }, []);

  return {
    verse,
    isLoading,
    error,
    refetch: fetchDailyVerse,
  };
};