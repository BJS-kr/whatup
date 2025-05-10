import { BadRequestException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { Reason, RESPONSIBLE } from './custom.errors';

export const errorStatus = (reason: Reason) => {
  switch (reason.responsible) {
    case RESPONSIBLE.CLIENT:
      return new BadRequestException(reason.message);
    case RESPONSIBLE.SERVER:
      return new InternalServerErrorException(reason.message);
    default:
      return new InternalServerErrorException('unknown error');
  }
};
