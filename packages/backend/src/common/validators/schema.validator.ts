import { BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

const logger = new Logger('schema validation', { timestamp: true });

export class SchemaValidator implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (err) {
      logger.error(err);
      throw new BadRequestException('unexpected request data');
    }
  }
}
