/**
 * Barra de filtros: busca no submit, status imediato, limpar no App.
 */
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { TaskStatusOptions } from './TaskStatusOptions';
import { hasActiveFilters } from '../lib/task-filters';
import { parseTaskStatus } from '../lib/task-status';
import type { TaskStatus } from '../types/task';

type TaskFiltersProps = {
  search: string;
  status?: TaskStatus;
  onSearchChange: (search: string) => void;
  onStatusChange: (status?: TaskStatus) => void;
  onClear: () => void;
};

export function TaskFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: TaskFiltersProps) {
  const [searchInput, setSearchInput] = useState(search);
  const [syncedSearch, setSyncedSearch] = useState(search);

  if (search !== syncedSearch) {
    setSyncedSearch(search);
    setSearchInput(search);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchChange(searchInput.trim());
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    onStatusChange(parseTaskStatus(event.target.value));
  }

  const filtersActive = hasActiveFilters(search, status);

  return (
    <form className="filters" onSubmit={handleSubmit}>
      <div className="field field-grow">
        <label htmlFor="task-search">Buscar</label>
        <input
          id="task-search"
          value={searchInput}
          placeholder="Título ou descrição"
          onChange={(event) => setSearchInput(event.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={status ?? ''}
          onChange={handleStatusChange}
        >
          <TaskStatusOptions includeAll />
        </select>
      </div>

      <div className="filter-actions">
        <button className="button button-primary" type="submit">
          Buscar
        </button>

        <button
          className="button button-secondary"
          type="button"
          disabled={!filtersActive}
          onClick={() => {
            setSearchInput('');
            onClear();
          }}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
