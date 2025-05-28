import type {
  Thread,
  CreateThreadDto,
  UpdateThreadDto,
  AddContentDto,
  ThreadContent,
  User,
} from '../api/types';

const API_BASE = '/api';

// Simple fetch wrapper with error handling
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;

  // Get auth token from localStorage
  const token = localStorage.getItem('accessToken');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Read response text once and try to parse as JSON
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch {
    // If JSON parsing fails, return the text response
    return responseText as T;
  }
};

// API service organized by domain
export const api = {
  // Thread operations
  threads: {
    getAll: (): Promise<Thread[]> => apiRequest('/threads'),

    getById: (id: string): Promise<Thread> => apiRequest(`/threads/${id}`),

    getMy: (): Promise<Thread[]> => apiRequest('/threads/my'),

    getOthers: (): Promise<Thread[]> => apiRequest('/threads/others'),

    getLiked: (): Promise<Thread[]> => apiRequest('/threads/liked'),

    getTrending: (): Promise<Thread[]> => apiRequest('/threads/trending'),

    create: (data: CreateThreadDto): Promise<Thread> =>
      apiRequest('/threads', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateThreadDto): Promise<Thread> =>
      apiRequest(`/threads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<void> =>
      apiRequest(`/threads/${id}`, {
        method: 'DELETE',
      }),

    addContent: (threadId: string, data: AddContentDto): Promise<any> =>
      apiRequest(`/threads/${threadId}/content`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    acceptContent: (contentId: string): Promise<any> =>
      apiRequest(`/threads/content/${contentId}/accept`, {
        method: 'PUT',
      }),

    rejectContent: (contentId: string): Promise<any> =>
      apiRequest(`/threads/content/${contentId}/reject`, {
        method: 'PUT',
      }),

    updatePendingContent: (contentId: string, content: string): Promise<any> =>
      apiRequest(`/threads/content/${contentId}/update`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }),

    likeContent: (contentId: string): Promise<any> =>
      apiRequest(`/threads/content/${contentId}/like`, {
        method: 'PUT',
      }),

    getPendingContents: (threadId: string): Promise<ThreadContent[]> =>
      apiRequest(`/threads/${threadId}/pending-contents`),

    toggleLike: (
      threadId: string,
    ): Promise<{ threadId: string; likeCount: number }> =>
      apiRequest(`/threads/${threadId}/like`, {
        method: 'PUT',
      }),
  },

  // Auth operations
  auth: {
    login: (credentials: {
      email: string;
      password: string;
    }): Promise<{ user: User; token: string }> =>
      apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),

    register: (userData: {
      email: string;
      password: string;
      nickname: string;
    }): Promise<{ user: User; token: string }> =>
      apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),

    logout: (): Promise<void> =>
      apiRequest('/auth/logout', {
        method: 'POST',
      }),

    getProfile: (): Promise<User> => apiRequest('/auth/profile'),

    refreshToken: (): Promise<{ token: string }> =>
      apiRequest('/auth/refresh', {
        method: 'POST',
      }),
  },

  // Health check
  health: {
    check: (): Promise<{ status: string }> => apiRequest('/health'),
  },
};

// Export individual services for convenience
export const { threads, auth, health } = api;
