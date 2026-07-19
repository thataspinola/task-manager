/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing'
import type { Task } from '../../generated/prisma/client.js'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import { TasksService } from '../services/tasks.service.js'
import { TasksController } from './tasks.controller.js'

describe('TasksController', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')
  const taskId = '11111111-1111-1111-1111-111111111111'

  const task: Task = {
    id: taskId,
    title: 'Title',
    description: null,
    status: TaskStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  }

  let service: jest.Mocked<
    Pick<TasksService, 'create' | 'findAll' | 'findOne' | 'update' | 'remove'>
  >
  let controller: TasksController

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile()

    controller = module.get(TasksController)
  })

  it('creates a task', async () => {
    const input: CreateTaskDto = { title: 'New task' }
    service.create.mockResolvedValue(task)

    await expect(controller.create(input)).resolves.toEqual(task)
    expect(service.create).toHaveBeenCalledWith(input)
  })

  it('lists tasks with query', async () => {
    const query: ListTasksQueryDto = { page: 1, limit: 10 }
    const page = {
      data: [task],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }
    service.findAll.mockResolvedValue(page)

    await expect(controller.findAll(query)).resolves.toEqual(page)
    expect(service.findAll).toHaveBeenCalledWith(query)
  })

  it('finds one task', async () => {
    service.findOne.mockResolvedValue(task)

    await expect(controller.findOne(taskId)).resolves.toEqual(task)
  })

  it('updates a task', async () => {
    const input: UpdateTaskDto = { title: 'Updated' }
    service.update.mockResolvedValue({ ...task, title: 'Updated' })

    await expect(controller.update(taskId, input)).resolves.toMatchObject({
      title: 'Updated',
    })
  })

  it('removes a task', async () => {
    service.remove.mockResolvedValue(undefined)

    await expect(controller.remove(taskId)).resolves.toBeUndefined()
  })
})
