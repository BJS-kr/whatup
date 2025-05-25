import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';
import { actualOrNone } from 'src/common/strategies/pipe.strategies';

@Controller('threads')
@UseInterceptors(AbortInterceptor)
export class ThreadsPublicController {
  private readonly logger = new Logger(ThreadsPublicController.name);

  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  getThreads() {
    this.logger.log('Fetching all threads');
    return this.threadsService.tryGetThreads().pipe(
      actualOrNone((threads) => {
        this.logger.log(`Found ${threads.length} threads`);
        return threads;
      }),
    );
  }

  @Get(':id')
  getThread(@Param('id') id: string) {
    this.logger.log(`Fetching thread with id: ${id}`);
    return this.threadsService.tryGetThread(id).pipe(
      actualOrNone((thread) => {
        this.logger.log(`Found thread: ${thread?.id}`);
        return thread;
      }),
    );
  }
}
