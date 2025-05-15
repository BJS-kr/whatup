import { Body, Controller, Get, UseInterceptors } from '@nestjs/common';
import { ThreadsService } from './threads.service';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  createThread() {}
}
