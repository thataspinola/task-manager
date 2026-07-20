import { confirmTaskDeletion } from './confirm-task-deletion';
import { makeTask } from '../test/test-utils';

describe('confirmTaskDeletion', () => {
  it('returns early when there is no pending task', async () => {
    const deleteTask = vi.fn();
    const editing = makeTask();

    await expect(
      confirmTaskDeletion({
        taskPendingDeletion: null,
        editingTask: editing,
        deleteTask,
      }),
    ).resolves.toEqual({ editingTask: editing });

    expect(deleteTask).not.toHaveBeenCalled();
  });

  it('deletes and clears editing when ids match', async () => {
    const task = makeTask();
    const deleteTask = vi.fn().mockResolvedValue(undefined);

    await expect(
      confirmTaskDeletion({
        taskPendingDeletion: task,
        editingTask: task,
        deleteTask,
      }),
    ).resolves.toEqual({ editingTask: null });

    expect(deleteTask).toHaveBeenCalledWith(task.id);
  });

  it('keeps editing when deleting another task', async () => {
    const pending = makeTask({ id: 'pending' });
    const editing = makeTask({ id: 'editing' });
    const deleteTask = vi.fn().mockResolvedValue(undefined);

    await expect(
      confirmTaskDeletion({
        taskPendingDeletion: pending,
        editingTask: editing,
        deleteTask,
      }),
    ).resolves.toEqual({ editingTask: editing });
  });
});
