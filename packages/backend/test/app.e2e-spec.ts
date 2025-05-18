import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { StartedTestContainer, Wait } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let postgresContainer: StartedTestContainer;

  beforeAll(async () => {
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
    const dbUrl = `postgresql://postgres:test@${postgresContainer.getHost()}:${postgresContainer.getFirstMappedPort()}/test`;

    writeFileSync('.env.test', `DATABASE_URL=${dbUrl}\nJWT_SECRET=testsecret`);
    execSync('npm run test:e2e:migrate');

    process.env.DATABASE_URL = dbUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  }, 1000000);

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  });

  it('should be healthy', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('should be able to sign up', () => {
    const email = 'test@test.com';

    return request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({
        email,
        password: 'testpw1234',
        nickname: 'testnick',
      })
      .expect(201)
      .expect(email);
  });

  it('should be able to sign in', () => {
    const email = 'test@test.com';
    const password = 'testpw1234';

    return request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({
        email,
        password,
      })
      .expect(201);
  });
});
