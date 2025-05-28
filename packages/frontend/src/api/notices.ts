import { apiClient } from './client';

export interface Notice {
  id: string;
  userId: string;
  type:
    | 'CHANGE_REQUEST'
    | 'CONTENT_ACCEPTED'
    | 'CONTENT_REJECTED'
    | 'NEW_CONTRIBUTION'
    | 'NEW_SUBMISSION';
  title: string;
  message: string;
  isRead: boolean;
  threadId: string | null;
  contentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getNotices = async (): Promise<Notice[]> => {
  const response = await apiClient.get('/notices');
  return response.data;
};

export const getUnreadNoticesCount = async (): Promise<number> => {
  const response = await apiClient.get('/notices/unread-count');
  return response.data;
};

export const markNoticeAsRead = async (noticeId: string): Promise<void> => {
  await apiClient.put(`/notices/${noticeId}/read`);
};

export const markAllNoticesAsRead = async (): Promise<void> => {
  await apiClient.put('/notices/mark-all-read');
};
