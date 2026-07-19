import { ApiProperty } from '@nestjs/swagger';
import { TaskResponseDto } from './task-response.dto.js';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página atual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Quantidade máxima de registros por página',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: 'Quantidade total de registros',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Quantidade total de páginas',
    example: 3,
  })
  totalPages!: number;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
  })
  data!: TaskResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
