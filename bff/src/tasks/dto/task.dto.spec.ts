/// <reference types="jest" />

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto.js';
import { ListTasksQueryDto } from './list-tasks-query.dto.js';
import {
  PaginatedTasksResponseDto,
  PaginationMetaDto,
} from './paginated-tasks-response.dto.js';
import { TaskResponseDto } from './task-response.dto.js';
import { UpdateTaskDto } from './update-task.dto.js';
import { TaskStatus } from '../types/task.type.js';

describe('Task DTOs', () => {
  describe('CreateTaskDto', () => {
    it('accepts valid payloads', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'Valid title',
        description: 'Optional',
        status: TaskStatus.IN_PROGRESS,
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
    });

    it('rejects invalid title and status', async () => {
      const dto = plainToInstance(CreateTaskDto, {
        title: 'ab',
        status: 'INVALID',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateTaskDto', () => {
    it('accepts partial updates', async () => {
      const dto = plainToInstance(UpdateTaskDto, { title: 'Updated' });
      await expect(validate(dto)).resolves.toHaveLength(0);
    });
  });

  describe('ListTasksQueryDto', () => {
    it('applies defaults and transforms numbers', async () => {
      const empty = plainToInstance(ListTasksQueryDto, {});
      await expect(validate(empty)).resolves.toHaveLength(0);
      expect(empty.page).toBe(1);
      expect(empty.limit).toBe(10);

      const dto = plainToInstance(ListTasksQueryDto, {
        page: '2',
        limit: '5',
        status: TaskStatus.PENDING,
        search: 'api',
      });
      await expect(validate(dto)).resolves.toHaveLength(0);
      expect(dto.page).toBe(2);
    });

    it('rejects invalid query values', async () => {
      const dto = plainToInstance(ListTasksQueryDto, {
        page: 0,
        limit: 101,
        search: 'x'.repeat(121),
        status: 'NOPE',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('response DTOs', () => {
    it('instantiates swagger response classes', () => {
      expect(new TaskResponseDto()).toBeInstanceOf(TaskResponseDto);
      expect(new PaginationMetaDto()).toBeInstanceOf(PaginationMetaDto);
      expect(new PaginatedTasksResponseDto()).toBeInstanceOf(
        PaginatedTasksResponseDto,
      );
    });
  });
});
