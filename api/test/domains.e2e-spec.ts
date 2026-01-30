import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('DomainsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/domains (GET)', () => {
    it('should return list of domains', () => {
      return request(app.getHttpServer()).get('/domains').expect(200);
    });
  });

  describe('/domains (POST)', () => {
    it('should return 403 when trying to create main domain if one exists', () => {
      return request(app.getHttpServer())
        .post('/domains')
        .send({
          domain: 'example.com',
          main: true,
          https: true,
        })
        .expect(403);
    });
  });
});
