import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ThreadsRepository } from './threads.repository';
import { CreateThreadDto } from './dto/create.thread.dto';
import { AddContentDto } from './dto/add-content.dto';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly cls: ClsService,
    private readonly threadsRepository: ThreadsRepository,
  ) {}

  async createThread(dto: CreateThreadDto) {
    const user = this.cls.get('user');
    if (!user) {
      throw new InternalServerErrorException();
    }
    return this.threadsRepository.createThread(user.id, dto);
  }

  async getThreads() {
    return this.threadsRepository.getThreads();
  }

  async getThread(threadId: string) {
    return this.threadsRepository.getThread(threadId);
  }

  async addContent(threadId: string, dto: AddContentDto) {
    const userId = this.cls.get('userId');
    if (!userId) {
      throw new UnauthorizedException();
    }

    const thread = await this.threadsRepository.getThread(threadId);
    if (!thread) {
      throw new BadRequestException('Thread not found');
    }

    // Get the last accepted content
    const lastAcceptedContent = thread.threadContents
      .filter((content) => content.status === ContentStatus.ACCEPTED)
      .sort((a, b) => b.order - a.order)[0];

    // Check if the last content was from the same author
    if (lastAcceptedContent && lastAcceptedContent.authorId === userId) {
      throw new BadRequestException(
        'You cannot add content right after your own contribution. Please wait for someone else to contribute first.',
      );
    }

    return this.threadsRepository.addContent(threadId, userId, dto);
  }

  async acceptContent(contentId: string) {
    return this.threadsRepository.acceptContent(contentId);
  }

  async rejectContent(contentId: string) {
    return this.threadsRepository.rejectContent(contentId);
  }

  async reorderContent(contentId: string, newOrder: number) {
    return this.threadsRepository.reorderContent(contentId, newOrder);
  }

  async likeContent(contentId: string) {
    return this.threadsRepository.likeContent(contentId);
  }

  async deleteThread(threadId: string) {
    return this.threadsRepository.deleteThread(threadId);
  }
}
