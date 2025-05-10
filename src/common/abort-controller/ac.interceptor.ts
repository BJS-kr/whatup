import { CallHandler, InternalServerErrorException } from '@nestjs/common';
import { ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { errorStatus } from 'src/common/errors/error.status';
import { Reason } from 'src/common/errors/custom.errors';
import { AbortControlledRequest } from './types';

@Injectable()
export class AbortInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const ac = new AbortController();
    const request = ctx.switchToHttp().getRequest<AbortControlledRequest>();
    request.ac = ac;

    return next.handle().pipe(
      //! tap을 사용하는 이유는 AbortController.abort() 호출만 처리하기 때문입니다.
      //! 이는 비즈니스 로직에서 일어난 abort만 처리한다는 의미입니다.
      tap(() => {
        if (ac.signal.aborted) {
          if (!(ac.signal.reason instanceof Reason)) {
            throw new InternalServerErrorException(
              `
              Aborted with non-Reason error.
              provided reason was: ${ac.signal.reason}
              `,
            );
          }

          throw errorStatus(ac.signal.reason);
        }
      }),
    );
  }
}
