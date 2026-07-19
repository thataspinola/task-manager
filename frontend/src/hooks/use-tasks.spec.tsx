import { renderHook, waitFor } from '@testing-library/react';
import {
  taskQueryKeys,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from './use-tasks';
import * as tasksApi from '../api/tasks-api';
import * as sentry from '../observability/sentry';
import { Wrapper, makeTask } from '../test/test-utils';
import { TaskStatus } from '../types/task';

vi.mock('../api/tasks-api');
vi.mock('../observability/sentry', () => ({
  captureClientException: vi.fn(),
}));

const mockedApi = vi.mocked(tasksApi);

describe('use-tasks', () => {
  it('exposes stable query keys', () => {
    expect(taskQueryKeys.all).toEqual(['tasks']);
    expect(taskQueryKeys.list({ page: 1 })).toEqual([
      'tasks',
      'list',
      { page: 1 },
    ]);
  });

  it('useTasks fetches the list', async () => {
    const payload = {
      data: [makeTask()],
      meta: { page: 1, limit: 6, total: 1, totalPages: 1 },
    };

    mockedApi.listTasks.mockResolvedValueOnce(payload);

    const { result } = renderHook(() => useTasks({ page: 1, limit: 6 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(payload);
  });

  it('useCreateTask invalidates tasks on success', async () => {
    mockedApi.createTask.mockResolvedValueOnce(makeTask());

    const { result } = renderHook(() => useCreateTask(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync({ title: 'Nova' });

    expect(mockedApi.createTask).toHaveBeenCalledWith({ title: 'Nova' });
  });

  it('useUpdateTask invalidates tasks on success', async () => {
    mockedApi.updateTask.mockResolvedValueOnce(
      makeTask({ status: TaskStatus.COMPLETED }),
    );

    const { result } = renderHook(() => useUpdateTask(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync({
      id: '1',
      input: { status: TaskStatus.COMPLETED },
    });

    expect(mockedApi.updateTask).toHaveBeenCalledWith('1', {
      status: TaskStatus.COMPLETED,
    });
  });

  it('useDeleteTask invalidates tasks on success', async () => {
    mockedApi.deleteTask.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTask(), {
      wrapper: Wrapper,
    });

    await result.current.mutateAsync('1');

    expect(mockedApi.deleteTask).toHaveBeenCalledWith('1');
  });

  it('reports mutation errors to Sentry on create/update/delete', async () => {
    const failure = new Error('falha');

    mockedApi.createTask.mockRejectedValueOnce(failure);
    const create = renderHook(() => useCreateTask(), { wrapper: Wrapper });
    await expect(
      create.result.current.mutateAsync({ title: 'Nova' }),
    ).rejects.toThrow('falha');

    mockedApi.updateTask.mockRejectedValueOnce(failure);
    const update = renderHook(() => useUpdateTask(), { wrapper: Wrapper });
    await expect(
      update.result.current.mutateAsync({
        id: '1',
        input: { title: 'X' },
      }),
    ).rejects.toThrow('falha');

    mockedApi.deleteTask.mockRejectedValueOnce(failure);
    const remove = renderHook(() => useDeleteTask(), { wrapper: Wrapper });
    await expect(remove.result.current.mutateAsync('1')).rejects.toThrow(
      'falha',
    );

    await waitFor(() =>
      expect(sentry.captureClientException).toHaveBeenCalledTimes(3),
    );
  });
});
