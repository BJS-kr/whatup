import { ExecutionContext } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { AbortControlledRequest } from './types';

export const AC = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AbortControlledRequest>();

  if (!request.ac) {
    throw new InternalServerErrorException(
      'AbortController not found in request',
    );
  }

  return request.ac;
});
