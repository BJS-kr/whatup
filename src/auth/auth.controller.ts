import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { SignUpDto, signUpSchema } from './dto/dto.sign-up';
import { SignInDto, signInSchema } from './dto/dto.sign-in';
import { SchemaValidator } from '../common/schema.validator';
import { AuthService } from './auth.service';
import { defaultIfEmpty, map } from 'rxjs';
import { Response } from 'express';
import { AbortInterceptor } from 'src/common/abort-controller/ac.interceptor';
import { AC } from 'src/common/abort-controller/ac.decorator';
import { ACTUAL } from 'src/common/pipe.strategies';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
@Controller('auth')
@UseInterceptors(AbortInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('sign-up')
  signUp(
    @Body(new SchemaValidator(signUpSchema)) signUpDto: SignUpDto,
    @AC() ac: AbortController,
  ) {
    return this.authService.tryAddUser(ac, signUpDto).pipe(
      ACTUAL(),
      map((result) => result.email),
      defaultIfEmpty('request failed'),
    );
  }

  @Post('sign-in')
  signIn(
    @Body(new SchemaValidator(signInSchema)) signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
    @AC() ac: AbortController,
  ) {
    return this.authService.tryGetAccessToken(ac, signInDto).pipe(
      ACTUAL(),
      map((token) => {
        res.cookie('accessToken', token, {
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }),
      defaultIfEmpty('request failed'),
    );
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
  }
}
