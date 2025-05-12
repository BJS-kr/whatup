import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { SignUpDto } from './dto/dto.sign-up';
import { from, of, switchMap, throwError } from 'rxjs';
import { Reason, RESPONSIBLE } from 'src/common/errors/custom.errors';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/dto.sign-in';
import {
  abortIfError,
  resultBefore,
  retryIfFault,
} from 'src/common/pipe.strategies';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = this.configService.get('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    this.jwtSecret = jwtSecret;
  }

  private generateAccessToken(userId: string) {
    return from(
      this.jwtService.signAsync(
        { userId },
        {
          expiresIn: '30d',
          algorithm: 'HS256',
          secret: this.jwtSecret,
        },
      ),
    );
  }

  tryAddUser(ac: AbortController, { email, password, nickname }: SignUpDto) {
    return from(bcrypt.hash(password, SALT_ROUNDS)).pipe(
      switchMap((hashedPassword) =>
        this.usersRepository.addUser(email, nickname, hashedPassword),
      ),
      resultBefore(2000),
      retryIfFault(2),
      abortIfError(
        ac,
        (err) =>
          new Reason(
            err?.message === 'user email already exists'
              ? RESPONSIBLE.CLIENT
              : RESPONSIBLE.SERVER,
            err.message,
          ),
      ),
    );
  }

  tryGetAccessToken(ac: AbortController, { email, password }: SignInDto) {
    return from(this.usersRepository.findUserByEmail(email)).pipe(
      switchMap((user) => {
        if (!user) return throwError(() => new Error('user not found'));

        return from(bcrypt.compare(password, user.password)).pipe(
          switchMap((isMatch) =>
            isMatch
              ? of(user)
              : throwError(() => new Error('wrong id or password')),
          ),
        );
      }),
      switchMap((user) => this.generateAccessToken(user.id)),
      resultBefore(2000),
      retryIfFault(2),
      abortIfError(ac, (err) =>
        err.message === 'user not found' ||
        err.message === 'wrong id or password'
          ? new Reason(RESPONSIBLE.CLIENT, err.message)
          : new Reason(RESPONSIBLE.SERVER, 'error occurred while sign in'),
      ),
    );
  }
}
