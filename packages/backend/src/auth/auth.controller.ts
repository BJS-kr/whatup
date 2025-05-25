import { Body, Controller, Post, Res, UseInterceptors } from '@nestjs/common';
import { SignUpDto, signUpSchema } from './dto/dto.sign-up';
import { SignInDto, signInSchema } from './dto/dto.sign-in';
import { SchemaValidator } from '../common/validators/schema.validator';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { actualOrNone } from 'src/common/strategies/pipe.strategies';
import { ConfigService } from '@nestjs/config';
import { AbortInterceptor } from 'src/common/abort-control/abort.interceptor';

@Controller('auth')
@UseInterceptors(AbortInterceptor)
export class AuthController {
  private readonly secure: boolean = true;
  private readonly maxAge = 30 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.secure = this.configService.get('NODE_ENV') === 'production';
  }

  @Post('sign-up')
  signUp(@Body(new SchemaValidator(signUpSchema)) signUpDto: SignUpDto) {
    return this.authService
      .tryAddUser(signUpDto)
      .pipe(actualOrNone((result) => result.email));
  }

  @Post('sign-in')
  signIn(
    @Body(new SchemaValidator(signInSchema)) signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.tryGetAccessToken(signInDto).pipe(
      actualOrNone((token) => {
        res.cookie('accessToken', token, {
          httpOnly: true,
          secure: this.secure,
          maxAge: this.maxAge,
        });

        return token;
      }),
    );
  }

  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
  }
}
