/**
 * Orquestra estado da tela de tarefas (SRP): UI state + hooks + handlers.
 * O `App` só compõe o layout a partir deste hook.
 */
import { useState } from 'react';
import { confirmTaskDeletion } from '../lib/confirm-task-deletion';
import { hasActiveFilters } from '../lib/task-filters';
import type { CreateTaskInput, Task } from '../types/task';
import type { TaskStatus } from '../types/task';
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from './use-tasks';

const PAGE_LIMIT = 6;

export function useTaskBoard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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

  async function submitTask(input: CreateTaskInput): Promise<void> {
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

  async function changeTaskStatus(
    task: Task,
    nextStatus: TaskStatus,
  ): Promise<void> {
    if (task.status === nextStatus) {
      return;
    }

    await updateMutation.mutateAsync({
      id: task.id,
      input: { status: nextStatus },
    });
  }

  async function confirmDelete(): Promise<void> {
    const result = await confirmTaskDeletion({
      taskPendingDeletion,
      editingTask,
      deleteTask: (id) => deleteMutation.mutateAsync(id),
    });

    setEditingTask(result.editingTask);
    setTaskPendingDeletion(null);
  }

  function applySearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function applyStatusFilter(value?: TaskStatus) {
    setStatus(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setStatus(undefined);
    setPage(1);
  }

  function startEdit(task: Task) {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingTask(null);
  }

  function requestDelete(task: Task) {
    setTaskPendingDeletion(task);
  }

  function cancelDelete() {
    setTaskPendingDeletion(null);
  }

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  const tasks = tasksQuery.data?.data ?? [];
  const meta = tasksQuery.data?.meta;
  const updatingTaskId = updateMutation.isPending
    ? (updateMutation.variables?.id ?? null)
    : null;

  return {
    search,
    status,
    editingTask,
    taskPendingDeletion,
    tasksQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    isFormSubmitting,
    mutationError,
    tasks,
    meta,
    hasFilters: hasActiveFilters(search, status),
    updatingTaskId,
    submitTask,
    changeTaskStatus,
    confirmDelete,
    applySearch,
    applyStatusFilter,
    clearFilters,
    startEdit,
    cancelEdit,
    requestDelete,
    cancelDelete,
    setPage,
  };
}
