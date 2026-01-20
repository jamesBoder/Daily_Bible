// useHook

// imports
import { useState, useEffect } from 'react';
import { historyService } from '../services/api/history';
import { HistoryEntry } from '../types/history';

// useHistory hook
export const useHistory = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = async (page = 1, pageSize = 20, search?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await historyService.getHistory(page, pageSize, search);
            setHistory(data.history);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = async () => {
        try {
            await historyService.clearHistory();
            setHistory([]); // Clear local history state
            return true;
        } catch (err: any) {
            throw new Error(err.response?.data?.error || 'Failed to clear history');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return {
        history,
        isLoading,
        error,
        fetchHistory,
        clearHistory,
    };
};
