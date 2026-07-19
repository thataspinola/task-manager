/**
 * Thin controller + DTO pattern (entrada validada).
 * Endpoints do BFF para Tasks — delega ao proxy TasksService.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiGatewayTimeoutResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/create-task.dto.js';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js';
import { PaginatedTasksResponseDto } from '../dto/paginated-tasks-response.dto.js';
import { TaskResponseDto } from '../dto/task-response.dto.js';
import { UpdateTaskDto } from '../dto/update-task.dto.js';
import { TasksService } from '../service/tasks.service.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar uma tarefa',
  })
  @ApiCreatedResponse({
    description: 'Tarefa criada com sucesso',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados enviados são inválidos',
  })
  @ApiBadGatewayResponse({
    description: 'API interna indisponível',
  })
  @ApiGatewayTimeoutResponse({
    description: 'A API interna excedeu o tempo de resposta',
  })
  create(@Body() input: CreateTaskDto): Promise<TaskResponseDto> {
    return this.tasksService.create(input);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas',
  })
  @ApiOkResponse({
    description: 'Lista paginada de tarefas',
    type: PaginatedTasksResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de busca inválidos',
  })
  @ApiBadGatewayResponse({
    description: 'API interna indisponível',
  })
  @ApiGatewayTimeoutResponse({
    description: 'A API interna excedeu o tempo de resposta',
  })
  findAll(
    @Query() query: ListTasksQueryDto,
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar uma tarefa',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da tarefa',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Tarefa encontrada',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadGatewayResponse({
    description: 'API interna indisponível',
  })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma tarefa',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da tarefa',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Tarefa atualizada',
    type: TaskResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'UUID ou dados enviados são inválidos',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadGatewayResponse({
    description: 'API interna indisponível',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir uma tarefa',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID da tarefa',
    format: 'uuid',
  })
  @ApiNoContentResponse({
    description: 'Tarefa excluída',
  })
  @ApiBadRequestResponse({
    description: 'UUID inválido',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadGatewayResponse({
    description: 'API interna indisponível',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.tasksService.remove(id);
  }
}
