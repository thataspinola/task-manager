import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { Task } from '../../generated/prisma/client.js'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import { TASKS_REPOSITORY } from '../repositories/tasks.repository.interface.js'
import type {
  TasksRepository,
  UpdateTaskData,
} from '../repositories/tasks.repository.interface.js'

export type PaginatedTasks = {
  data: Task[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY)
    private readonly tasksRepository: TasksRepository,
  ) {}

  create(input: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.create({
      title: input.title.trim(),
      description: this.normalizeDescription(input.description),
      status: input.status ?? TaskStatus.PENDING,
    })
  }

  async findAll(query: ListTasksQueryDto): Promise<PaginatedTasks> {
    const { page, limit, status, search } = query
    const { items, total } = await this.tasksRepository.findMany({
      page,
      limit,
      filters: { status, search },
    })

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 0,
      },
    }
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id)

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`)
    }

    return task
  }

  async update(id: string, input: UpdateTaskDto): Promise<Task> {
    await this.findOne(id)

    const data: UpdateTaskData = {}

    if (input.title !== undefined) {
      data.title = input.title.trim()
    }

    if (input.description !== undefined) {
      data.description = this.normalizeDescription(input.description)
    }

    if (input.status !== undefined) {
      data.status = input.status
    }

    return this.tasksRepository.update(id, data)
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.tasksRepository.delete(id)
  }

  private normalizeDescription(
    description?: string,
  ): string | null | undefined {
    if (description === undefined) {
      return undefined
    }

    const normalized = description.trim()
    return normalized.length > 0 ? normalized : null
  }
}
