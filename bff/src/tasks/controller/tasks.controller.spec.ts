/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller.js';
import { TasksService } from '../service/tasks.service.js';
import { PaginatedTasks, Task, TaskStatus } from '../types/task.type.js';

describe('TasksController', () => {
  let controller: TasksController;

  const taskId = '9b68b301-4203-43cd-af73-9fc499804be7';

  const task: Task = {
    id: taskId,
    title: 'Criar frontend React',
    description: 'Criar tela principal',
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
  };

  const tasksServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],

      providers: [
        {
          provide: TasksService,
          useValue: tasksServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const input = {
      title: 'Criar frontend React',
      description: 'Criar tela principal',
      status: TaskStatus.PENDING,
    };

    tasksServiceMock.create.mockResolvedValue(task);

    const result = await controller.create(input);

    expect(tasksServiceMock.create).toHaveBeenCalledWith(input);

    expect(result).toEqual(task);
  });

  it('should list tasks', async () => {
    const response: PaginatedTasks = {
      data: [task],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    const query = {
      page: 1,
      limit: 10,
    };

    tasksServiceMock.findAll.mockResolvedValue(response);

    const result = await controller.findAll(query);

    expect(tasksServiceMock.findAll).toHaveBeenCalledWith(query);

    expect(result).toEqual(response);
  });

  it('should find one task', async () => {
    tasksServiceMock.findOne.mockResolvedValue(task);

    const result = await controller.findOne(taskId);

    expect(tasksServiceMock.findOne).toHaveBeenCalledWith(taskId);

    expect(result).toEqual(task);
  });

  it('should update a task', async () => {
    const input = {
      status: TaskStatus.COMPLETED,
    };

    const updatedTask: Task = {
      ...task,
      status: TaskStatus.COMPLETED,
    };

    tasksServiceMock.update.mockResolvedValue(updatedTask);

    const result = await controller.update(taskId, input);

    expect(tasksServiceMock.update).toHaveBeenCalledWith(taskId, input);

    expect(result).toEqual(updatedTask);
  });

  it('should remove a task', async () => {
    tasksServiceMock.remove.mockResolvedValue(undefined);

    await controller.remove(taskId);

    expect(tasksServiceMock.remove).toHaveBeenCalledWith(taskId);
  });
});
