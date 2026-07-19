import { httpClient } from './http-client';
import { createTask, deleteTask, listTasks, updateTask } from './tasks-api';
import { TaskStatus } from '../types/task';

vi.mock('./http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(httpClient);

describe('tasks-api', () => {
  const task = {
    id: '1',
    title: 'Tarefa',
    description: null,
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
  };

  it('listTasks calls GET /tasks with params', async () => {
    const payload = {
      data: [task],
      meta: { page: 1, limit: 6, total: 1, totalPages: 1 },
    };

    mockedHttp.get.mockResolvedValueOnce({ data: payload });

    const params = { page: 1, limit: 6, search: 'abc' };
    await expect(listTasks(params)).resolves.toEqual(payload);
    expect(mockedHttp.get).toHaveBeenCalledWith('/tasks', { params });
  });

  it('createTask calls POST /tasks', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: task });

    const input = { title: 'Nova' };
    await expect(createTask(input)).resolves.toEqual(task);
    expect(mockedHttp.post).toHaveBeenCalledWith('/tasks', input);
  });

  it('updateTask calls PATCH /tasks/:id', async () => {
    mockedHttp.patch.mockResolvedValueOnce({ data: task });

    const input = { status: TaskStatus.COMPLETED };
    await expect(updateTask('1', input)).resolves.toEqual(task);
    expect(mockedHttp.patch).toHaveBeenCalledWith('/tasks/1', input);
  });

  it('deleteTask calls DELETE /tasks/:id', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined });

    await expect(deleteTask('1')).resolves.toBeUndefined();
    expect(mockedHttp.delete).toHaveBeenCalledWith('/tasks/1');
  });
});
