import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/bootstrap/create-app.js';
import { TaskStatus } from '../src/tasks/types/task.type.js';

describe('BFF Tasks API (e2e)', () => {
  let app: INestApplication;
  const apiBase = 'http://localhost:3001';

  beforeAll(async () => {
    process.env.API_BASE_URL = `${apiBase}/api`;
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = configureApp(moduleFixture.createNestApplication());
    await app.init();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await app.close();
    nock.restore();
  });

  it('proxies create/list/get/update/delete task flow', async () => {
    const taskId = '9b68b301-4203-43cd-af73-9fc499804be7';
    const task = {
      id: taskId,
      title: 'Write tests',
      description: 'Cover BFF',
      status: TaskStatus.PENDING,
      createdAt: '2026-07-18T20:00:00.000Z',
      updatedAt: '2026-07-18T20:00:00.000Z',
    };

    nock(apiBase).post('/api/tasks').reply(201, task);
    nock(apiBase)
      .get('/api/tasks')
      .query(true)
      .reply(200, {
        data: [task],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    nock(apiBase).get(`/api/tasks/${taskId}`).reply(200, task);
    nock(apiBase)
      .patch(`/api/tasks/${taskId}`)
      .reply(200, { ...task, status: TaskStatus.COMPLETED });
    nock(apiBase).delete(`/api/tasks/${taskId}`).reply(204);

    const created = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Write tests',
        description: 'Cover BFF',
        status: TaskStatus.PENDING,
      })
      .expect(201);

    expect(created.body.id).toBe(taskId);

    const listed = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200);
    expect(listed.body.data).toHaveLength(1);

    await request(app.getHttpServer()).get(`/api/tasks/${taskId}`).expect(200);

    const updated = await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .send({ status: TaskStatus.COMPLETED })
      .expect(200);
    expect(updated.body.status).toBe(TaskStatus.COMPLETED);

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskId}`)
      .expect(204);
  });

  it('rejects invalid create payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'ab' })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Valid title', unknownField: true })
      .expect(400);
  });

  it('returns 400 for invalid uuid', async () => {
    await request(app.getHttpServer()).get('/api/tasks/not-a-uuid').expect(400);
  });

  it('maps upstream 404 into BFF 404', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000';

    nock(apiBase).get(`/api/tasks/${unknownId}`).reply(404, {
      statusCode: 404,
      error: 'Not Found',
      message: 'Task not found',
    });

    const response = await request(app.getHttpServer())
      .get(`/api/tasks/${unknownId}`)
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      path: `/api/tasks/${unknownId}`,
    });
  });

  it('returns health ok when API is up', async () => {
    nock(apiBase).get('/api/health').reply(200, { status: 'ok' });

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      api: 'connected',
    });
  });

  it('returns health degraded when API is down', async () => {
    nock(apiBase).get('/api/health').replyWithError('connection refused');

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body).toMatchObject({
      status: 'degraded',
      api: 'disconnected',
    });
  });

  it('exposes swagger docs', async () => {
    await request(app.getHttpServer()).get('/api/docs').expect(200);
  });
});
