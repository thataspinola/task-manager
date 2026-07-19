/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing'
import type { Task } from '../../generated/prisma/client.js'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { PrismaService } from '../../common/database/prisma.service.js'
import { PrismaTasksRepository } from './prisma-tasks.repository.js'

describe('PrismaTasksRepository', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')

  const task: Task = {
    id: 'task-1',
    title: 'Title',
    description: 'Description',
    status: TaskStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  }

  let prisma: {
    task: {
      create: jest.Mock
      findMany: jest.Mock
      findUnique: jest.Mock
      update: jest.Mock
      delete: jest.Mock
      count: jest.Mock
    }
    $transaction: jest.Mock
  }
  let repository: PrismaTasksRepository

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTasksRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile()

    repository = module.get(PrismaTasksRepository)
  })

  it('creates a task', async () => {
    prisma.task.create.mockResolvedValue(task)

    await expect(
      repository.create({
        title: 'Title',
        description: 'Description',
        status: TaskStatus.PENDING,
      }),
    ).resolves.toEqual(task)
  })

  it('lists tasks with filters and pagination', async () => {
    prisma.$transaction.mockResolvedValue([[task], 1])

    await expect(
      repository.findMany({
        page: 2,
        limit: 5,
        filters: { status: TaskStatus.PENDING, search: ' Title ' },
      }),
    ).resolves.toEqual({ items: [task], total: 1 })

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {
        status: TaskStatus.PENDING,
        OR: [
          { title: { contains: 'Title', mode: 'insensitive' } },
          { description: { contains: 'Title', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      skip: 5,
      take: 5,
    })
  })

  it('lists tasks without filters', async () => {
    prisma.$transaction.mockResolvedValue([[], 0])

    await repository.findMany({
      page: 1,
      limit: 10,
      filters: {},
    })

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
    })
  })

  it('finds a task by id', async () => {
    prisma.task.findUnique.mockResolvedValue(task)

    await expect(repository.findById('task-1')).resolves.toEqual(task)
  })

  it('updates a task', async () => {
    prisma.task.update.mockResolvedValue(task)

    await expect(
      repository.update('task-1', { title: 'Updated' }),
    ).resolves.toEqual(task)
  })

  it('deletes a task', async () => {
    prisma.task.delete.mockResolvedValue(task)

    await expect(repository.delete('task-1')).resolves.toBeUndefined()
  })
})
