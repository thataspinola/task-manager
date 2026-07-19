import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { TaskStatus } from "../types/task";

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

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSearchChange(searchInput.trim());
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;

    onStatusChange(value ? (value as TaskStatus) : undefined);
  }

  const hasFilters = Boolean(search) || status !== undefined;

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
          value={status ?? ""}
          onChange={handleStatusChange}
        >
          <option value="">Todos</option>

          <option value={TaskStatus.PENDING}>Pendente</option>

          <option value={TaskStatus.IN_PROGRESS}>Em andamento</option>

          <option value={TaskStatus.COMPLETED}>Concluída</option>
        </select>
      </div>

      <div className="filter-actions">
        <button className="button button-primary" type="submit">
          Buscar
        </button>

        <button
          className="button button-secondary"
          type="button"
          disabled={!hasFilters}
          onClick={() => {
            setSearchInput("");
            onClear();
          }}
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
