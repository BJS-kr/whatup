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
} from 'src/common/strategies/pipe.strategies';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { AbortControllerStorage } from 'src/common/cls/ac.store';
import { AC } from 'src/common/constants';
import { Algorithm } from 'jsonwebtoken';
export const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly expiresIn: string;
  private readonly algorithm: Algorithm;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly cls: ClsService<AbortControllerStorage>,
  ) {
    const jwtSecret = this.configService.get('JWT_SECRET');
    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    const algorithm = this.configService.get<Algorithm>('JWT_ALGORITHM');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not set');
    }

    if (!expiresIn) {
      throw new Error('JWT_EXPIRES_IN is not set');
    }

    if (!algorithm) {
      throw new Error('JWT_ALGORITHM is not set');
    }

    this.jwtSecret = jwtSecret;
    this.expiresIn = expiresIn;
    this.algorithm = algorithm;
  }

  private generateAccessToken(userId: string) {
    return from(
      this.jwtService.signAsync(
        { userId },
        {
          expiresIn: this.expiresIn,
          algorithm: this.algorithm,
          secret: this.jwtSecret,
        },
      ),
    );
  }

  tryAddUser({ email, password, nickname }: SignUpDto) {
    return from(bcrypt.hash(password, SALT_ROUNDS)).pipe(
      switchMap((hashedPassword) =>
        this.usersRepository.addUser(email, nickname, hashedPassword),
      ),
      resultBefore(2000),
      retryIfFault(2),
      abortIfError(
        this.cls.get(AC),
        (err) =>
          new Reason(
            err?.message === 'duplicated user info'
              ? RESPONSIBLE.CLIENT
              : RESPONSIBLE.SERVER,
            err.message,
          ),
      ),
    );
  }

  tryGetAccessToken({ email, password }: SignInDto) {
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
      abortIfError(this.cls.get(AC), (err) =>
        err.message === 'user not found' ||
        err.message === 'wrong id or password'
          ? new Reason(RESPONSIBLE.CLIENT, err.message)
          : new Reason(RESPONSIBLE.SERVER, 'error occurred while sign in'),
      ),
    );
  }
}
