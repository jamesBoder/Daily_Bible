import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services/api/history';
import { useAuth } from './useAuth';

export const useHistory = () => {
    const { isGuest } = useAuth();
    
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['history'],
        queryFn: () => historyService.getHistory(1, 100),
        enabled: !isGuest, // Skip API call for guests
        select: (response) => response.history,
    });

    const queryClient = useQueryClient();

    const clearMutation = useMutation({
        mutationFn: () => {
            if (isGuest) return Promise.resolve();
            return historyService.clearHistory();
        },
        onSuccess: () => {
            if (!isGuest) queryClient.invalidateQueries({ queryKey: ['history'] });
        },
    });

    return {
        history: data ?? [],
        isLoading,
        error: error?.message ?? null,
        refetch,
        clearHistory: clearMutation.mutateAsync,
    };
};