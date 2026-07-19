import { ApiProperty } from '@nestjs/swagger'
import { TaskResponseDto } from './task-response.dto.js'

export class PaginationMetaDto {
  @ApiProperty({
    example: 1,
  })
  page!: number

  @ApiProperty({
    example: 10,
  })
  limit!: number

  @ApiProperty({
    example: 25,
  })
  total!: number

  @ApiProperty({
    example: 3,
  })
  totalPages!: number
}

export class PaginatedTasksResponseDto {
  @ApiProperty({
    type: [TaskResponseDto],
  })
  data!: TaskResponseDto[]

  @ApiProperty({
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto
}
