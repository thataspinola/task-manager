/**
 * Adaptador Prisma do contrato TasksRepository.
 * Toda query SQL/ORM de tasks fica concentrada aqui.
 */
import { Injectable } from '@nestjs/common'
import type { Prisma, Task } from '../../generated/prisma/client.js'
import { PrismaService } from '../../common/database/prisma.service.js'
import type {
  CreateTaskData,
  FindManyTasksInput,
  FindManyTasksResult,
  TasksRepository,
  UpdateTaskData,
} from './tasks.repository.interface.js'

@Injectable()
export class PrismaTasksRepository implements TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTaskData): Promise<Task> {
    return this.prisma.task.create({ data })
  }

  async findMany(input: FindManyTasksInput): Promise<FindManyTasksResult> {
    const { page, limit, filters } = input
    const where = this.buildWhere(filters)

    // Lista + total na mesma transação para meta de paginação consistente
    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.task.count({ where }),
    ])

    return { items, total }
  }

  findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({ where: { id } })
  }

  update(id: string, data: UpdateTaskData): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } })
  }

  private buildWhere(
    filters: FindManyTasksInput['filters'],
  ): Prisma.TaskWhereInput {
    const search = filters.search?.trim()

    return {
      ...(filters.status ? { status: filters.status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
  }
}
