import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import { StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let postgresContainer: StartedTestContainer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    const configService = app.get<ConfigService>(ConfigService);

    postgresContainer = await new PostgreSqlContainer('postgres:16')
      .withPassword('test')
      .withUsername('postgres')
      .withDatabase('test')
      .withExposedPorts(5432)
      .withWaitStrategy(
        Wait.forAll([
          Wait.forLogMessage('database system is ready to accept connections'),
          Wait.forHealthCheck(),
        ]),
      )
      .start();

    configService.set(
      'DATABASE_URL',
      `postgresql://postgres:test@${postgresContainer.getHost()}:${postgresContainer.getFirstMappedPort()}/test`,
    );

    console.log(postgresContainer.getHost());
    console.log(postgresContainer.getFirstMappedPort());

    await app.init();
  }, 1000000);

  afterAll(async () => {
    await postgresContainer.stop();
  });

  it('should be none', () => {
    expect(true).toBe(true);
  });

  // it('should be healthy', () => {
  //   return request(app.getHttpServer()).get('/health').expect(200);
  // });

  // it('should be able to sign up', () => {
  //   const email = 'test@test.com';

  //   return request(app.getHttpServer())
  //     .post('api/auth/sign-up')
  //     .send({
  //       email,
  //       password: 'test',
  //     })
  //     .expect(201)
  //     .expect(email);
  // });

  // it('should be able to sign in', () => {
  //   const email = 'test@test.com';
  //   const password = 'test';

  //   return request(app.getHttpServer())
  //     .post('api/auth/sign-in')
  //     .send({
  //       email,
  //       password,
  //     })
  //     .expect(201);
  // });
});
