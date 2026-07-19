import { Module } from '@nestjs/common'
import { TasksController } from './controller/tasks.controller.js'
import { PrismaTasksRepository } from './repositories/prisma-tasks.repository.js'
import { TASKS_REPOSITORY } from './repositories/tasks.repository.interface.js'
import { TasksService } from './services/tasks.service.js'

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASKS_REPOSITORY,
      useClass: PrismaTasksRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
