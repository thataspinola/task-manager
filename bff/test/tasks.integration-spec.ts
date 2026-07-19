import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { HttpClientModule } from '../src/http/http-client.module.js';
import { TasksService } from '../src/tasks/service/tasks.service.js';
import { TaskStatus } from '../src/tasks/types/task.type.js';

describe('TasksService + HttpClient (integration)', () => {
  let moduleRef: TestingModule;
  let service: TasksService;
  const apiBase = 'http://localhost:3001';

  beforeAll(async () => {
    process.env.API_BASE_URL = `${apiBase}/api`;
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    process.env.HTTP_TIMEOUT = '2000';

    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HttpClientModule,
      ],
      providers: [TasksService],
    }).compile();

    service = moduleRef.get(TasksService);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await moduleRef.close();
    nock.restore();
  });

  it('persists flow through real HttpService against mocked API', async () => {
    const taskId = '9b68b301-4203-43cd-af73-9fc499804be7';
    const task = {
      id: taskId,
      title: 'Integration task',
      description: 'via http',
      status: TaskStatus.IN_PROGRESS,
      createdAt: '2026-07-18T20:00:00.000Z',
      updatedAt: '2026-07-18T20:00:00.000Z',
    };

    nock(apiBase).post('/api/tasks').reply(201, task);
    nock(apiBase).get(`/api/tasks/${taskId}`).reply(200, task);
    nock(apiBase)
      .get('/api/tasks')
      .query(true)
      .reply(200, {
        data: [task],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
    nock(apiBase).delete(`/api/tasks/${taskId}`).reply(204);

    const created = await service.create({
      title: 'Integration task',
      description: 'via http',
      status: TaskStatus.IN_PROGRESS,
    });
    expect(created.id).toBe(taskId);

    const found = await service.findOne(taskId);
    expect(found.title).toBe('Integration task');

    const listed = await service.findAll({ page: 1, limit: 10 });
    expect(listed.meta.total).toBe(1);

    await service.remove(taskId);
  });

  it('maps upstream errors through throwApiError', async () => {
    nock(apiBase).get('/api/tasks/missing').reply(404, {
      statusCode: 404,
      message: 'Task not found',
    });

    await expect(service.findOne('missing')).rejects.toMatchObject({
      status: 404,
    });
  });
});
