import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .then((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('portfolio-backend');
      });
  });

  it('/api/health/detail (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health/detail')
      .expect(200)
      .then((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('portfolio-backend');
        expect(res.body.database).toBeDefined();
        expect(res.body.memory).toHaveProperty('rss');
        expect(res.body.memory).toHaveProperty('heapUsed');
        expect(res.body.memory).toHaveProperty('heapTotal');
      });
  });
});