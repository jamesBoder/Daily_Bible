import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Verse, DailyVerseResponse } from '../../types/verse';
import { showToast } from '../../utils/toast';

export const verseService = {
  // Get daily verse
  getDailyVerse: async (language?: string, version?: string): Promise<{ verse: Verse; blessings_credited: number }> => {
    try {
      const params: Record<string, string> = {};
      if (language) params.lang = language;
      if (version) params.version = version;
      const response = await apiClient.get<DailyVerseResponse & { blessings_credited?: number }>(
        API_ENDPOINTS.DAILY_VERSE,
        { params }
      );
      return {
        verse: response.data.verse,
        blessings_credited: response.data.blessings_credited ?? 0,
      };
    } catch (error: any) {
      showToast.error('Failed to load daily verse. Please refresh the page.');
      throw error;
    }
  },

  // Get verse by reference
  getVerseByReference: async (reference: string, language?: string): Promise<Verse> => {
    try {
      const params = language ? { lang: language } : {};
      const response = await apiClient.get<{ verse: Verse }>(
        `${API_ENDPOINTS.VERSE_BY_REFERENCE}/${reference}`,
        { params }
      );
      return response.data.verse;
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast.error('Verse not found');
      } else {
        showToast.error('Failed to load verse');
      }
      throw error;
    }
  },

  // Record a verse share and credit Blessings (capped at 2/day).
  // Returns blessings_credited and an optional discipline_completed field.
  recordShare: async (): Promise<{ blessings_credited: number; discipline_completed?: { key: string; blessings_credited: number } }> => {
    try {
      const response = await apiClient.post<{ blessings_credited: number; discipline_completed?: { key: string; blessings_credited: number } }>('/api/verses/share');
      return { blessings_credited: response.data.blessings_credited ?? 0, discipline_completed: response.data.discipline_completed };
    } catch {
      return { blessings_credited: 0 };
    }
  },

  // Search verses
  searchVerses: async (query: string, language?: string): Promise<Verse[]> => {
    try {
      const params: any = { q: query };
      if (language) {
        params.lang = language;
      }
      const response = await apiClient.get<{ verses: Verse[] }>(
        API_ENDPOINTS.SEARCH_VERSES,
        { params }
      );
      return response.data.verses;
    } catch (error: any) {
      showToast.error('Search failed. Please try again.');
      throw error;
    }
  },
};
