import { TaskStatus } from '../types/task';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
  parseTaskStatus,
} from './task-status';

describe('task-status', () => {
  it('exposes labels and options for every status', () => {
    expect(TASK_STATUS_LABELS[TaskStatus.PENDING]).toBe('Pendente');
    expect(TASK_STATUS_OPTIONS).toHaveLength(3);
  });

  it('parseTaskStatus accepts valid values and rejects others', () => {
    expect(parseTaskStatus(TaskStatus.COMPLETED)).toBe(TaskStatus.COMPLETED);
    expect(parseTaskStatus('')).toBeUndefined();
    expect(parseTaskStatus('INVALID')).toBeUndefined();
  });
});
