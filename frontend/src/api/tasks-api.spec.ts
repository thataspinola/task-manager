import { httpClient } from './http-client';
import { createTask, deleteTask, listTasks, updateTask } from './tasks-api';
import { TaskStatus } from '../types/task';

describe('tasks-api', () => {
  const task = {
    id: '1',
    title: 'Tarefa',
    description: null,
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listTasks calls GET /tasks with params', async () => {
    const payload = {
      data: [task],
      meta: { page: 1, limit: 6, total: 1, totalPages: 1 },
    };

    const get = vi
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: payload });

    const params = { page: 1, limit: 6, search: 'abc' };
    await expect(listTasks(params)).resolves.toEqual(payload);
    expect(get).toHaveBeenCalledWith('/tasks', { params });
  });

  it('createTask calls POST /tasks', async () => {
    const post = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValueOnce({ data: task });

    const input = { title: 'Nova' };
    await expect(createTask(input)).resolves.toEqual(task);
    expect(post).toHaveBeenCalledWith('/tasks', input);
  });

  it('updateTask calls PATCH /tasks/:id', async () => {
    const patch = vi
      .spyOn(httpClient, 'patch')
      .mockResolvedValueOnce({ data: task });

    const input = { status: TaskStatus.COMPLETED };
    await expect(updateTask('1', input)).resolves.toEqual(task);
    expect(patch).toHaveBeenCalledWith('/tasks/1', input);
  });

  it('deleteTask calls DELETE /tasks/:id', async () => {
    const del = vi
      .spyOn(httpClient, 'delete')
      .mockResolvedValueOnce({ data: undefined });

    await expect(deleteTask('1')).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith('/tasks/1');
  });
});
