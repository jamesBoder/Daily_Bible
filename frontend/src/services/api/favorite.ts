// 1. Correct imports
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import {FavoritesResponse } from '../../types/favorite';
import { AddFavoriteResponse } from '../../types/favorite';

// init GetFavoritesParams interface
export interface GetFavoritesParams {
    page: number;
    pageSize: number;
    search?: string;
}

// 2. Service object (like commentService)
export const favoriteService = {
  
  /**
 * Fetches user's favorite verses with pagination and optional search
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page (default: 20)
 * @param search - Optional search query to filter favorites
 * @returns Promise with favorites and pagination metadata
 */
  getFavorites: async (page = 1, pageSize = 20, search?: string) => {
    try {
      // Calculate offset
      const params = { page, page_size: pageSize, ...(search && { search })};
        if (search) {
            params.search = search;
        }
      
      // API call with correct response type
      const response = await apiClient.get<FavoritesResponse>(
        API_ENDPOINTS.FAVORITES, 
        { params }
      );
      
      // Return unwrapped data
      return response.data;
      
    } catch (error: any) {
        // Log the error for debugging
        console.error('Error fetching favorites:', error); 


        // Network error (no response)
        if (!error.response) {
            throw new Error('Network error. Please check your connection.');
        }


        // Handle 404 separately if needed
        if (error.response?.status === 404) {
            return { 
                favorites: [], 
                pagination: { total: 0, page, page_size: pageSize, total_pages: 0 }
            };
        }
        throw error;
    }
},

  /**
 * Adds a verse to user's favorites
 * @param verseId - ID of the verse to favorite
 * @returns Promise with success message
 * @throws Error if verse is already favorited (409) or other errors
 */
  addFavorite: async (verseId: number) => {
    try {

        const response = await apiClient.post<AddFavoriteResponse>(
        API_ENDPOINTS.FAVORITES, 
        { verse_id: verseId }
        );
        return response.data;; // { message: "Favorite added successfully" }
    } catch (error: any) {
      // Correct status code for conflict
      if (error.response?.status === 409) {
        throw new Error('This verse is already in your favorites');
      }
      throw error;
    }
  },

  /**
 * Removes a verse from user's favorites
 * @param favoriteId - ID of the favorite to remove
 * @throws Error if favorite not found (404) or other errors
 */
  removeFavorite: async (favoriteId: number) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.FAVORITES}/${favoriteId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Favorite not found. It may have been already removed.');
      }
      throw error;
    }
  },

  /**
 * Checks if a verse is in user's favorites
 * @param verseId - ID of the verse to check
 * @returns Promise<boolean> - true if favorited, false otherwise
 */
isFavorited: async (verseId: number): Promise<boolean> => {
  try {
    const response = await favoriteService.getFavorites(1, 100); // Get first 100
    return response.favorites.some(fav => fav.verse_id === verseId);
  } catch (error) {
    console.error('Error checking if favorited:', error);
    return false;
  }
}

};


