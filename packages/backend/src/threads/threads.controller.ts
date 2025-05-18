import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateThreadDto } from './dto/create.thread.dto';
import { AddContentDto } from './dto/add-content.dto';

@Controller('threads')
@UseInterceptors(AbortInterceptor)
@UseGuards(AuthGuard)
export class ThreadsAuthController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  createThread(@Body() dto: CreateThreadDto) {
    return this.threadsService.createThread(dto);
  }

  @Post(':id/content')
  addContent(@Param('id') id: string, @Body() dto: AddContentDto) {
    return this.threadsService.addContent(id, dto);
  }

  @Put('content/:id/accept')
  acceptContent(@Param('id') id: string) {
    return this.threadsService.acceptContent(id);
  }

  @Put('content/:id/reject')
  rejectContent(@Param('id') id: string) {
    return this.threadsService.rejectContent(id);
  }

  @Put('content/:id/reorder')
  reorderContent(@Param('id') id: string, @Body('order') order: number) {
    return this.threadsService.reorderContent(id, order);
  }

  @Put('content/:id/like')
  likeContent(@Param('id') id: string) {
    return this.threadsService.likeContent(id);
  }

  @Delete(':id')
  deleteThread(@Param('id') id: string) {
    return this.threadsService.deleteThread(id);
  }
}
