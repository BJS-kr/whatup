import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ThreadsRepository } from './threads.repository';
import { CreateThreadDto } from './dto/dto.create-thread';
import { UpdateThreadDto } from './dto/dto.update-thread';
import { AddContentDto } from './dto/dto.add-content';
import { switchMap, throwError, tap } from 'rxjs';
import { Reason, RESPONSIBLE } from 'src/common/errors/custom.errors';
import { tryStrategy } from 'src/common/strategies/pipe.strategies';
import { AbortControllerStorage } from 'src/common/cls/ac.store';
import { AC } from 'src/common/constants';
import { ContentStatus } from '@prisma/client';
import {
  ContentAcceptedEvent,
  ContentRejectedEvent,
  ChangeRequestEvent,
  NewContributionEvent,
  NewSubmissionEvent,
} from '../events/content.events';

@Injectable()
export class ThreadsService {
  constructor(
    private readonly cls: ClsService<AbortControllerStorage>,
    private readonly threadsRepository: ThreadsRepository,
    private readonly eventEmitter: EventEmitter2,
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

  tryUpdateThread(threadId: string, dto: UpdateThreadDto) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.updateThread(threadId, user.userId, dto).pipe(
      tryStrategy(this.cls.get(AC), {
        customErrorHandler: (err) => {
          if (err.code === 'P2025') {
            return new Reason(
              RESPONSIBLE.CLIENT,
              'thread not found or unauthorized',
            );
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to update thread');
        },
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

    return this.threadsRepository
      .getThreadsByAuthor(user.userId, user.userId)
      .pipe(
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

        const parentContentId = dto.parentContentId || lastContent?.id;

        // Thread authors can always add content directly, others depend on autoAccept setting
        const status =
          thread.autoAccept || thread.authorId === user.userId
            ? ContentStatus.ACCEPTED
            : ContentStatus.PENDING;

        // Apply different validation rules based on whether content will be auto-accepted
        if (status === ContentStatus.ACCEPTED) {
          // For auto-accepted content, check consecutive contributions against ACCEPTED content only
          const lastAcceptedContent = thread.threadContents
            .filter((content) => content.status === ContentStatus.ACCEPTED)
            .sort((a, b) => b.order - a.order)[0];

          if (
            !thread.allowConsecutiveContribution &&
            lastAcceptedContent &&
            lastAcceptedContent.authorId === user.userId
          ) {
            return throwError(
              () => new Error('consecutive contributions not allowed'),
            );
          }
        } else {
          // For pending content, check if user already has a pending candidate for the same parent
          if (parentContentId) {
            return this.threadsRepository
              .checkExistingPendingContent(user.userId, parentContentId)
              .pipe(
                switchMap((existingPending) => {
                  if (existingPending) {
                    return throwError(
                      () =>
                        new Error(
                          'you already have a pending contribution for this content',
                        ),
                    );
                  }

                  // No existing pending content, proceed with creation
                  const acceptedContents = thread.threadContents.filter(
                    (content) => content.status === ContentStatus.ACCEPTED,
                  );
                  const order = acceptedContents.length + 1;

                  const updatedDto = { ...dto, parentContentId };

                  return this.threadsRepository
                    .addContent(
                      threadId,
                      user.userId,
                      updatedDto,
                      order,
                      status,
                    )
                    .pipe(
                      tap((createdContent) => {
                        // Emit event for thread creator notification
                        if (status === ContentStatus.PENDING) {
                          this.eventEmitter.emit(
                            'content.new-submission',
                            new NewSubmissionEvent(
                              createdContent.id,
                              user.userId,
                              user.nickname,
                              threadId,
                              thread.title,
                              thread.authorId,
                            ),
                          );
                        }
                      }),
                    );
                }),
              );
          }
        }

        // For auto-accepted content, proceed with creation
        const acceptedContents = thread.threadContents.filter(
          (content) => content.status === ContentStatus.ACCEPTED,
        );
        const order = acceptedContents.length + 1;

        const updatedDto = { ...dto, parentContentId };

        return this.threadsRepository
          .addContent(threadId, user.userId, updatedDto, order, status)
          .pipe(
            tap((createdContent) => {
              // Emit event for thread creator notification
              if (status === ContentStatus.ACCEPTED) {
                this.eventEmitter.emit(
                  'content.new-contribution',
                  new NewContributionEvent(
                    createdContent.id,
                    user.userId,
                    user.nickname,
                    threadId,
                    thread.title,
                    thread.authorId,
                  ),
                );
              } else if (status === ContentStatus.PENDING) {
                this.eventEmitter.emit(
                  'content.new-submission',
                  new NewSubmissionEvent(
                    createdContent.id,
                    user.userId,
                    user.nickname,
                    threadId,
                    thread.title,
                    thread.authorId,
                  ),
                );
              }
            }),
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
          if (
            err.message ===
            'you already have a pending contribution for this content'
          ) {
            return new Reason(
              RESPONSIBLE.CLIENT,
              'you already have a pending contribution for this content',
            );
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to add content');
        },
      }),
    );
  }

  tryAcceptContent(contentId: string) {
    return this.threadsRepository.getContentDetails(contentId).pipe(
      switchMap((contentDetails) => {
        if (!contentDetails) {
          return throwError(() => new Error('content not found'));
        }

        if (contentDetails.status !== ContentStatus.PENDING) {
          return throwError(() => new Error('content is not pending'));
        }

        // Get thread details for the event
        return this.threadsRepository.getThread(contentDetails.threadId).pipe(
          switchMap((thread) => {
            if (!thread) {
              return throwError(() => new Error('thread not found'));
            }

            // Get the next order number for this thread
            return this.threadsRepository
              .getAcceptedContentsCount(contentDetails.threadId)
              .pipe(
                switchMap((acceptedCount) => {
                  const newOrder = acceptedCount + 1;

                  // Accept the content with the calculated order
                  return this.threadsRepository
                    .acceptContent(contentId, newOrder)
                    .pipe(
                      tap((acceptedContent) => {
                        // Emit event for notice creation
                        this.eventEmitter.emit(
                          'content.accepted',
                          new ContentAcceptedEvent(
                            contentId,
                            contentDetails.authorId,
                            contentDetails.threadId,
                            thread.title,
                          ),
                        );
                      }),
                      switchMap((acceptedContent) => {
                        // If this content has a parent, reject all other pending contents with the same parent
                        if (contentDetails.parentContentId) {
                          return this.threadsRepository
                            .rejectMultipleContents(
                              contentDetails.parentContentId,
                              contentId,
                            )
                            .pipe(
                              switchMap(() => {
                                // Return the accepted content
                                return [acceptedContent];
                              }),
                            );
                        }

                        // No competing contents to reject, just return the accepted content
                        return [acceptedContent];
                      }),
                    );
                }),
              );
          }),
        );
      }),
      tryStrategy(this.cls.get(AC), {
        customErrorHandler: (err) => {
          if (err.message === 'content not found') {
            return new Reason(RESPONSIBLE.CLIENT, 'content not found');
          }
          if (err.message === 'content is not pending') {
            return new Reason(RESPONSIBLE.CLIENT, 'content is not pending');
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to accept content');
        },
      }),
    );
  }

  tryRejectContent(contentId: string) {
    return this.threadsRepository.getContentDetails(contentId).pipe(
      switchMap((contentDetails) => {
        if (!contentDetails) {
          return throwError(() => new Error('content not found'));
        }

        // Get thread details for the event
        return this.threadsRepository.getThread(contentDetails.threadId).pipe(
          switchMap((thread) => {
            if (!thread) {
              return throwError(() => new Error('thread not found'));
            }

            return this.threadsRepository.rejectContent(contentId).pipe(
              tap((rejectedContent) => {
                // Emit event for notice creation
                this.eventEmitter.emit(
                  'content.rejected',
                  new ContentRejectedEvent(
                    contentId,
                    contentDetails.authorId,
                    contentDetails.threadId,
                    thread.title,
                  ),
                );
              }),
            );
          }),
        );
      }),
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to reject content',
      }),
    );
  }

  tryRequestChanges(contentId: string, message: string) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.getContentDetails(contentId).pipe(
      switchMap((contentDetails) => {
        if (!contentDetails) {
          return throwError(() => new Error('content not found'));
        }

        if (contentDetails.status !== ContentStatus.PENDING) {
          return throwError(() => new Error('content is not pending'));
        }

        // Verify the user is the thread owner
        return this.threadsRepository.getThread(contentDetails.threadId).pipe(
          switchMap((thread) => {
            if (!thread || thread.authorId !== user.userId) {
              return throwError(() => new Error('unauthorized'));
            }

            // Emit event for notice creation
            this.eventEmitter.emit(
              'content.change-request',
              new ChangeRequestEvent(
                contentId,
                contentDetails.authorId,
                contentDetails.threadId,
                thread.title,
                message,
                user.userId,
              ),
            );

            return [{ id: contentId }];
          }),
        );
      }),
      tryStrategy(this.cls.get(AC), {
        customErrorHandler: (err) => {
          if (err.message === 'content not found') {
            return new Reason(RESPONSIBLE.CLIENT, 'content not found');
          }
          if (err.message === 'content is not pending') {
            return new Reason(RESPONSIBLE.CLIENT, 'content is not pending');
          }
          if (err.message === 'unauthorized') {
            return new Reason(RESPONSIBLE.CLIENT, 'unauthorized');
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to request changes');
        },
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

  tryGetPendingContents(threadId: string) {
    return this.threadsRepository.getPendingContents(threadId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get pending contents',
      }),
    );
  }

  tryUpdatePendingContent(contentId: string, content: string) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    // First verify the content belongs to the user
    return this.threadsRepository.getContentDetails(contentId).pipe(
      switchMap((contentDetails) => {
        if (!contentDetails) {
          return throwError(() => new Error('content not found'));
        }

        if (contentDetails.status !== ContentStatus.PENDING) {
          return throwError(() => new Error('content is not pending'));
        }

        // Get full content to check ownership
        return this.threadsRepository
          .getPendingContents(contentDetails.threadId)
          .pipe(
            switchMap((pendingContents) => {
              const targetContent = pendingContents.find(
                (c) => c.id === contentId,
              );

              if (!targetContent || targetContent.author.id !== user.userId) {
                return throwError(
                  () => new Error('unauthorized to update this content'),
                );
              }

              return this.threadsRepository.updatePendingContent(
                contentId,
                content,
              );
            }),
          );
      }),
      tryStrategy(this.cls.get(AC), {
        customErrorHandler: (err) => {
          if (err.message === 'content not found') {
            return new Reason(RESPONSIBLE.CLIENT, 'content not found');
          }
          if (err.message === 'content is not pending') {
            return new Reason(RESPONSIBLE.CLIENT, 'content is not pending');
          }
          if (err.message === 'unauthorized to update this content') {
            return new Reason(
              RESPONSIBLE.CLIENT,
              'unauthorized to update this content',
            );
          }
          return new Reason(RESPONSIBLE.SERVER, 'failed to update content');
        },
      }),
    );
  }

  tryToggleThreadLike(threadId: string) {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.toggleThreadLike(threadId, user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to toggle thread like',
      }),
    );
  }

  tryGetLikedThreads() {
    const user = this.cls.get('user');
    if (!user?.userId) {
      return throwError(() => new Error('user not authenticated'));
    }

    return this.threadsRepository.getLikedThreadsByUser(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get liked threads',
      }),
    );
  }

  tryGetTrendingThreads() {
    const user = this.cls.get('user');
    const userId = user?.userId; // Optional - trending threads can be viewed by non-authenticated users

    return this.threadsRepository.getTrendingThreads(userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get trending threads',
      }),
    );
  }
}
