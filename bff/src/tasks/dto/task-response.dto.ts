import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../types/task.type.js';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Identificador único da tarefa',
    example: '9b68b301-4203-43cd-af73-9fc499804be7',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Criar frontend React',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Descrição da tarefa',
    example: 'Criar a tela principal do gerenciador',
    nullable: true,
  })
  description!: string | null;

  @ApiProperty({
    description: 'Status atual da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  status!: TaskStatus;

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-07-18T20:00:00.000Z',
    format: 'date-time',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-07-18T20:30:00.000Z',
    format: 'date-time',
  })
  updatedAt!: string;
}
