import { TaskStatus } from '../../generated/prisma/enums.js'
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TASK_STATUS_VALUES } from '../constants/task-status.constant.js'

export class CreateTaskDto {
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Finalizar API NestJS',
    minLength: 3,
    maxLength: 120,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string

  @ApiPropertyOptional({
    description: 'Descrição detalhada da tarefa',
    example: 'Adicionar Swagger e tratamento global de erros',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({
    description: 'Situação atual da tarefa',
    enum: TASK_STATUS_VALUES,
    enumName: 'TaskStatus',
    default: TaskStatus.PENDING,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus
}
