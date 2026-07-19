/// <reference types="jest" />

import { HttpService } from '@nestjs/axios';
import { BadGatewayException, GatewayTimeoutException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { PaginatedTasks, Task, TaskStatus } from '../types/task.type.js';
import { TasksService } from './tasks.service.js';

describe('TasksService', () => {
  let service: TasksService;

  const taskId = '9b68b301-4203-43cd-af73-9fc499804be7';

  const task: Task = {
    id: taskId,
    title: 'Criar frontend React',
    description: 'Criar tela principal',
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
  };

  const httpServiceMock = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: HttpService,
          useValue: httpServiceMock,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      httpServiceMock.post.mockReturnValue(
        of({
          data: task,
          status: 201,
          statusText: 'Created',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
        }),
      );

      const input = {
        title: 'Criar frontend React',
        description: 'Criar tela principal',
        status: TaskStatus.PENDING,
      };

      const result = await service.create(input);

      expect(httpServiceMock.post).toHaveBeenCalledWith('/tasks', input);

      expect(result).toEqual(task);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const response: PaginatedTasks = {
        data: [task],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      httpServiceMock.get.mockReturnValue(
        of({
          data: response,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
        }),
      );

      const query = {
        page: 1,
        limit: 10,
      };

      const result = await service.findAll(query);

      expect(httpServiceMock.get).toHaveBeenCalledWith('/tasks', {
        params: query,
      });

      expect(result).toEqual(response);
    });
  });

  describe('findOne', () => {
    it('should return a task', async () => {
      httpServiceMock.get.mockReturnValue(
        of({
          data: task,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
        }),
      );

      const result = await service.findOne(taskId);

      expect(httpServiceMock.get).toHaveBeenCalledWith(`/tasks/${taskId}`);

      expect(result).toEqual(task);
    });

    it('should propagate a 404 error', async () => {
      const error = createAxiosError({
        statusCode: 404,
        code: 'ERR_BAD_REQUEST',
        data: {
          statusCode: 404,
          error: 'Not Found',
          message: 'Task not found',
        },
      });

      httpServiceMock.get.mockReturnValue(throwError(() => error));

      await expect(service.findOne(taskId)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updatedTask: Task = {
        ...task,
        status: TaskStatus.COMPLETED,
      };

      httpServiceMock.patch.mockReturnValue(
        of({
          data: updatedTask,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
        }),
      );

      const input = {
        status: TaskStatus.COMPLETED,
      };

      const result = await service.update(taskId, input);

      expect(httpServiceMock.patch).toHaveBeenCalledWith(
        `/tasks/${taskId}`,
        input,
      );

      expect(result).toEqual(updatedTask);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      httpServiceMock.delete.mockReturnValue(
        of({
          data: undefined,
          status: 204,
          statusText: 'No Content',
          headers: {},
          config: {
            headers: new AxiosHeaders(),
          },
        }),
      );

      await service.remove(taskId);

      expect(httpServiceMock.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    });
  });

  describe('communication errors', () => {
    it('should throw BadGatewayException when API is unavailable', async () => {
      const error = createAxiosError({
        code: 'ECONNREFUSED',
      });

      httpServiceMock.get.mockReturnValue(throwError(() => error));

      await expect(
        service.findAll({
          page: 1,
          limit: 10,
        }),
      ).rejects.toBeInstanceOf(BadGatewayException);
    });

    it('should throw GatewayTimeoutException on timeout', async () => {
      const error = createAxiosError({
        code: 'ECONNABORTED',
      });

      httpServiceMock.get.mockReturnValue(throwError(() => error));

      await expect(
        service.findAll({
          page: 1,
          limit: 10,
        }),
      ).rejects.toBeInstanceOf(GatewayTimeoutException);
    });

    it('propagates API errors on create, update and remove', async () => {
      const error = createAxiosError({
        statusCode: 502,
        code: 'ERR_BAD_RESPONSE',
        data: { message: 'upstream' },
      });

      httpServiceMock.post.mockReturnValue(throwError(() => error));
      httpServiceMock.patch.mockReturnValue(throwError(() => error));
      httpServiceMock.delete.mockReturnValue(throwError(() => error));

      await expect(
        service.create({ title: 'Task title' }),
      ).rejects.toMatchObject({ status: 502 });
      await expect(
        service.update(taskId, { title: 'Updated' }),
      ).rejects.toMatchObject({ status: 502 });
      await expect(service.remove(taskId)).rejects.toMatchObject({
        status: 502,
      });
    });
  });
});

type CreateAxiosErrorOptions = {
  statusCode?: number;
  code?: string;
  data?: {
    statusCode?: number;
    error?: string;
    message?: string | string[];
  };
};

function createAxiosError(options: CreateAxiosErrorOptions): AxiosError {
  const config = {
    headers: new AxiosHeaders(),
  };

  const response =
    options.statusCode !== undefined
      ? {
          data: options.data ?? {},
          status: options.statusCode,
          statusText: options.statusCode === 404 ? 'Not Found' : 'Error',
          headers: {},
          config,
        }
      : undefined;

  return new AxiosError(
    'Request failed',
    options.code,
    config,
    undefined,
    response,
  );
}
