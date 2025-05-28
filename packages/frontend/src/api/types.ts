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
  threadLikes: Array<{ id: string }>;
  createdAt: string;
  updatedAt: string;
  _count: {
    threadLikes: number;
  };
}

export interface CreateThreadDto {
  title: string;
  description: string;
  maxLength: number;
  autoAccept: boolean;
  initialContent: string;
}

export interface UpdateThreadDto {
  description: string;
  maxLength: number;
  autoAccept: boolean;
  allowConsecutiveContribution: boolean;
}

export interface AddContentDto {
  content: string;
  parentContentId?: string;
}
