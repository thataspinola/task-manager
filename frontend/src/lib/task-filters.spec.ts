import { TaskStatus } from '../types/task';
import { hasActiveFilters } from './task-filters';

describe('hasActiveFilters', () => {
  it('detects search and status filters', () => {
    expect(hasActiveFilters('', undefined)).toBe(false);
    expect(hasActiveFilters('abc', undefined)).toBe(true);
    expect(hasActiveFilters('', TaskStatus.PENDING)).toBe(true);
  });
});
