/**
 * Opções de <select> de status (com ou sem “Todos”).
 */
import { TASK_STATUS_OPTIONS } from '../lib/task-status';

type TaskStatusOptionsProps = {
  includeAll?: boolean;
};

export function TaskStatusOptions({
  includeAll = false,
}: TaskStatusOptionsProps) {
  return (
    <>
      {includeAll ? <option value="">Todos</option> : null}

      {TASK_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </>
  );
}
