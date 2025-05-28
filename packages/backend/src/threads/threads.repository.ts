import { Injectable } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from 'src/common/db/prisma.service';
import { CreateThreadDto } from './dto/dto.create-thread';
import { UpdateThreadDto } from './dto/dto.update-thread';
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
              status: ContentStatus.ACCEPTED, // Initial content by thread author is always accepted
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
          _count: {
            select: {
              threadLikes: true,
            },
          },
        },
      }),
    );
  }

  updateThread(threadId: string, authorId: string, dto: UpdateThreadDto) {
    return from(
      this.prisma.thread.update({
        where: {
          id: threadId,
          authorId: authorId, // Ensure only the thread author can update
        },
        data: {
          description: dto.description,
          maxLength: dto.maxLength,
          autoAccept: dto.autoAccept,
          allowConsecutiveContribution: dto.allowConsecutiveContribution,
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
          _count: {
            select: {
              threadLikes: true,
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
          _count: {
            select: {
              threadLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );
  }

  getThreadsByAuthor(authorId: string, currentUserId?: string) {
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
          threadLikes: currentUserId
            ? {
                where: {
                  userId: currentUserId,
                },
                select: {
                  id: true,
                },
              }
            : false,
          _count: {
            select: {
              threadLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );
  }

  getThreadsByNotAuthor(authorId: string) {
    return from(
      this.prisma.thread.findMany({
        where: {
          AND: [
            {
              authorId: {
                not: authorId,
              },
            },
            {
              threadLikes: {
                none: {
                  userId: authorId, // Exclude threads liked by the user
                },
              },
            },
          ],
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
          threadLikes: {
            where: {
              userId: authorId,
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              threadLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
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
          _count: {
            select: {
              threadLikes: true,
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

  acceptContent(contentId: string, order: number) {
    return from(
      this.prisma.threadContent.update({
        where: { id: contentId },
        data: {
          status: ContentStatus.ACCEPTED,
          order: order,
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

  rejectMultipleContents(parentContentId: string, excludeContentId: string) {
    return from(
      this.prisma.threadContent.updateMany({
        where: {
          parentContentId: parentContentId,
          status: ContentStatus.PENDING,
          id: { not: excludeContentId },
        },
        data: { status: ContentStatus.REJECTED },
      }),
    );
  }

  getContentDetails(contentId: string) {
    return from(
      this.prisma.threadContent.findUnique({
        where: { id: contentId },
        select: {
          parentContentId: true,
          threadId: true,
          status: true,
          authorId: true,
        },
      }),
    );
  }

  getAcceptedContentsCount(threadId: string) {
    return from(
      this.prisma.threadContent.count({
        where: {
          threadId: threadId,
          status: ContentStatus.ACCEPTED,
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
    return from(this.prisma.thread.delete({ where: { id: threadId } }));
  }

  getPendingContents(threadId: string) {
    return from(
      this.prisma.threadContent.findMany({
        where: {
          threadId,
          status: ContentStatus.PENDING,
        },
        orderBy: {
          createdAt: 'asc',
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

  checkExistingPendingContent(authorId: string, parentContentId: string) {
    return from(
      this.prisma.threadContent.findFirst({
        where: {
          authorId,
          parentContentId,
          status: ContentStatus.PENDING,
        },
        select: {
          id: true,
        },
      }),
    );
  }

  updatePendingContent(contentId: string, content: string) {
    return from(
      this.prisma.threadContent.update({
        where: {
          id: contentId,
          status: ContentStatus.PENDING, // Only allow updating pending content
        },
        data: { content },
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

  toggleThreadLike(threadId: string, userId: string) {
    return from(
      (async () => {
        // Check if user already liked this thread
        const existingLike = await this.prisma.userThreadLike.findUnique({
          where: {
            userId_threadId: {
              userId,
              threadId,
            },
          },
        });

        if (existingLike) {
          // Unlike: remove the like record
          await this.prisma.userThreadLike.delete({
            where: { id: existingLike.id },
          });

          return this.prisma.thread.findUnique({
            where: { id: threadId },
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
              _count: {
                select: {
                  threadLikes: true,
                },
              },
            },
          });
        } else {
          // Like: create like record
          await this.prisma.userThreadLike.create({
            data: {
              userId,
              threadId,
            },
          });

          return this.prisma.thread.findUnique({
            where: { id: threadId },
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
              _count: {
                select: {
                  threadLikes: true,
                },
              },
            },
          });
        }
      })(),
    );
  }

  getLikedThreadsByUser(userId: string) {
    return from(
      this.prisma.thread.findMany({
        where: {
          AND: [
            {
              threadLikes: {
                some: {
                  userId,
                },
              },
            },
            {
              authorId: {
                not: userId, // Exclude threads created by the user
              },
            },
          ],
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
          threadLikes: {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              threadLikes: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    );
  }

  getTrendingThreads(currentUserId?: string) {
    return from(
      this.prisma.thread.findMany({
        where: {
          threadLikes: {
            some: {}, // Only include threads that have at least one like
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
          threadLikes: currentUserId
            ? {
                where: {
                  userId: currentUserId,
                },
                select: {
                  id: true,
                },
              }
            : false,
          _count: {
            select: {
              threadLikes: true, // Count the number of likes
            },
          },
        },
        orderBy: [
          {
            threadLikes: {
              _count: 'desc', // Order by the count of likes
            },
          },
          {
            createdAt: 'desc',
          },
        ],
        take: 20, // Limit to top 20 trending threads
      }),
    );
  }
}
