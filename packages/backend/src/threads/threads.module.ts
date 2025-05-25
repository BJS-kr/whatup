import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { ThreadsPublicController } from './threads.public.controller';
import { ThreadsRepository } from './threads.repository';

@Module({
  controllers: [ThreadsController, ThreadsPublicController],
  providers: [ThreadsService, ThreadsRepository],
})
export class ThreadsModule {}
