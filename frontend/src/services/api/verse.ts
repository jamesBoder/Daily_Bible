import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Verse, DailyVerseResponse } from '../../types/verse';

export const verseService = {
  // Get daily verse
  getDailyVerse: async (): Promise<Verse> => {
    const response = await apiClient.get<DailyVerseResponse>(
      API_ENDPOINTS.DAILY_VERSE
    );
    return response.data.verse;
  },

  // Get verse by reference
  getVerseByReference: async (reference: string): Promise<Verse> => {
    const response = await apiClient.get<{ verse: Verse }>(
      `${API_ENDPOINTS.VERSE_BY_REFERENCE}/${reference}`
    );
    return response.data.verse;
  },

  // Search verses
  searchVerses: async (query: string): Promise<Verse[]> => {
    const response = await apiClient.get<{ verses: Verse[] }>(
      API_ENDPOINTS.SEARCH_VERSES,
      { params: { q: query } }
    );
    return response.data.verses;
  },
};