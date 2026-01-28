import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ProjectController (e2e)', () => {
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

  describe('/projects (GET)', () => {
    it('should return list of projects', () => {
      return request(app.getHttpServer()).get('/projects').expect(200);
    });
  });

  describe('/projects/:id (GET)', () => {
    it('should return 404 for non-existent project', () => {
      return request(app.getHttpServer())
        .get('/projects/non-existent-id')
        .expect(404);
    });
  });
});
