import { Injectable } from '@nestjs/common';
import { catchError, from, throwError } from 'rxjs';
import { PrismaService } from '../common/db/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly client: PrismaService) {}

  addUser(email: string, nickname: string, hashedPassword: string) {
    return from(
      this.client.user.create({
        data: {
          email,
          nickname,
          password: hashedPassword,
          service: 'test',
        },
      }),
    ).pipe(
      catchError((err) =>
        err.code === 'P2002'
          ? throwError(() => new Error('duplicated user info'))
          : throwError(() => err),
      ),
    );
  }

  findUserByEmail(email: string) {
    return from(
      this.client.user.findUnique({
        where: {
          email,
        },
        select: {
          id: true,
          email: true,
          password: true,
          nickname: true,
        },
      }),
    );
  }
}
