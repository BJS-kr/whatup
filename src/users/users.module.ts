import { Module } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  providers: [PrismaService, UsersRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
