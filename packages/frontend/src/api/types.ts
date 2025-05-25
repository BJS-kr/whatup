export interface User {
  id: string;
  email: string;
  nickname: string;
  service: string;
  like: number;
  createdAt: string;
  updatedAt: string;
}

export interface ThreadContent {
  id: string;
  threadId: string;
  authorId: string;
  author: User;
  content: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  like: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  authorEmoji?: string;
}

export interface Thread {
  id: string;
  title: string;
  description: string;
  authorId: string;
  author: User;
  maxLength: number;
  autoAccept: boolean;
  allowConsecutiveContribution: boolean;
  threadContents: ThreadContent[];
  createdAt: string;
  updatedAt: string;
  like?: number;
}

export interface CreateThreadDto {
  title: string;
  description: string;
  maxLength: number;
  autoAccept: boolean;
  initialContent: string;
}

export interface AddContentDto {
  content: string;
  parentContentId?: string;
}
