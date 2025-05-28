import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ThreadsModule } from './threads/threads.module';
import { NoticesModule } from './notices/notices.module';
import { AC } from './common/constants';
import { DbModule } from './common/db/db.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

const envFilePath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls) => cls.set(AC, new AbortController()),
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      cache: true,
      expandVariables: true,
    }),
    DbModule,
    ThreadsModule,
    NoticesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
