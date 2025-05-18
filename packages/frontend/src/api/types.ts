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
  authorId: string;
  authorEmoji?: string;
  threadId: string;
  parentContentId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  like: number;
  order: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  id: string;
  authorId: string;
  title: string;
  description: string;
  maxLength: number;
  autoAccept: boolean;
  like: number;
  threadContents: ThreadContent[];
  createdAt: string;
  updatedAt: string;
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
