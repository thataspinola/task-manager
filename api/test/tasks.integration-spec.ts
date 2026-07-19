import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { PrismaModule } from '../src/common/database/prisma.module.js'
import { PrismaService } from '../src/common/database/prisma.service.js'
import { TaskStatus } from '../src/generated/prisma/enums.js'
import { PrismaTasksRepository } from '../src/tasks/repositories/prisma-tasks.repository.js'
import { TASKS_REPOSITORY } from '../src/tasks/repositories/tasks.repository.interface.js'
import { TasksService } from '../src/tasks/services/tasks.service.js'

describe('TasksService + PrismaTasksRepository (integration)', () => {
  let moduleRef: TestingModule
  let service: TasksService
  let prisma: PrismaService

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
      ],
      providers: [
        TasksService,
        {
          provide: TASKS_REPOSITORY,
          useClass: PrismaTasksRepository,
        },
      ],
    }).compile()

    service = moduleRef.get(TasksService)
    prisma = moduleRef.get(PrismaService)
    await prisma.$connect()
    await prisma.task.deleteMany()
  })

  afterEach(async () => {
    await prisma.task.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await moduleRef.close()
  })

  it('persists and retrieves tasks through the service/repository stack', async () => {
    const created = await service.create({
      title: 'Integration task',
      description: 'Stored in postgres',
      status: TaskStatus.IN_PROGRESS,
    })

    const found = await service.findOne(created.id)
    expect(found).toMatchObject({
      id: created.id,
      title: 'Integration task',
      description: 'Stored in postgres',
      status: TaskStatus.IN_PROGRESS,
    })

    const updated = await service.update(created.id, {
      title: 'Updated integration task',
      status: TaskStatus.COMPLETED,
    })

    expect(updated.title).toBe('Updated integration task')
    expect(updated.status).toBe(TaskStatus.COMPLETED)

    const listed = await service.findAll({ page: 1, limit: 10 })
    expect(listed.data).toHaveLength(1)
    expect(listed.meta.total).toBe(1)

    await service.remove(created.id)
    await expect(service.findOne(created.id)).rejects.toThrow(
      `Task ${created.id} not found`,
    )
  })

  it('trims values before persisting', async () => {
    const created = await service.create({
      title: '  Trim me  ',
      description: '  spaces  ',
    })

    expect(created.title).toBe('Trim me')
    expect(created.description).toBe('spaces')
    expect(created.status).toBe(TaskStatus.PENDING)
  })
})
