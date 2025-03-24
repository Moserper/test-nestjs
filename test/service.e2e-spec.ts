import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ServiceController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.service.deleteMany();
    await app.close();
  });

  it('/service-requests (POST)', () => {
    return request(app.getHttpServer())
      .post('/service-requests')
      .send({
        title: 'Test Service',
        description: 'Test Description',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.status).toBe('OPEN');
      });
  });

});
