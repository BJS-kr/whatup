import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';

@Controller('threads')
@UseInterceptors(AbortInterceptor)
export class ThreadsPublicController {
  private readonly logger = new Logger(ThreadsPublicController.name);

  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  async getThreads() {
    try {
      this.logger.log('Fetching all threads');
      const threads = await this.threadsService.getThreads();
      this.logger.log(`Found ${threads.length} threads`);
      return threads;
    } catch (error) {
      this.logger.error('Error fetching threads:', error);
      throw error;
    }
  }

  @Get(':id')
  async getThread(@Param('id') id: string) {
    try {
      this.logger.log(`Fetching thread with id: ${id}`);
      const thread = await this.threadsService.getThread(id);
      this.logger.log(`Found thread: ${thread?.id}`);
      return thread;
    } catch (error) {
      this.logger.error(`Error fetching thread ${id}:`, error);
      throw error;
    }
  }
}
