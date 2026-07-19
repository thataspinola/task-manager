/**
 * Critério único de “há filtros ativos” (lista + barra de filtros).
 */
import type { TaskStatus } from '../types/task';

export function hasActiveFilters(search: string, status?: TaskStatus): boolean {
  return Boolean(search) || status !== undefined;
}
