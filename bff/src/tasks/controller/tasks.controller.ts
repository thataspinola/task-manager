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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTaskDto } from '../dto/create-task.dto.js';
import { ListTasksQueryDto } from '../dto/list-tasks-query.dto.js';
import { UpdateTaskDto } from '../dto/update-task.dto.js';
import { TasksService } from '../service/tasks.service.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar uma tarefa',
  })
  @ApiCreatedResponse({
    description: 'Tarefa criada',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  @ApiBadGatewayResponse({
    description: 'API indisponível',
  })
  create(@Body() input: CreateTaskDto) {
    return this.tasksService.create(input);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas',
  })
  @ApiOkResponse({
    description: 'Lista paginada de tarefas',
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros inválidos',
  })
  @ApiBadGatewayResponse({
    description: 'API indisponível',
  })
  findAll(@Query() query: ListTasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Consultar uma tarefa',
  })
  @ApiOkResponse({
    description: 'Tarefa encontrada',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadGatewayResponse({
    description: 'API indisponível',
  })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar uma tarefa',
  })
  @ApiOkResponse({
    description: 'Tarefa atualizada',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  @ApiBadGatewayResponse({
    description: 'API indisponível',
  })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() input: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, input);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Excluir uma tarefa',
  })
  @ApiNoContentResponse({
    description: 'Tarefa excluída',
  })
  @ApiNotFoundResponse({
    description: 'Tarefa não encontrada',
  })
  @ApiBadGatewayResponse({
    description: 'API indisponível',
  })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.tasksService.remove(id);
  }
}
