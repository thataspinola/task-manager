import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller.js';
import { TasksService } from './service/tasks.service.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
