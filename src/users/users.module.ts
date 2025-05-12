import { Module } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { PrismaService } from 'src/db/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [PrismaService, UsersRepository, ConfigService],
  exports: [UsersRepository],
})
export class UsersModule {}
