import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateThreadDto, createThreadSchema } from './dto/dto.create-thread';
import { AddContentDto, addContentSchema } from './dto/dto.add-content';
import { SchemaValidator } from '../common/validators/schema.validator';
import { actualOrNone } from 'src/common/strategies/pipe.strategies';

@Controller('threads')
@UseInterceptors(AbortInterceptor)
@UseGuards(AuthGuard)
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  createThread(
    @Body(new SchemaValidator(createThreadSchema)) dto: CreateThreadDto,
  ) {
    return this.threadsService
      .tryCreateThread(dto)
      .pipe(actualOrNone((thread) => thread.id));
  }

  @Get('my')
  getMyThreads() {
    return this.threadsService
      .tryGetMyThreads()
      .pipe(actualOrNone((threads) => threads));
  }

  @Get('others')
  getOtherThreads() {
    return this.threadsService
      .tryGetOtherThreads()
      .pipe(actualOrNone((threads) => threads));
  }

  @Post(':id/content')
  addContent(
    @Param('id') id: string,
    @Body(new SchemaValidator(addContentSchema)) dto: AddContentDto,
  ) {
    return this.threadsService
      .tryAddContent(id, dto)
      .pipe(actualOrNone((content) => content.id));
  }

  @Put('content/:id/accept')
  acceptContent(@Param('id') id: string) {
    return this.threadsService
      .tryAcceptContent(id)
      .pipe(actualOrNone((content) => content.id));
  }

  @Put('content/:id/reject')
  rejectContent(@Param('id') id: string) {
    return this.threadsService
      .tryRejectContent(id)
      .pipe(actualOrNone((content) => content.id));
  }

  @Put('content/:id/reorder')
  reorderContent(@Param('id') id: string, @Body('order') order: number) {
    return this.threadsService
      .tryReorderContent(id, order)
      .pipe(actualOrNone((content) => content.id));
  }

  @Put('content/:id/like')
  likeContent(@Param('id') id: string) {
    return this.threadsService
      .tryLikeContent(id)
      .pipe(
        actualOrNone((content) => ({ id: content.id, likes: content.like })),
      );
  }

  @Delete(':id')
  deleteThread(@Param('id') id: string) {
    return this.threadsService
      .tryDeleteThread(id)
      .pipe(actualOrNone((thread) => thread.id));
  }
}
