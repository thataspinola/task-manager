import { Type } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { TASK_STATUS_VALUES } from '../constants/task-status.constant.js'

export class ListTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Filtra as tarefas por status',
    enum: TASK_STATUS_VALUES,
    enumName: 'TaskStatus',
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus

  @ApiPropertyOptional({
    description: 'Busca por texto no título ou na descrição',
    example: 'NestJS',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string

  @ApiPropertyOptional({
    description: 'Número da página',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @ApiPropertyOptional({
    description: 'Quantidade de registros por página',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10
}
