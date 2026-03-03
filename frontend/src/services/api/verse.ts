import apiClient from './api';
import { Verse } from '../../types/verse';
import { API_ENDPOINTS } from '../../utils/constants';

export const verseService = {
  // Get the daily verse
  getDailyVerse: async (): Promise<Verse> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DAILY_VERSE);
      return response.data;
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      throw error;
    }
  },

  // Get a specific verse by reference
  getVerseByReference: async (reference: string): Promise<Verse> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.VERSES}/${encodeURIComponent(reference)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching verse by reference:', error);
      throw error;
    }
  },

  // Search for verses
  searchVerses: async (query: string): Promise<Verse[]> => {
    try {
      const params: any = { q: query };
      const response = await apiClient.get(API_ENDPOINTS.SEARCH_VERSES, { params });
      return response.data.verses || [];
    } catch (error) {
      console.error('Error searching verses:', error);
      throw error;
    }
  },
};