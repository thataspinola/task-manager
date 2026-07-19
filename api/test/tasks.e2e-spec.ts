import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module.js'
import { configureApp } from '../src/bootstrap/create-app.js'
import { PrismaService } from '../src/common/database/prisma.service.js'
import { TaskStatus } from '../src/generated/prisma/enums.js'

describe('Tasks API (e2e)', () => {
  let app: INestApplication<App>
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = configureApp(moduleFixture.createNestApplication())
    await app.init()

    prisma = app.get(PrismaService)
    await prisma.task.deleteMany()
  })

  afterEach(async () => {
    await prisma.task.deleteMany()
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates, lists, reads, updates and deletes a task (functional flow)', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/tasks')
      .send({
        title: 'Write tests',
        description: 'Cover the tasks module',
        status: TaskStatus.PENDING,
      })
      .expect(201)

    expect(createResponse.body).toMatchObject({
      title: 'Write tests',
      description: 'Cover the tasks module',
      status: TaskStatus.PENDING,
    })

    const taskId = createResponse.body.id as string

    const listResponse = await request(app.getHttpServer())
      .get('/api/tasks')
      .expect(200)

    expect(listResponse.body.data).toHaveLength(1)
    expect(listResponse.body.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
    expect(listResponse.body.data[0].id).toBe(taskId)

    await request(app.getHttpServer()).get(`/api/tasks/${taskId}`).expect(200)

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/tasks/${taskId}`)
      .send({
        title: 'Write better tests',
        status: TaskStatus.COMPLETED,
      })
      .expect(200)

    expect(updateResponse.body).toMatchObject({
      id: taskId,
      title: 'Write better tests',
      status: TaskStatus.COMPLETED,
    })

    await request(app.getHttpServer())
      .delete(`/api/tasks/${taskId}`)
      .expect(204)

    await request(app.getHttpServer()).get(`/api/tasks/${taskId}`).expect(404)
  })

  it('rejects invalid create payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'ab' })
      .expect(400)

    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Valid title', unknownField: true })
      .expect(400)
  })

  it('returns 404 for unknown task ids', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000'

    await request(app.getHttpServer()).get(`/api/tasks/${unknownId}`).expect(404)
    await request(app.getHttpServer())
      .patch(`/api/tasks/${unknownId}`)
      .send({ title: 'Nope' })
      .expect(404)
    await request(app.getHttpServer())
      .delete(`/api/tasks/${unknownId}`)
      .expect(404)
  })

  it('returns 400 for invalid uuid ids', async () => {
    await request(app.getHttpServer()).get('/api/tasks/not-a-uuid').expect(400)
    await request(app.getHttpServer())
      .patch('/api/tasks/not-a-uuid')
      .send({ title: 'Nope' })
      .expect(400)
    await request(app.getHttpServer())
      .delete('/api/tasks/not-a-uuid')
      .expect(400)
  })

  it('filters tasks by status and search', async () => {
    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Alpha task', status: TaskStatus.PENDING })
      .expect(201)

    await request(app.getHttpServer())
      .post('/api/tasks')
      .send({ title: 'Beta done', status: TaskStatus.COMPLETED })
      .expect(201)

    const response = await request(app.getHttpServer())
      .get('/api/tasks')
      .query({ status: TaskStatus.PENDING, search: 'Alpha' })
      .expect(200)

    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].title).toBe('Alpha task')
  })
})
