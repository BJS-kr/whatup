import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, SALT_ROUNDS } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { SignUpDto } from './dto/dto.sign-up';
import { firstValueFrom, of, throwError } from 'rxjs';
import { Reason } from 'src/common/errors/custom.errors';
import { SignInDto } from './dto/dto.sign-in';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AC } from 'src/common/constants';
import { AbortControllerStorage } from 'src/common/cls/ac.store';

describe('AuthController', () => {
  let controller: AuthController;
  let usersRepository: UsersRepository;
  let cls: ClsService<AbortControllerStorage>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
          signOptions: {
            expiresIn: '10s',
          },
        }),
        UsersModule,
        ConfigModule,
        ClsModule,
      ],
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    // 예상된 에러에 대한 로그가 출력되지 않도록
    Logger.overrideLogger([]);

    controller = module.get<AuthController>(AuthController);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    cls = module.get<ClsService<AbortControllerStorage>>(ClsService);
  });

  it('should sign up', async () => {
    const signUpDto: SignUpDto = {
      email: 'test@test.com',
      nickname: 'test',
      password: 'password',
    };

    jest.spyOn(usersRepository, 'addUser').mockImplementationOnce(() => {
      return of({
        ...signUpDto,
        id: '1',
        service: 'test',
        like: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    await cls.runWith({ [AC]: new AbortController() }, async () => {
      const result = controller.signUp(signUpDto);
      console.log(cls.get(AC));

      const value = await firstValueFrom(result);

      expect(cls.get(AC).signal.aborted).toBe(false);
      expect(value).toBe(signUpDto.email);
    });
  });

  it('should fail to sign up if user email already exists', async () => {
    const signUpDto: SignUpDto = {
      email: 'test@test.com',
      nickname: 'test',
      password: 'password',
    };

    jest
      .spyOn(usersRepository, 'addUser')
      .mockImplementationOnce(() =>
        throwError(() => new Error('user email already exists')),
      );

    await cls.runWith({ [AC]: new AbortController() }, async () => {
      const result = controller.signUp(signUpDto);

      await new Promise<void>((res) => {
        result.subscribe({
          complete: res,
        });
      });

      expect(cls.get(AC).signal.aborted).toBe(true);
      expect(cls.get(AC).signal.reason).toBeInstanceOf(Reason);
      expect(cls.get(AC).signal.reason.message).toBe(
        'user email already exists',
      );
    });
  });

  it('should sign in', async () => {
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const signInDto: SignInDto = {
      email: 'test@test.com',
      password,
    };

    jest
      .spyOn(usersRepository, 'findUserByEmail')
      .mockImplementationOnce(() => {
        return of({
          id: '1',
          email: signInDto.email,
          password: hashedPassword,
        });
      });

    const mockResponse = createMock<Response>();

    await cls.runWith({ [AC]: new AbortController() }, async () => {
      const result = controller.signIn(signInDto, mockResponse);
      await new Promise<void>((res) => {
        result.subscribe({
          complete: res,
        });
      });

      expect(cls.get(AC).signal.aborted).toBe(false);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(String),
        {
          httpOnly: true,
          secure: false,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        },
      );
    });
  });

  it('should fail to sign in if password is not matched', async () => {
    const signInDto: SignInDto = {
      email: 'test@test.com',
      password: 'password',
    };

    const mockResponse = createMock<Response>();
    jest.spyOn(usersRepository, 'findUserByEmail').mockImplementationOnce(() =>
      of({
        id: '1',
        email: signInDto.email,
        password: 'wrong password',
      }),
    );

    await cls.runWith({ [AC]: new AbortController() }, async () => {
      const result = controller.signIn(signInDto, mockResponse);
      await new Promise<void>((res) => {
        result.subscribe({
          complete: res,
        });
      });

      expect(cls.get(AC).signal.aborted).toBe(true);
      expect(cls.get(AC).signal.reason).toBeInstanceOf(Reason);
      expect(cls.get(AC).signal.reason.message).toBe('wrong id or password');
    });
  });

  it('should fail to sign in if user is not found', async () => {
    const signInDto: SignInDto = {
      email: 'test@test.com',
      password: 'password',
    };
    const mockResponse = createMock<Response>();
    jest
      .spyOn(usersRepository, 'findUserByEmail')
      .mockImplementationOnce(() => of(null));

    await cls.runWith({ [AC]: new AbortController() }, async () => {
      const result = controller.signIn(signInDto, mockResponse);
      await new Promise<void>((res) => {
        result.subscribe({
          complete: res,
        });
      });

      expect(cls.get(AC).signal.aborted).toBe(true);
      expect(cls.get(AC).signal.reason).toBeInstanceOf(Reason);
      expect(cls.get(AC).signal.reason.message).toBe('user not found');
    });
  });
});
