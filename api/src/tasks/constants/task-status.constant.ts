import { TaskStatus } from '../../generated/prisma/enums.js'

export const TASK_STATUS_VALUES = [
  TaskStatus.PENDING,
  TaskStatus.IN_PROGRESS,
  TaskStatus.COMPLETED,
]
