/**
 * Card de uma tarefa: status, editar e pedir exclusão (sem HTTP).
 */
import { TaskStatusOptions } from './TaskStatusOptions';
import { TASK_STATUS_LABELS, parseTaskStatus } from '../lib/task-status';
import type { Task } from '../types/task';
import type { TaskStatus } from '../types/task';

type TaskCardProps = {
  task: Task;
  isDeleting: boolean;
  isUpdating: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
};

export function TaskCard({
  task,
  isDeleting,
  isUpdating,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const isBusy = isDeleting || isUpdating;

  return (
    <article className={`task-card task-${task.status.toLowerCase()}`}>
      <div className="task-card-header">
        <span className={`status-badge status-${task.status.toLowerCase()}`}>
          {TASK_STATUS_LABELS[task.status]}
        </span>

        <time
          dateTime={task.createdAt}
          title={new Date(task.createdAt).toLocaleString('pt-BR')}
        >
          {formatDate(task.createdAt)}
        </time>
      </div>

      <h3>{task.title}</h3>
      <p className="task-description">{task.description || 'Sem descrição.'}</p>

      <div className="task-status-control">
        <label htmlFor={`status-${task.id}`}>Alterar status</label>
        <select
          id={`status-${task.id}`}
          value={task.status}
          disabled={isBusy}
          onChange={(event) => {
            const nextStatus = parseTaskStatus(event.target.value);
            if (nextStatus) {
              onStatusChange(task, nextStatus);
            }
          }}
        >
          <TaskStatusOptions />
        </select>
      </div>

      <div className="task-card-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={isBusy}
          onClick={() => onEdit(task)}
        >
          Editar
        </button>

        <button
          className="button button-danger"
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(task)}
        >
          {isDeleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </article>
  );
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate));
}
