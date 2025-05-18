import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { AbortControllerStorage } from '../cls/ac.store';
import { AC } from '../constants';
import { Reason } from '../errors/custom.errors';
import { errorStatus } from '../errors/error.status';

const logger = new Logger('AbortInterceptor');

@Injectable()
export class AbortInterceptor implements NestInterceptor {
  constructor(private readonly cls: ClsService<AbortControllerStorage>) {}
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const ac = this.cls.get<AbortController>(AC);
        if (!ac) {
          logger.error('abort controller not found');

          throw new InternalServerErrorException('request failed');
        }

        if (ac.signal.aborted) {
          if (ac.signal.reason instanceof Reason) {
            logger.error(
              `
              Aborted with Reason error.
              provided reason was: ${ac.signal.reason}
              `,
            );

            throw errorStatus(ac.signal.reason);
          }

          logger.error(
            `
              Aborted with non-Reason error.
              provided reason was: ${ac.signal.reason}
            `,
          );

          throw new InternalServerErrorException('request failed');
        }
      }),
    );
  }
}
