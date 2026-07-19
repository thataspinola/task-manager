/**
 * Proxy / Gateway pattern: encaminha CRUD de Tasks para a API interna.
 * Sem regras de domínio — só transporte HTTP + throwApiError.
 */
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { throwApiError } from '../../http/api-error.util.js';
import { CreateTaskDto } from '../dto/create-task.dto.js';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js';
import { UpdateTaskDto } from '../dto/update-task.dto.js';
import { PaginatedTasks, Task } from '../types/task.type.js';

@Injectable()
export class TasksService {
  constructor(private readonly httpService: HttpService) {}

  async create(input: CreateTaskDto): Promise<Task> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Task>('/tasks', input),
      );
      return response.data;
    } catch (error: unknown) {
      throwApiError(error);
    }
  }

  async findAll(query: ListTasksQueryDto): Promise<PaginatedTasks> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedTasks>('/tasks', {
          params: query,
        }),
      );
      return response.data;
    } catch (error: unknown) {
      throwApiError(error);
    }
  }

  async findOne(id: string): Promise<Task> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Task>(`/tasks/${id}`),
      );
      return response.data;
    } catch (error: unknown) {
      throwApiError(error);
    }
  }

  async update(id: string, input: UpdateTaskDto): Promise<Task> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<Task>(`/tasks/${id}`, input),
      );
      return response.data;
    } catch (error: unknown) {
      throwApiError(error);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await firstValueFrom(this.httpService.delete(`/tasks/${id}`));
    } catch (error: unknown) {
      throwApiError(error);
    }
  }
}
