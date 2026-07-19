/** Feature Module: Tasks — controller + Proxy service da API. */
import { Module } from '@nestjs/common';
import { TasksController } from './controller/tasks.controller.js';
import { TasksService } from './service/tasks.service.js';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
