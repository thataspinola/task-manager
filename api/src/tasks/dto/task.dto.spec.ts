/// <reference types="jest" />

import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { CreateTaskDto } from './create-task.dto.js'
import { ListTasksQueryDto } from './list-tasks-query.dto.js'
import {
  PaginatedTasksResponseDto,
  PaginationMetaDto,
} from './paginated-tasks-response.dto.js'
import { TaskResponseDto } from './task-response.dto.js'
import { UpdateTaskDto } from './update-task.dto.js'

describe('Task DTOs', () => {
  describe('CreateTaskDto', () => {
    it('accepts a valid payload with optional fields', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Valid title',
        description: 'Optional description',
        status: TaskStatus.IN_PROGRESS,
      })

      await expect(validate(dto)).resolves.toHaveLength(0)
    })

    it('accepts a payload without optional fields', async () => {
      const dto = plainToInstance(CreateTaskDto, { title: 'Valid title' })
      await expect(validate(dto)).resolves.toHaveLength(0)
    })

    it('rejects an invalid title and status', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'ab',
        status: 'INVALID',
      })
      const errors = await validate(dto)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('UpdateTaskDto', () => {
    it('accepts partial updates', async () => {
      const dto = plainToInstance(UpdateTaskDto, { title: 'Updated title' })
      await expect(validate(dto)).resolves.toHaveLength(0)
    })

    it('accepts an empty update payload', async () => {
      const dto = plainToInstance(UpdateTaskDto, {})
      await expect(validate(dto)).resolves.toHaveLength(0)
    })
  })

  describe('ListTasksQueryDto', () => {
    it('applies default page and limit', async () => {
      const dto = plainToInstance(ListTasksQueryDto, {})
      await expect(validate(dto)).resolves.toHaveLength(0)
      expect(dto.page).toBe(1)
      expect(dto.limit).toBe(10)
    })

    it('accepts filters and transforms page/limit', async () => {
      const dto = plainToInstance(ListTasksQueryDto, {
        status: TaskStatus.PENDING,
        search: 'api',
        page: '2',
        limit: '5',
      })

      await expect(validate(dto)).resolves.toHaveLength(0)
      expect(dto.page).toBe(2)
      expect(dto.limit).toBe(5)
    })

    it('rejects invalid page, limit, status and oversized search', async () => {
      const dto = plainToInstance(ListTasksQueryDto, {
        status: 'INVALID',
        search: 'x'.repeat(121),
        page: 0,
        limit: 101,
      })
      const errors = await validate(dto)
      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('response DTOs', () => {
    it('instantiates swagger response classes', () => {
      expect(new TaskResponseDto()).toBeInstanceOf(TaskResponseDto)
      expect(new PaginationMetaDto()).toBeInstanceOf(PaginationMetaDto)
      expect(new PaginatedTasksResponseDto()).toBeInstanceOf(
        PaginatedTasksResponseDto,
      )
    })
  })
})
