/**
 * Lógica pura da confirmação de exclusão (fácil de testar sem React).
 *
 * - Sem tarefa pendente → não chama o DELETE
 * - Se estava editando a mesma tarefa → limpa o modo edição
 */
import type { Task } from '../types/task';

export async function confirmTaskDeletion(options: {
  taskPendingDeletion: Task | null;
  editingTask: Task | null;
  deleteTask: (id: string) => Promise<unknown>;
}): Promise<{ editingTask: Task | null }> {
  const { taskPendingDeletion, editingTask, deleteTask } = options;

  if (!taskPendingDeletion) {
    return { editingTask };
  }

  await deleteTask(taskPendingDeletion.id);

  if (editingTask?.id === taskPendingDeletion.id) {
    return { editingTask: null };
  }

  return { editingTask };
}
