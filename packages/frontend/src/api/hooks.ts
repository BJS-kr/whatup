import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type { Thread, CreateThreadDto, AddContentDto } from './types';

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

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data } = await apiClient.post<string>('/auth/sign-in', input);
      // Store the token in localStorage for client-side access
      localStorage.setItem('accessToken', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch auth status
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
}

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('accessToken');
      queryClient.clear();
    },
  });
};

// Thread queries
export const useThreads = () => {
  return useQuery<Thread[]>({
    queryKey: ['threads'],
    queryFn: async () => {
      const { data } = await apiClient.get('/threads');
      return data;
    },
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
