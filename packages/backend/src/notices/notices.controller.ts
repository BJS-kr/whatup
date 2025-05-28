import {
  Controller,
  Get,
  Put,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { AuthGuard } from '../auth/auth.guard';
import { AbortInterceptor } from '../common/abort-control/abort.interceptor';
import { ClsService } from 'nestjs-cls';
import { AbortControllerStorage } from '../common/cls/ac.store';
import { tryStrategy } from '../common/strategies/pipe.strategies';
import { AC } from '../common/constants';
import { actualOrNone } from '../common/strategies/pipe.strategies';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NewContributionEvent } from '../events/content.events';

@Controller('notices')
@UseInterceptors(AbortInterceptor)
@UseGuards(AuthGuard)
export class NoticesController {
  constructor(
    private readonly noticesService: NoticesService,
    private readonly cls: ClsService<AbortControllerStorage>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  getNotices() {
    const user = this.cls.get('user');
    return this.noticesService.getNoticesForUser(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get notices',
      }),
      actualOrNone((notices) => notices),
    );
  }

  @Get('unread-count')
  getUnreadCount() {
    const user = this.cls.get('user');
    return this.noticesService.getUnreadNoticesCount(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to get unread count',
      }),
      actualOrNone((count) => count),
    );
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) {
    const user = this.cls.get('user');
    return this.noticesService.markNoticeAsRead(id, user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to mark notice as read',
      }),
      actualOrNone((result) => result),
    );
  }

  @Put('mark-all-read')
  markAllAsRead() {
    const user = this.cls.get('user');
    return this.noticesService.markAllNoticesAsRead(user.userId).pipe(
      tryStrategy(this.cls.get(AC), {
        errorMessage: 'failed to mark all notices as read',
      }),
      actualOrNone((result) => result),
    );
  }
}
