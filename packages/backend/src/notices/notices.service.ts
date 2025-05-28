import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../common/db/prisma.service';
import { NoticeType } from '@prisma/client';
import { from } from 'rxjs';
import {
  ContentAcceptedEvent,
  ContentRejectedEvent,
  ChangeRequestEvent,
  NewContributionEvent,
  NewSubmissionEvent,
} from '../events/content.events';

@Injectable()
export class NoticesService {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('content.accepted')
  async handleContentAccepted(event: ContentAcceptedEvent) {
    await this.prisma.notice.create({
      data: {
        userId: event.authorId,
        type: NoticeType.CONTENT_ACCEPTED,
        title: 'Content Accepted',
        message: `Your contribution to "${event.threadTitle}" has been accepted and added to the story.`,
        threadId: event.threadId,
        contentId: event.contentId,
      },
    });
  }

  @OnEvent('content.rejected')
  async handleContentRejected(event: ContentRejectedEvent) {
    await this.prisma.notice.create({
      data: {
        userId: event.authorId,
        type: NoticeType.CONTENT_REJECTED,
        title: 'Content Rejected',
        message: `Your contribution to "${event.threadTitle}" was not accepted.`,
        threadId: event.threadId,
        contentId: event.contentId,
      },
    });
  }

  @OnEvent('content.change-request')
  async handleChangeRequest(event: ChangeRequestEvent) {
    await this.prisma.notice.create({
      data: {
        userId: event.authorId,
        type: NoticeType.CHANGE_REQUEST,
        title: 'Changes Requested',
        message: `The creator of "${event.threadTitle}" has requested changes to your contribution: ${event.message}`,
        threadId: event.threadId,
        contentId: event.contentId,
      },
    });
  }

  @OnEvent('content.new-contribution')
  async handleNewContribution(event: NewContributionEvent) {
    // Don't notify if the contributor is the thread owner
    if (event.authorId === event.threadOwnerId) {
      return;
    }

    await this.prisma.notice.create({
      data: {
        userId: event.threadOwnerId,
        type: NoticeType.NEW_CONTRIBUTION,
        title: 'New Contribution Added',
        message: `${event.authorNickname} has added a new contribution to your story "${event.threadTitle}".`,
        threadId: event.threadId,
        contentId: event.contentId,
      },
    });
  }

  @OnEvent('content.new-submission')
  async handleNewSubmission(event: NewSubmissionEvent) {
    // Don't notify if the contributor is the thread owner
    if (event.authorId === event.threadOwnerId) {
      return;
    }

    await this.prisma.notice.create({
      data: {
        userId: event.threadOwnerId,
        type: NoticeType.NEW_SUBMISSION,
        title: 'New Submission Pending',
        message: `${event.authorNickname} has submitted a new contribution to your story "${event.threadTitle}" for review.`,
        threadId: event.threadId,
        contentId: event.contentId,
      },
    });
  }

  getNoticesForUser(userId: string) {
    return from(
      this.prisma.notice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  getUnreadNoticesCount(userId: string) {
    return from(
      this.prisma.notice.count({
        where: { userId, isRead: false },
      }),
    );
  }

  markNoticeAsRead(noticeId: string, userId: string) {
    return from(
      this.prisma.notice.updateMany({
        where: { id: noticeId, userId },
        data: { isRead: true },
      }),
    );
  }

  markAllNoticesAsRead(userId: string) {
    return from(
      this.prisma.notice.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      }),
    );
  }
}
