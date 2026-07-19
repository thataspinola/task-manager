import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskStatus } from '../../generated/prisma/enums.js'
import { TASK_STATUS_VALUES } from '../constants/task-status.constant.js'

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único da tarefa',
    example: '9b68b301-4203-43cd-af73-9fc499804be7',
    format: 'uuid',
  })
  id!: string

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Finalizar API NestJS',
  })
  title!: string

  @ApiPropertyOptional({
    description: 'Descrição da tarefa',
    example: 'Adicionar documentação Swagger',
    nullable: true,
  })
  description!: string | null

  @ApiProperty({
    description: 'Status atual da tarefa',
    enum: TASK_STATUS_VALUES,
    enumName: 'TaskStatus',
    example: TaskStatus.IN_PROGRESS,
  })
  status!: TaskStatus

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-07-18T20:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-07-18T20:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: Date
}
