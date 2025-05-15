import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import { SignUpDto, signUpSchema } from './dto/dto.sign-up';
import { SignInDto, signInSchema } from './dto/dto.sign-in';
import { SchemaValidator } from '../common/validators/schema.validator';
import { AuthService } from './auth.service';
import { defaultIfEmpty, map } from 'rxjs';
import { Response } from 'express';
import { ACTUAL } from 'src/common/strategies/pipe.strategies';
import { ConfigService } from '@nestjs/config';
import { NONE } from 'src/common/constants';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';

@Controller('auth')
@UseInterceptors(AbortInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-up')
  signUp(@Body(new SchemaValidator(signUpSchema)) signUpDto: SignUpDto) {
    return this.authService.tryAddUser(signUpDto).pipe(
      ACTUAL(),
      map((result) => result.email),
      defaultIfEmpty(NONE),
    );
  }

  @Post('sign-in')
  signIn(
    @Body(new SchemaValidator(signInSchema)) signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.tryGetAccessToken(signInDto).pipe(
      ACTUAL(),
      map((token) => {
        res.cookie('accessToken', token, {
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }),
      defaultIfEmpty(NONE),
    );
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
  }
}
