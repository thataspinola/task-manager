import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module.js'
import { configureApp } from '../src/bootstrap/create-app.js'
import { PrismaService } from '../src/common/database/prisma.service.js'
import { TaskStatus } from '../src/generated/prisma/enums.js'

type SuperTestServer = Parameters<typeof request>[0]

type TaskBody = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
}

type PaginatedBody = {
  data: TaskBody[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

describe('Tasks API (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService

  const server = (): SuperTestServer => app.getHttpServer() as SuperTestServer

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
    const createResponse = await request(server())
      .post('/api/tasks')
      .send({
        title: 'Write tests',
        description: 'Cover the tasks module',
        status: TaskStatus.PENDING,
      })
      .expect(201)

    const created = createResponse.body as TaskBody

    expect(created).toMatchObject({
      title: 'Write tests',
      description: 'Cover the tasks module',
      status: TaskStatus.PENDING,
    })

    const taskId = created.id

    const listResponse = await request(server()).get('/api/tasks').expect(200)
    const listed = listResponse.body as PaginatedBody

    expect(listed.data).toHaveLength(1)
    expect(listed.meta).toMatchObject({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
    expect(listed.data[0].id).toBe(taskId)

    await request(server()).get(`/api/tasks/${taskId}`).expect(200)

    const updateResponse = await request(server())
      .patch(`/api/tasks/${taskId}`)
      .send({
        title: 'Write better tests',
        status: TaskStatus.COMPLETED,
      })
      .expect(200)

    expect(updateResponse.body as TaskBody).toMatchObject({
      id: taskId,
      title: 'Write better tests',
      status: TaskStatus.COMPLETED,
    })

    await request(server()).delete(`/api/tasks/${taskId}`).expect(204)

    const missing = await request(server())
      .get(`/api/tasks/${taskId}`)
      .expect(404)

    expect(missing.body).toMatchObject({
      statusCode: 404,
      path: `/api/tasks/${taskId}`,
      method: 'GET',
    })
  })

  it('rejects invalid create payloads', async () => {
    const shortTitle = await request(server())
      .post('/api/tasks')
      .send({ title: 'ab' })
      .expect(400)

    expect(shortTitle.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
      path: '/api/tasks',
      method: 'POST',
    })

    await request(server())
      .post('/api/tasks')
      .send({ title: 'Valid title', unknownField: true })
      .expect(400)
  })

  it('returns 404 for unknown task ids', async () => {
    const unknownId = '00000000-0000-0000-0000-000000000000'

    await request(server()).get(`/api/tasks/${unknownId}`).expect(404)
    await request(server())
      .patch(`/api/tasks/${unknownId}`)
      .send({ title: 'Nope' })
      .expect(404)
    await request(server()).delete(`/api/tasks/${unknownId}`).expect(404)
  })

  it('returns 400 for invalid uuid ids', async () => {
    await request(server()).get('/api/tasks/not-a-uuid').expect(400)
    await request(server())
      .patch('/api/tasks/not-a-uuid')
      .send({ title: 'Nope' })
      .expect(400)
    await request(server()).delete('/api/tasks/not-a-uuid').expect(400)
  })

  it('filters tasks by status and search', async () => {
    await request(server())
      .post('/api/tasks')
      .send({ title: 'Alpha task', status: TaskStatus.PENDING })
      .expect(201)

    await request(server())
      .post('/api/tasks')
      .send({ title: 'Beta done', status: TaskStatus.COMPLETED })
      .expect(201)

    const response = await request(server())
      .get('/api/tasks')
      .query({ status: TaskStatus.PENDING, search: 'Alpha' })
      .expect(200)

    const body = response.body as PaginatedBody
    expect(body.data).toHaveLength(1)
    expect(body.data[0].title).toBe('Alpha task')
  })

  it('returns health ok when database is available', async () => {
    const response = await request(server()).get('/api/health').expect(200)

    expect(response.body).toMatchObject({
      status: 'ok',
      database: 'connected',
    })
  })

  it('exposes swagger docs', async () => {
    await request(server()).get('/api/docs').expect(200)
  })
})
