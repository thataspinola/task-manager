import type { Task, TaskStatus } from '../../generated/prisma/client.js'

export type CreateTaskData = {
  title: string
  description?: string | null
  status?: TaskStatus
}

export type UpdateTaskData = {
  title?: string
  description?: string | null
  status?: TaskStatus
}

export type TaskListFilters = {
  status?: TaskStatus
  search?: string
}

export type FindManyTasksInput = {
  page: number
  limit: number
  filters: TaskListFilters
}

export type FindManyTasksResult = {
  items: Task[]
  total: number
}

export interface TasksRepository {
  create(data: CreateTaskData): Promise<Task>
  findMany(input: FindManyTasksInput): Promise<FindManyTasksResult>
  findById(id: string): Promise<Task | null>
  update(id: string, data: UpdateTaskData): Promise<Task>
  delete(id: string): Promise<void>
}

export const TASKS_REPOSITORY = Symbol('TASKS_REPOSITORY')
