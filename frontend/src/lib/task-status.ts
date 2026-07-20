/**
 * Labels e helpers de status — fonte única (DRY) para form, filtros e cards.
 */
import { TaskStatus } from '../types/task';

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'Pendente',
  [TaskStatus.IN_PROGRESS]: 'Em andamento',
  [TaskStatus.COMPLETED]: 'Concluída',
};

export const TASK_STATUS_OPTIONS: ReadonlyArray<{
  value: TaskStatus;
  label: string;
}> = [
  { value: TaskStatus.PENDING, label: TASK_STATUS_LABELS.PENDING },
  { value: TaskStatus.IN_PROGRESS, label: TASK_STATUS_LABELS.IN_PROGRESS },
  { value: TaskStatus.COMPLETED, label: TASK_STATUS_LABELS.COMPLETED },
];

const STATUS_VALUES = new Set<string>(Object.values(TaskStatus));

/** Converte string do <select> em TaskStatus válido (ou undefined). */
export function parseTaskStatus(value: string): TaskStatus | undefined {
  if (!value || !STATUS_VALUES.has(value)) {
    return undefined;
  }

  return value as TaskStatus;
}
