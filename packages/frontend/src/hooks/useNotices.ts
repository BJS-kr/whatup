import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotices,
  getUnreadNoticesCount,
  markNoticeAsRead,
  markAllNoticesAsRead,
} from '../api/notices';

export const useNotices = () => {
  return useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });
};

export const useUnreadNoticesCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['notices', 'unread-count'],
    queryFn: getUnreadNoticesCount,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled, // Only run the query when enabled is true
  });
};

export const useMarkNoticeAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNoticeAsRead,
    onSuccess: () => {
      // Invalidate both notices and unread count
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', 'unread-count'] });
    },
  });
};

export const useMarkAllNoticesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNoticesAsRead,
    onSuccess: () => {
      // Invalidate both notices and unread count
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      queryClient.invalidateQueries({ queryKey: ['notices', 'unread-count'] });
    },
  });
};
