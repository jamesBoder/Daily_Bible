// history service

// correct imports
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { HistoryResponse } from '../../types/history';


// init GetHistoryParams interface
export interface GetHistoryParams {
    page: number;
    pageSize: number;
    search?: string;
}

// service object
export const historyService = {
    // fetch user's history with pagination and optional search
    getHistory: async (page = 1, pageSize = 20, search?: string) => {
        try {
            // calculate offset
            const params = { page, page_size: pageSize, ...(search && { search }) };
            if (search) {
                params.search = search;
            }

            // API call with correct response type
            const response = await apiClient.get<HistoryResponse>(
                API_ENDPOINTS.HISTORY,
                { params }
            );

            // return unwrapped data
            return response.data;

        } catch (error: any) {
            // log the error for debugging
            console.error('Error fetching history:', error);

            // network error (no response)
            if (!error.response) {
                throw new Error('Network error. Please check your connection.');
            }

            // handle 404 separately if needed
            if (error.response?.status === 404) {
                return {
                    history: [],
                    pagination: { total: 0, page, page_size: pageSize, total_pages: 0 }
                };
            }
            throw error;
        }
    },

    // clearHistory method
    clearHistory: async (): Promise<void> => {
        try {
            await apiClient.delete(API_ENDPOINTS.HISTORY);
        } catch (error: any) {
            console.error('Error clearing history:', error);
            throw error;
        }
    }
};

    
