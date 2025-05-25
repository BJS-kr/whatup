import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { ThreadsRepository } from './threads.repository';
import { CreateThreadDto } from './dto/dto.create-thread';
import { AddContentDto } from './dto/dto.add-content';
import { switchMap, throwError } from 'rxjs';
import { Reason, RESPONSIBLE } from 'src/common/errors/custom.errors';
import { tryStrategy } from 'src/common/strategies/pipe.strategies';
import { AbortControllerStorage } from 'src/common/cls/ac.store';
import { AC } from 'src/common/constants';
import { ContentStatus } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly cls: ClsService<AbortControllerStorage>,
    private readonly threadsRepository: ThreadsRepository,
  ) {}

  tryCreateThread(dto: CreateThreadDto) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.createThread(user.userId, dto).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to create thread',
      }),
    );
  }

  tryGetThreads() {
    return this.threadsRepository.getThreads().pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get threads',
      }),
    );
  }

  tryGetMyThreads() {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.getThreadsByAuthor(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get my threads',
      }),
    );
  }

  tryGetOtherThreads() {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.getThreadsByNotAuthor(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get other threads',
      }),
    );
  }

  tryGetThread(threadId: string) {
    return this.threadsRepository.getThread(threadId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get thread',
      }),
    );
  }

  tryAddContent(threadId: string, dto: AddContentDto) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.getThread(threadId).pipe(
      switchMap((thread) => {
        if (!thread) {
          return throwError(() => new Error('thread not found'));
        }

        // Get the last content (including pending)
        const lastContent = thread.threadContents.sort(
          (a, b) => b.order - a.order,
        )[0];

        // Check if the last content was from the same author and consecutive contributions are not allowed
        if (
          !thread.allowConsecutiveContribution &&
          lastContent &&
          lastContent.authorId === user.userId
        ) {
          return throwError(
            () => new Error('consecutive contributions not allowed'),
          );
        }

        const parentContentId = dto.parentContentId || lastContent?.id;
        const order = thread.threadContents.length + 1;
        const status = thread.autoAccept
          ? ContentStatus.ACCEPTED
          : ContentStatus.PENDING;

        const updatedDto = { ...dto, parentContentId };

        return this.threadsRepository.addContent(
          threadId,
          user.userId,
          updatedDto,
          order,
          status,
        );
      }),
      tryStrategy(this.cls.get(AC), {
        customErrorHandler: (err) => {
          if (err.message === 'thread not found') {
            return new Reason(RESPONSIBLE.CLIENT, 'thread not found');
          }
          if (err.message === 'consecutive contributions not allowed') {
            return new Reason(
              RESPONSIBLE.CLIENT,
              'you cannot add content right after your own contribution',
            );
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to add content');
        },
      }),
    );
  }

  tryAcceptContent(contentId: string) {
    return this.threadsRepository.acceptContent(contentId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to accept content',
      }),
    );
  }

  tryRejectContent(contentId: string) {
    return this.threadsRepository.rejectContent(contentId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to reject content',
      }),
    );
  }

  tryReorderContent(contentId: string, newOrder: number) {
    return this.threadsRepository.reorderContent(contentId, newOrder).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to reorder content',
      }),
    );
  }

  tryLikeContent(contentId: string) {
    return this.threadsRepository.likeContent(contentId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to like content',
      }),
    );
  }

  tryDeleteThread(threadId: string) {
    return this.threadsRepository.deleteThread(threadId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to delete thread',
      }),
    );
  }
}
