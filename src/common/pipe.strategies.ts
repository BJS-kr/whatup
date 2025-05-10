import { catchError, filter, Observable, of, retry, timer } from 'rxjs';
import { throwError, timeout } from 'rxjs';
import { ABORTED } from './constants';
import { Fault, Reason } from './errors/custom.errors';
import { Logger } from '@nestjs/common';

type MustReturnReason = (err: any) => Reason;

const logger = new Logger('raw error', { timestamp: true });

export const resultBefore = <T>(millis: number) => {
  return timeout<T, Observable<never>>({
    first: millis,
    with: () => throwError(() => new Fault('operation timeout')),
  });
};

export const retryIfFault = <T>(count: number) => {
  return retry<T>({
    count,
    delay: (err, retryCount) => {
      return err instanceof Fault
        ? timer(retryCount * 1000)
        : throwError(() => err);
    },
  });
};

export const abortIfError = <T>(
  ac: AbortController,
  mustReturnReason: MustReturnReason,
) => {
  return catchError<T, Observable<typeof ABORTED>>((err) => {
    logger.error(err);

    const reason = mustReturnReason(err);
    ac.abort(reason);
    return of(ABORTED);
  });
};

const actualPredicate = <T>(v: T): v is Exclude<T, typeof ABORTED> =>
  v !== ABORTED;

export const ACTUAL = <T>() => filter(actualPredicate<T>);
