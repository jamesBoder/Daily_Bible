// Custom hook for history management with React Query

// imports
import { useState} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { historyService } from '../services/api/history';


// useHistory hook
export const useHistory = () => {
    // local state for pagination and search
    const [page, setPageState] = useState(1);
    const [pageSize, setPageSizeState] = useState(20);
    const [search, setSearchState] = useState<string | undefined>(undefined);


    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['history', page, pageSize, search],

        queryFn: () => historyService.getHistory(page, pageSize, search) // Pass params!
    });

    const queryClient = useQueryClient();

    // clearMutation
    const clearMutation = useMutation({
        mutationFn: () => historyService.clearHistory(),
        onSuccess: () => {
            // Automatically refetch history list
            queryClient.invalidateQueries({ queryKey: ['history'] });
        }
    });

    

    // helper functions for pagination, setPage(newPage), setPageSize(newSize), setSearch(query)
    const setPage = (newPage: number) => {
        setPageState(newPage);
    };

    const setPageSize = (newSize: number) => {
        setPageSizeState(newSize);
    };

    const setSearch = (query: string | undefined) => {
        setSearchState(query === '' ? undefined : query);
        setPageState(1); // reset to first page on new search
    };

    const hasNextPage = data?.pagination ? page < data.pagination.total_pages : false;

    const hasPreviousPage = page > 1;

    const goToNextPage = () => {
        if (hasNextPage) setPage(page + 1);
    };

    const goToPreviousPage = () => {
        if (hasPreviousPage) setPage(page - 1);
    };

    const goToFirstPage = () => setPage(1);

    const goToLastPage = () => {
        if (data?.pagination) setPage(data.pagination.total_pages);
    };

    const fetchHistory = (newPage = 1, newPageSize = 20, newSearch?: string) => {
        setPageState(newPage);
        setPageSizeState(newPageSize);
        setSearchState(newSearch);
    };

   
    return {
        history: data?.history ?? [],
        pagination: data?.pagination ?? null,
        totalItems: data?.pagination?.total ?? 0,
        totalPages: data?.pagination?.total_pages ?? 0,
        isLoading,
        error: error?.message ?? null,
        
        // pagination state
        page,
        pageSize,
        search,

        // pagination controls
        setPage,
        setPageSize,
        setSearch,

        // clear history
        clearHistory: () => clearMutation.mutateAsync(),
        isClearing: clearMutation.isPending,

        refetch,
        fetchHistory,

        hasNextPage,
        hasPreviousPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
    };

    
};
