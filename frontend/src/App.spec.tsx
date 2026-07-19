import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { makeTask } from './test/test-utils';
import { TaskStatus } from './types/task';

const mutateCreate = vi.fn();
const mutateUpdate = vi.fn();
const mutateDelete = vi.fn();

vi.mock('./hooks/use-tasks', () => ({
  useTasks: vi.fn(),
  useCreateTask: vi.fn(),
  useUpdateTask: vi.fn(),
  useDeleteTask: vi.fn(),
}));

import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from './hooks/use-tasks';

const mockedUseTasks = vi.mocked(useTasks);
const mockedUseCreate = vi.mocked(useCreateTask);
const mockedUseUpdate = vi.mocked(useUpdateTask);
const mockedUseDelete = vi.mocked(useDeleteTask);

function mockHooks(options?: {
  tasks?: ReturnType<typeof makeTask>[];
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  error?: Error;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  createError?: Error | null;
}) {
  const tasks = options?.tasks ?? [makeTask()];
  const meta = options?.meta ?? {
    page: 1,
    limit: 6,
    total: tasks.length,
    totalPages: 1,
  };

  mockedUseTasks.mockReturnValue({
    data: options?.isLoading
      ? undefined
      : {
          data: tasks,
          meta,
        },
    isLoading: options?.isLoading ?? false,
    isError: options?.isError ?? false,
    isFetching: options?.isFetching ?? false,
    error: options?.error ?? null,
  } as unknown as unknown as ReturnType<typeof useTasks>);

  mockedUseCreate.mockReturnValue({
    mutateAsync: mutateCreate,
    isPending: false,
    error: options?.createError ?? null,
  } as unknown as unknown as ReturnType<typeof useCreateTask>);

  mockedUseUpdate.mockReturnValue({
    mutateAsync: mutateUpdate,
    isPending: false,
    error: null,
    variables: undefined,
  } as unknown as unknown as ReturnType<typeof useUpdateTask>);

  mockedUseDelete.mockReturnValue({
    mutateAsync: mutateDelete,
    isPending: false,
    error: null,
  } as unknown as unknown as ReturnType<typeof useDeleteTask>);
}

describe('App', () => {
  beforeEach(() => {
    mutateCreate.mockReset().mockResolvedValue(undefined);
    mutateUpdate.mockReset().mockResolvedValue(undefined);
    mutateDelete.mockReset().mockResolvedValue(undefined);
    window.scrollTo = vi.fn();
  });

  it('renders tasks and creates a new one', async () => {
    const user = userEvent.setup();
    mockHooks();

    render(<App />);

    expect(screen.getByText('Tarefa de teste')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Título'), 'Nova tarefa ok');
    await user.click(screen.getByRole('button', { name: 'Criar tarefa' }));

    await waitFor(() =>
      expect(mutateCreate).toHaveBeenCalledWith({
        title: 'Nova tarefa ok',
        description: undefined,
        status: TaskStatus.PENDING,
      }),
    );
  });

  it('shows loading and empty states', () => {
    mockHooks({ isLoading: true, tasks: [] });
    const { rerender } = render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando tarefas...',
    );

    mockHooks({ tasks: [], isLoading: false });
    rerender(<App />);

    expect(
      screen.getByRole('heading', { name: 'Sua lista está vazia' }),
    ).toBeInTheDocument();
  });

  it('shows query error and filtered empty state', async () => {
    const user = userEvent.setup();
    mockHooks({
      isError: true,
      error: new Error('falha'),
      tasks: [],
    });

    const { unmount } = render(<App />);

    expect(
      screen.getByText('Não foi possível carregar as tarefas'),
    ).toBeInTheDocument();

    unmount();
    mockHooks({ tasks: [] });
    render(<App />);

    await user.type(screen.getByLabelText('Buscar'), 'xyz');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(
      screen.getByRole('heading', { name: 'Nenhuma tarefa encontrada' }),
    ).toBeInTheDocument();
  });

  it('edits, changes status and deletes a task', async () => {
    const user = userEvent.setup();
    const task = makeTask({ title: 'Editável' });
    mockHooks({ tasks: [task] });

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    expect(window.scrollTo).toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Editar tarefa' }),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Título'));
    await user.type(screen.getByLabelText('Título'), 'Título editado');
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() =>
      expect(mutateUpdate).toHaveBeenCalledWith({
        id: task.id,
        input: {
          title: 'Título editado',
          description: 'Descrição',
          status: TaskStatus.PENDING,
        },
      }),
    );

    await user.selectOptions(
      screen.getByLabelText('Alterar status'),
      TaskStatus.COMPLETED,
    );

    await waitFor(() =>
      expect(mutateUpdate).toHaveBeenCalledWith({
        id: task.id,
        input: { status: TaskStatus.COMPLETED },
      }),
    );

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await user.click(
      screen.getByRole('button', { name: 'Confirmar exclusão' }),
    );

    await waitFor(() => expect(mutateDelete).toHaveBeenCalledWith(task.id));
  });

  it('ignores status change when value is the same', async () => {
    const user = userEvent.setup();
    mockHooks();

    render(<App />);

    await user.selectOptions(
      screen.getByLabelText('Alterar status'),
      TaskStatus.PENDING,
    );

    expect(mutateUpdate).not.toHaveBeenCalled();
  });

  it('clears filters and cancels delete dialog', async () => {
    const user = userEvent.setup();
    mockHooks({ tasks: [makeTask()] });

    render(<App />);

    await user.type(screen.getByLabelText('Buscar'), 'abc');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(screen.getByRole('button', { name: 'Limpar' }));

    expect(screen.getByLabelText('Buscar')).toHaveValue('');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters by status, paginates and shows mutation error', async () => {
    const user = userEvent.setup();
    mockHooks({
      tasks: [makeTask()],
      meta: { page: 1, limit: 6, total: 12, totalPages: 2 },
      createError: new Error('falha na mutação'),
    });

    render(<App />);

    expect(screen.getByText('falha na mutação')).toBeInTheDocument();

    await user.selectOptions(
      screen.getByLabelText((_, element) => element?.id === 'task-status'),
      TaskStatus.COMPLETED,
    );

    await user.click(screen.getByRole('button', { name: 'Próxima' }));

    expect(mockedUseTasks).toHaveBeenCalled();
  });

  it('cancels editing from the form', async () => {
    const user = userEvent.setup();
    mockHooks({ tasks: [makeTask()] });

    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(
      screen.getByRole('heading', { name: 'Adicionar tarefa' }),
    ).toBeInTheDocument();
  });

  it('shows update and delete mutation errors and pending states', () => {
    mockHooks({ tasks: [makeTask()] });

    mockedUseUpdate.mockReturnValue({
      mutateAsync: mutateUpdate,
      isPending: true,
      error: new Error('erro update'),
      variables: undefined,
    } as unknown as ReturnType<typeof useUpdateTask>);

    mockedUseDelete.mockReturnValue({
      mutateAsync: mutateDelete,
      isPending: true,
      error: null,
    } as unknown as ReturnType<typeof useDeleteTask>);

    const { rerender } = render(<App />);

    expect(screen.getByText('erro update')).toBeInTheDocument();

    mockedUseCreate.mockReturnValue({
      mutateAsync: mutateCreate,
      isPending: false,
      error: null,
    } as unknown as ReturnType<typeof useCreateTask>);

    mockedUseUpdate.mockReturnValue({
      mutateAsync: mutateUpdate,
      isPending: false,
      error: null,
      variables: undefined,
    } as unknown as ReturnType<typeof useUpdateTask>);

    mockedUseDelete.mockReturnValue({
      mutateAsync: mutateDelete,
      isPending: false,
      error: new Error('erro delete'),
    } as unknown as ReturnType<typeof useDeleteTask>);

    rerender(<App />);

    expect(screen.getByText('erro delete')).toBeInTheDocument();
  });
});
