import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, body } = req;
    const startTime = Date.now();

    // Log request
    this.logger.log(
      `Request: ${method} ${originalUrl} - Body: ${JSON.stringify(body)}`,
    );

    // Capture response
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const { statusCode } = res;

      // Log response
      this.logger.log(
        `Response: ${method} ${originalUrl} - Status: ${statusCode} - Time: ${responseTime}ms`,
      );
    });

    next();
  }
}
