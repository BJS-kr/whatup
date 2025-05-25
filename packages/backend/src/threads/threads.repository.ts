import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma.service';
import { CreateThreadDto } from './dto/dto.create-thread';
import { AddContentDto } from './dto/dto.add-content';
import { from } from 'rxjs';

@Injectable()
export class ThreadsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createThread(authorId: string, dto: CreateThreadDto) {
    return from(
      this.prisma.thread.create({
        data: {
          title: dto.title,
          description: dto.description,
          maxLength: dto.maxLength,
          autoAccept: dto.autoAccept,
          allowConsecutiveContribution: dto.allowConsecutiveContribution,
          author: {
            connect: {
              id: authorId,
            },
          },
          threadContents: {
            create: {
              content: dto.initialContent,
              order: 1,
              status: dto.autoAccept
                ? ContentStatus.ACCEPTED
                : ContentStatus.PENDING,
              author: {
                connect: {
                  id: authorId,
                },
              },
            },
          },
        },
        include: {
          threadContents: {
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  getThreads() {
    return from(
      this.prisma.thread.findMany({
        include: {
          threadContents: {
            orderBy: {
              order: 'asc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  getThreadsByAuthor(authorId: string) {
    return from(
      this.prisma.thread.findMany({
        where: {
          authorId,
        },
        include: {
          threadContents: {
            orderBy: {
              order: 'asc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  getThreadsByNotAuthor(authorId: string) {
    return from(
      this.prisma.thread.findMany({
        where: {
          authorId: {
            not: authorId,
          },
        },
        include: {
          threadContents: {
            orderBy: {
              order: 'asc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  getThread(threadId: string) {
    return from(
      this.prisma.thread.findUnique({
        where: { id: threadId },
        include: {
          threadContents: {
            orderBy: {
              order: 'asc',
            },
            include: {
              author: {
                select: {
                  id: true,
                  nickname: true,
                },
              },
            },
          },
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  addContent(
    threadId: string,
    authorId: string,
    dto: AddContentDto,
    order: number,
    status: ContentStatus,
  ) {
    return from(
      this.prisma.threadContent.create({
        data: {
          threadId,
          authorId,
          content: dto.content,
          parentContentId: dto.parentContentId,
          order,
          status,
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  acceptContent(contentId: string) {
    return from(
      this.prisma.threadContent.update({
        where: { id: contentId },
        data: { status: ContentStatus.ACCEPTED },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  rejectContent(contentId: string) {
    return from(
      this.prisma.threadContent.update({
        where: { id: contentId },
        data: { status: ContentStatus.REJECTED },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  reorderContent(contentId: string, newOrder: number) {
    return from(
      this.prisma.threadContent.update({
        where: { id: contentId },
        data: { order: newOrder },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  likeContent(contentId: string) {
    return from(
      this.prisma.threadContent.update({
        where: { id: contentId },
        data: {
          like: {
            increment: 1,
          },
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      }),
    );
  }

  deleteThread(threadId: string) {
    return from(
      this.prisma.thread.delete({
        where: { id: threadId },
      }),
    );
  }
}
