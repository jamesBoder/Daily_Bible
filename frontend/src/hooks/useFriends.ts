import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api/client';

export interface FriendWithStreak {
  friend_id: number;
  username: string;
  current_streak: number;
  longest_streak: number;
  milestone_key: string;
  avatar_initials: string;
}

export interface PendingRequest {
  request_id: number;
  from_user_id: number;
  username: string;
  created_at: string;
}

export const useFriends = () => {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery<FriendWithStreak[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await apiClient.get('/friends');
      return res.data.friends ?? [];
    },
  });

  const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery<PendingRequest[]>({
    queryKey: ['friends', 'requests'],
    queryFn: async () => {
      const res = await apiClient.get('/friends/requests');
      return res.data.requests ?? [];
    },
  });

  const sendRequest = useMutation({
    mutationFn: (username: string) =>
      apiClient.post('/friends/request', { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const acceptRequest = useMutation({
    mutationFn: (requestId: number) =>
      apiClient.put(`/friends/request/${requestId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (requestId: number) =>
      apiClient.delete(`/friends/request/${requestId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends', 'requests'] });
    },
  });

  const removeFriend = useMutation({
    mutationFn: (friendId: number) =>
      apiClient.delete(`/friends/${friendId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  return {
    friends,
    pendingRequests,
    isLoading: friendsLoading || requestsLoading,
    sendRequest: (username: string) => sendRequest.mutateAsync(username),
    acceptRequest: (requestId: number) => acceptRequest.mutateAsync(requestId),
    rejectRequest: (requestId: number) => rejectRequest.mutateAsync(requestId),
    removeFriend: (friendId: number) => removeFriend.mutateAsync(friendId),
    isSending: sendRequest.isPending,
  };
};
