import {
  Controller,
  Get,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { AbortInterceptor } from './ac.interceptor';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { AC } from './ac.decorator';
import { abortIfError } from '../pipe.strategies';
import { of, throwError } from 'rxjs';
import { Reason } from 'src/common/errors/custom.errors';
import { RESPONSIBLE } from 'src/common/errors/custom.errors';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

@Controller()
@UseInterceptors(AbortInterceptor)
class TestController {
  @Get('ok')
  ok() {
    return of('ok');
  }

  @Get('client-error')
  clientError(@AC() ac: AbortController) {
    return throwError(() => new Error('client error')).pipe(
      abortIfError(ac, (err) => new Reason(RESPONSIBLE.CLIENT, err.message)),
    );
  }

  @Get('server-error')
  serverError(@AC() ac: AbortController) {
    return throwError(() => new Error('server error')).pipe(
      abortIfError(ac, (err) => new Reason(RESPONSIBLE.SERVER, err.message)),
    );
  }
}

describe('AbortInterceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication({
      logger: false,
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not throw if request is not aborted', async () => {
    return request(app.getHttpServer()).get('/ok').expect(200).expect('ok');
  });

  it('should throw if request is aborted', async () => {
    return request(app.getHttpServer())
      .get('/client-error')
      .expect(400)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe('client error');
      });
  });

  it('should throw if request is aborted', async () => {
    return request(app.getHttpServer())
      .get('/server-error')
      .expect(500)
      .expect((res) => {
        expect(res.body.statusCode).toBe(500);
        expect(res.body.message).toBe('server error');
      });
  });
});
