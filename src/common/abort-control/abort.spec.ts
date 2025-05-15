import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TestingModule } from '@nestjs/testing';
import { abortIfError } from '../strategies/pipe.strategies';
import { of, throwError } from 'rxjs';
import { Reason } from 'src/common/errors/custom.errors';
import { RESPONSIBLE } from 'src/common/errors/custom.errors';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AbortInterceptor } from './abort.interceptor';
import { ClsModule, ClsService } from 'nestjs-cls';
import { AbortControllerStorage } from '../cls/ac.store';
import { AC } from '../constants';

@Controller()
@UseInterceptors(AbortInterceptor)
class TestController {
  constructor(private readonly cls: ClsService<AbortControllerStorage>) {}

  @Get('ok')
  ok() {
    return of('ok');
  }

  @Get('client-error')
  clientError() {
    return throwError(() => new Error('client error')).pipe(
      abortIfError(
        this.cls.get(AC),
        (err) => new Reason(RESPONSIBLE.CLIENT, err.message),
      ),
    );
  }

  @Get('server-error')
  serverError() {
    return throwError(() => new Error('server error')).pipe(
      abortIfError(
        this.cls.get(AC),
        (err) => new Reason(RESPONSIBLE.SERVER, err.message),
      ),
    );
  }
}

describe('AbortInterceptor', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          middleware: {
            mount: true,
            setup: (cls) => cls.set(AC, new AbortController()),
          },
        }),
      ],
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

  it('should not throw if request is not aborted', () => {
    return request(app.getHttpServer()).get('/ok').expect(200).expect('ok');
  });

  it('should throw if request is aborted', () => {
    return request(app.getHttpServer())
      .get('/client-error')
      .expect(400)
      .expect((res) => {
        expect(res.body.statusCode).toBe(400);
        expect(res.body.message).toBe('client error');
      });
  });

  it('should throw if request is aborted', () => {
    return request(app.getHttpServer())
      .get('/server-error')
      .expect(500)
      .expect((res) => {
        expect(res.body.statusCode).toBe(500);
        expect(res.body.message).toBe('server error');
      });
  });
});
