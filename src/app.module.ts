import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClsModule, ClsStore } from 'nestjs-cls';
import { AC } from './common/constants';

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
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      cache: true,
      expandVariables: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
