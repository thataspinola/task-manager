/// <reference types="jest" />

import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import type { Task } from '../../generated/prisma/client.js'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import {
  TASKS_REPOSITORY,
  type TasksRepository,
} from '../repositories/tasks.repository.interface.js'
import { TasksService } from './tasks.service.js'

describe('TasksService', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')

  const task: Task = {
    id: 'task-1',
    title: 'Title',
    description: 'Description',
    status: TaskStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  }

  let repository: jest.Mocked<TasksRepository>
  let service: TasksService

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TASKS_REPOSITORY, useValue: repository },
      ],
    }).compile()

    service = module.get(TasksService)
  })

  describe('create', () => {
    it('trims fields and delegates to the repository', async () => {
      const input: CreateTaskDto = {
        title: '  New task  ',
        description: '  details  ',
        status: TaskStatus.IN_PROGRESS,
      }
      repository.create.mockResolvedValue(task)

      await expect(service.create(input)).resolves.toEqual(task)
      expect(repository.create).toHaveBeenCalledWith({
        title: 'New task',
        description: 'details',
        status: TaskStatus.IN_PROGRESS,
      })
    })

    it('defaults status and allows omitted description', async () => {
      repository.create.mockResolvedValue(task)

      await service.create({ title: 'Task' })

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Task',
        description: undefined,
        status: TaskStatus.PENDING,
      })
    })

    it('clears blank description on create', async () => {
      repository.create.mockResolvedValue(task)

      await service.create({ title: 'Task', description: '   ' })

      expect(repository.create).toHaveBeenCalledWith({
        title: 'Task',
        description: null,
        status: TaskStatus.PENDING,
      })
    })
  })

  describe('findAll', () => {
    it('returns paginated tasks from the repository', async () => {
      repository.findMany.mockResolvedValue({ items: [task], total: 1 })

      await expect(service.findAll({ page: 1, limit: 10 })).resolves.toEqual({
        data: [task],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      })

      expect(repository.findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        filters: { status: undefined, search: undefined },
      })
    })

    it('returns zero totalPages when there are no items', async () => {
      repository.findMany.mockResolvedValue({ items: [], total: 0 })

      await expect(
        service.findAll({ page: 1, limit: 10, status: TaskStatus.PENDING }),
      ).resolves.toMatchObject({
        meta: { total: 0, totalPages: 0 },
      })
    })
  })

  describe('findOne', () => {
    it('returns a task when it exists', async () => {
      repository.findById.mockResolvedValue(task)

      await expect(service.findOne('task-1')).resolves.toEqual(task)
    })

    it('throws NotFoundException when the task does not exist', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('updates only provided fields after ensuring the task exists', async () => {
      const updated = { ...task, title: 'Updated' }
      repository.findById.mockResolvedValue(task)
      repository.update.mockResolvedValue(updated)

      const input: UpdateTaskDto = {
        title: '  Updated  ',
        description: '  new desc  ',
        status: TaskStatus.COMPLETED,
      }

      await expect(service.update('task-1', input)).resolves.toEqual(updated)
      expect(repository.update).toHaveBeenCalledWith('task-1', {
        title: 'Updated',
        description: 'new desc',
        status: TaskStatus.COMPLETED,
      })
    })

    it('sends an empty payload when no fields are provided', async () => {
      repository.findById.mockResolvedValue(task)
      repository.update.mockResolvedValue(task)

      await service.update('task-1', {})

      expect(repository.update).toHaveBeenCalledWith('task-1', {})
    })

    it('clears blank description on update', async () => {
      repository.findById.mockResolvedValue(task)
      repository.update.mockResolvedValue({ ...task, description: null })

      await service.update('task-1', { description: '   ' })

      expect(repository.update).toHaveBeenCalledWith('task-1', {
        description: null,
      })
    })

    it('throws when updating a missing task', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(
        service.update('missing', { title: 'Nope' }),
      ).rejects.toBeInstanceOf(NotFoundException)
      expect(repository.update).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('deletes an existing task', async () => {
      repository.findById.mockResolvedValue(task)
      repository.delete.mockResolvedValue(undefined)

      await expect(service.remove('task-1')).resolves.toBeUndefined()
      expect(repository.delete).toHaveBeenCalledWith('task-1')
    })

    it('throws when deleting a missing task', async () => {
      repository.findById.mockResolvedValue(null)

      await expect(service.remove('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      )
      expect(repository.delete).not.toHaveBeenCalled()
    })
  })
})
