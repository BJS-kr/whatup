import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Thread, CreateThreadDto, AddContentDto, User } from './types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
      const { data } = await apiClient.put(`/threads/${threadId}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads'] });
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
