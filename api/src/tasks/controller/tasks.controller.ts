import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CreateTaskDto } from '../dto/create-task.dto.js'
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js'
import { UpdateTaskDto } from '../dto/update-task.dto.js'
import { TasksService } from '../services/tasks.service.js'
import type { PaginatedTasks } from '../services/tasks.service.js'
import type { Task } from '../../generated/prisma/client.js'

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TasksService)
    private readonly tasksService: TasksService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() input: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(input)
  }

  @Get()
  findAll(@Query() query: ListTasksQueryDto): Promise<PaginatedTasks> {
    return this.tasksService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Task> {
    return this.tasksService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, input)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.tasksService.remove(id)
  }
}

