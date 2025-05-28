import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  Thread,
  CreateThreadDto,
  UpdateThreadDto,
  AddContentDto,
  User,
} from './types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

interface SignInInput {
  email: string;
  password: string;
}

interface SignUpInput {
  email: string;
  nickname: string;
  password: string;
}

// Auth mutations
export function useSignUp() {
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { data } = await apiClient.post<string>('/auth/sign-up', input);
      // Store the token in localStorage for client-side access
      localStorage.setItem('accessToken', data);
      return data;
    },
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data } = await apiClient.post<string>('/auth/sign-in', input);
      // Store the token in localStorage for client-side access
      localStorage.setItem('accessToken', data);
      return data;
    },
    onSuccess: async () => {
      // Invalidate and refetch auth status
      await queryClient.invalidateQueries({ queryKey: ['auth'] });
      // Wait for the auth state to be updated
      await queryClient.refetchQueries({ queryKey: ['auth'] });
      // Add a small delay to ensure state is stable
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Force a hard navigation to ensure clean state
      window.location.href = '/user';
    },
  });
}

export const useSignOut = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: async () => {
      signOut();
      queryClient.clear();
      navigate('/');
    },
  });
};

// Thread queries
export const useThreads = () => {
  return useQuery({
    queryKey: ['threads'],
    queryFn: () => apiClient.get<Thread[]>('/threads').then((res) => res.data),
  });
};

export const useMyThreads = () => {
  return useQuery({
    queryKey: ['my-threads'],
    queryFn: () =>
      apiClient.get<Thread[]>('/threads/my').then((res) => res.data),
  });
};

export const useOtherThreads = () => {
  return useQuery({
    queryKey: ['other-threads'],
    queryFn: () =>
      apiClient.get<Thread[]>('/threads/others').then((res) => res.data),
  });
};

export const useLikedThreads = () => {
  return useQuery({
    queryKey: ['liked-threads'],
    queryFn: () => api.threads.getLiked(),
  });
};

export const useTrendingThreads = () => {
  return useQuery({
    queryKey: ['trending-threads'],
    queryFn: () => api.threads.getTrending(),
  });
};

export const useThread = (id: string) => {
  return useQuery<Thread>({
    queryKey: ['threads', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/threads/${id}`);
      return data;
    },
  });
};

// Thread mutations
export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateThreadDto) => {
      const { data } = await apiClient.post('/threads', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateThreadDto }) => {
      const { data } = await apiClient.patch(`/threads/${id}`, dto);
      return data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate all thread-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['threads', id] });
      queryClient.invalidateQueries({ queryKey: ['my-threads'] });
      queryClient.invalidateQueries({ queryKey: ['other-threads'] });
      queryClient.invalidateQueries({ queryKey: ['liked-threads'] });
      queryClient.invalidateQueries({ queryKey: ['trending-threads'] });
    },
  });
};

export const useAddContent = (threadId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: AddContentDto) => {
      const { data } = await apiClient.post(
        `/threads/${threadId}/content`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads', threadId] });
    },
  });
};

export const useAcceptContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      const { data } = await apiClient.put(
        `/threads/content/${contentId}/accept`,
      );
      return data;
    },
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};

export const useRejectContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      const { data } = await apiClient.put(
        `/threads/content/${contentId}/reject`,
      );
      return data;
    },
    onSuccess: (_, contentId) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};

export const useRequestChanges = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentId,
      message,
    }: {
      contentId: string;
      message: string;
    }) => {
      const { data } = await apiClient.put(
        `/threads/content/${contentId}/request-changes`,
        { message },
      );
      return data;
    },
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['pending-contents'] });
    },
  });
};

export const useUpdatePendingContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentId,
      content,
    }: {
      contentId: string;
      content: string;
    }) => {
      return api.threads.updatePendingContent(contentId, content);
    },
    onSuccess: (_, { contentId }) => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['pending-contents'] });
    },
  });
};

export const useReorderContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contentId,
      order,
    }: {
      contentId: string;
      order: number;
    }) => {
      const { data } = await apiClient.put(
        `/threads/content/${contentId}/reorder`,
        { order },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};

export const useLikeContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      const { data } = await apiClient.put(
        `/threads/content/${contentId}/like`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    },
  });
};

export const useLikeThread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (threadId: string) => {
      return api.threads.toggleLike(threadId);
    },
    onSuccess: (data, threadId) => {
      // Update the thread in cache with new like count
      queryClient.setQueryData(
        ['threads', threadId],
        (oldData: Thread | undefined) => {
          if (oldData) {
            return { ...oldData, _count: { threadLikes: data.likeCount } };
          }
          return oldData;
        },
      );

      // Invalidate thread lists to refresh like counts and section membership
      queryClient.invalidateQueries({ queryKey: ['threads'] });
      queryClient.invalidateQueries({ queryKey: ['my-threads'] });
      queryClient.invalidateQueries({ queryKey: ['other-threads'] }); // Thread may move out of this section
      queryClient.invalidateQueries({ queryKey: ['liked-threads'] }); // Thread may move into/out of this section
      queryClient.invalidateQueries({ queryKey: ['trending-threads'] });
    },
  });
};

// User queries
export const useUser = (id: string) => {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    },
  });
};
