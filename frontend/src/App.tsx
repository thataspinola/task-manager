import { useState } from "react";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { EmptyState } from "./components/EmptyState";
import { ErrorMessage } from "./components/ErrorMessage";
import { LoadingState } from "./components/LoadingState";
import { Pagination } from "./components/Pagination";
import { TaskCard } from "./components/TaskCard";
import { TaskFilters } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "./hooks/use-tasks";
import type { CreateTaskInput, Task } from "./types/task";
import { TaskStatus } from "./types/task";

const PAGE_LIMIT = 6;

function App() {
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<TaskStatus | undefined>();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskPendingDeletion, setTaskPendingDeletion] = useState<Task | null>(
    null,
  );

  const tasksQuery = useTasks({
    page,
    limit: PAGE_LIMIT,
    search: search || undefined,
    status,
  });

  const createMutation = useCreateTask();

  const updateMutation = useUpdateTask();

  const deleteMutation = useDeleteTask();

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(input: CreateTaskInput): Promise<void> {
    if (editingTask) {
      await updateMutation.mutateAsync({
        id: editingTask.id,
        input,
      });

      setEditingTask(null);
      return;
    }

    await createMutation.mutateAsync(input);

    setPage(1);
  }

  async function handleStatusChange(
    task: Task,
    nextStatus: TaskStatus,
  ): Promise<void> {
    if (task.status === nextStatus) {
      return;
    }

    await updateMutation.mutateAsync({
      id: task.id,
      input: {
        status: nextStatus,
      },
    });
  }

  async function handleDelete(): Promise<void> {
    if (!taskPendingDeletion) {
      return;
    }

    await deleteMutation.mutateAsync(taskPendingDeletion.id);

    if (editingTask?.id === taskPendingDeletion.id) {
      setEditingTask(null);
    }

    setTaskPendingDeletion(null);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value?: TaskStatus) {
    setStatus(value);
    setPage(1);
  }

  function handleClearFilters() {
    setSearch("");
    setStatus(undefined);
    setPage(1);
  }

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  const tasks = tasksQuery.data?.data ?? [];

  const meta = tasksQuery.data?.meta;

  const hasFilters = Boolean(search) || status !== undefined;

  return (
    <>
      <header className="app-header">
        <div className="app-header-content">
          <div>
            <span className="eyebrow">Task Manager</span>

            <h1>Organize seu trabalho</h1>

            <p>Frontend React integrado ao NestJS BFF.</p>
          </div>

          <div className="header-summary">
            <span>Total</span>

            <strong>{meta?.total ?? 0}</strong>

            <small>tarefas encontradas</small>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <TaskForm
          task={editingTask}
          isSubmitting={isFormSubmitting}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingTask(null)}
        />

        <section className="tasks-section">
          <div className="section-header">
            <div>
              <span className="eyebrow">Visão geral</span>

              <h2>Suas tarefas</h2>
            </div>
          </div>

          <TaskFilters
            search={search}
            status={status}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusFilterChange}
            onClear={handleClearFilters}
          />

          {mutationError && <ErrorMessage error={mutationError} />}

          {tasksQuery.isError && (
            <ErrorMessage
              error={tasksQuery.error}
              title="Não foi possível carregar as tarefas"
            />
          )}

          {tasksQuery.isLoading ? (
            <LoadingState />
          ) : tasks.length === 0 ? (
            <EmptyState hasFilters={hasFilters} />
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isDeleting={
                    deleteMutation.isPending &&
                    taskPendingDeletion?.id === task.id
                  }
                  isUpdating={updateMutation.isPending}
                  onEdit={(selectedTask) => {
                    setEditingTask(selectedTask);

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  onDelete={setTaskPendingDeletion}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {meta && (
            <Pagination
              meta={meta}
              disabled={tasksQuery.isFetching}
              onPageChange={setPage}
            />
          )}
        </section>
      </main>

      <ConfirmDialog
        open={taskPendingDeletion !== null}
        title="Excluir tarefa"
        message={
          taskPendingDeletion
            ? `Deseja excluir a tarefa “${taskPendingDeletion.title}”? Esta ação não poderá ser desfeita.`
            : ""
        }
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          void handleDelete();
        }}
        onCancel={() => setTaskPendingDeletion(null)}
      />
    </>
  );
}

export default App;
