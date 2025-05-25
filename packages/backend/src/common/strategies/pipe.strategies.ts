import {
  catchError,
  filter,
  Observable,
  of,
  retry,
  timer,
  map,
  defaultIfEmpty,
} from 'rxjs';
import { throwError, timeout } from 'rxjs';
import { ABORTED, NONE } from '../constants';
import { Fault, Reason, RESPONSIBLE } from '../errors/custom.errors';
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

/**
 * Abstracts the common controller pattern: ACTUAL() -> map(transform) -> defaultIfEmpty(NONE)
 * Filters out ABORTED results, applies transformation, and provides NONE as fallback
 */
export const actualOrNone = <T, R>(
  transform: (value: Exclude<T, typeof ABORTED>) => R,
) => {
  return (source: Observable<T>) =>
    source.pipe(ACTUAL<T>(), map(transform), defaultIfEmpty(NONE));
};

/**
 * Configuration for "try" operations that can fail and return ABORTED
 */
export interface TryStrategyConfig {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Number of retries on fault (default: 2) */
  retries?: number;
  /** Error message for simple error handling (default: 'operation failed') */
  errorMessage?: string;
  /** Responsibility for simple error handling (default: RESPONSIBLE.SERVER) */
  responsibility?: typeof RESPONSIBLE.CLIENT | typeof RESPONSIBLE.SERVER;
  /** Custom error handler for complex error logic (overrides errorMessage and responsibility) */
  customErrorHandler?: (err: any) => Reason;
}

/**
 * Abstracts the common "try" operation pattern: resultBefore -> retryIfFault -> abortIfError
 * For operations that can fail and return ABORTED symbol. Provides configurable timeout, retries, and error handling.
 */
export const tryStrategy = <T>(
  abortController: AbortController,
  config: TryStrategyConfig = {},
) => {
  const {
    timeout: timeoutMs = 5000,
    retries = 2,
    errorMessage = 'operation failed',
    responsibility = RESPONSIBLE.SERVER,
    customErrorHandler,
  } = config;

  const errorHandler =
    customErrorHandler || (() => new Reason(responsibility, errorMessage));

  return (source: Observable<T>) =>
    source.pipe(
      resultBefore<T>(timeoutMs),
      retryIfFault<T>(retries),
      abortIfError<T>(abortController, errorHandler),
    );
};
