import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/client';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  current_streak: number;
  milestone_key: string;
  is_self: boolean;
  is_premium: boolean;
}

export const useLeaderboard = () => {
  const queryClient = useQueryClient();

  const { data: friendsBoard = [], isLoading: friendsBoardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'friends'],
    queryFn: async () => {
      const res = await apiClient.get('/leaderboard/friends');
      return res.data.entries ?? [];
    },
  });

  const { data: communityBoard = [], isLoading: communityBoardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'community'],
    queryFn: async () => {
      const res = await apiClient.get('/leaderboard/community');
      return res.data.entries ?? [];
    },
  });

  const setVisibility = useMutation({
    mutationFn: (visible: boolean) =>
      apiClient.put('/leaderboard/visibility', { visible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'community'] });
    },
  });

  return {
    friendsBoard,
    communityBoard,
    isLoading: friendsBoardLoading || communityBoardLoading,
    setVisibility: (visible: boolean) => setVisibility.mutateAsync(visible),
    isSettingVisibility: setVisibility.isPending,
  };
};
