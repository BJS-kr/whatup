import { Injectable } from '@nestjs/common';
import { Thread, ThreadContent, ContentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma.service';
import { CreateThreadDto } from './dto/create.thread.dto';
import { AddContentDto } from './dto/add-content.dto';

@Injectable()
export class ThreadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createThread(authorId: string, dto: CreateThreadDto) {
    return this.prisma.thread.create({
      data: {
        authorId,
        title: dto.title,
        description: dto.description,
        maxLength: dto.maxLength,
        autoAccept: dto.autoAccept,
        threadContents: {
          create: {
            authorId,
            content: dto.initialContent,
            order: 1,
            status: ContentStatus.ACCEPTED,
          },
        },
      },
      include: {
        threadContents: true,
      },
    });
  }

  async getThreads() {
    return this.prisma.thread.findMany({
      include: {
        threadContents: {
          where: {
            status: ContentStatus.ACCEPTED,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async getThread(threadId: string) {
    return this.prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        threadContents: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async addContent(threadId: string, authorId: string, dto: AddContentDto) {
    const thread = await this.getThread(threadId);
    if (!thread) throw new Error('Thread not found');

    const lastContent = thread.threadContents[thread.threadContents.length - 1];
    const parentContentId = dto.parentContentId || lastContent?.id;

    return this.prisma.threadContent.create({
      data: {
        threadId,
        authorId,
        content: dto.content,
        parentContentId,
        order: thread.threadContents.length + 1,
        status: thread.autoAccept
          ? ContentStatus.ACCEPTED
          : ContentStatus.PENDING,
      },
    });
  }

  async acceptContent(contentId: string) {
    return this.prisma.threadContent.update({
      where: { id: contentId },
      data: { status: ContentStatus.ACCEPTED },
    });
  }

  async rejectContent(contentId: string) {
    return this.prisma.threadContent.update({
      where: { id: contentId },
      data: { status: ContentStatus.REJECTED },
    });
  }

  async reorderContent(contentId: string, newOrder: number) {
    return this.prisma.threadContent.update({
      where: { id: contentId },
      data: { order: newOrder },
    });
  }

  async likeContent(contentId: string) {
    return this.prisma.threadContent.update({
      where: { id: contentId },
      data: {
        like: {
          increment: 1,
        },
      },
    });
  }

  async deleteThread(threadId: string) {
    return this.prisma.thread.delete({
      where: { id: threadId },
    });
  }
}
