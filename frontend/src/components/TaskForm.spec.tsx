import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';
import { TaskStatus, type Task } from '../types/task';

describe('TaskForm', () => {
  it('renders the creation form', () => {
    render(
      <TaskForm
        task={null}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Adicionar tarefa',
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Título')).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Criar tarefa',
      }),
    ).toBeInTheDocument();
  });

  it('shows a validation error for a short title', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskForm
        task={null}
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancelEdit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Título'), 'AB');

    await user.click(
      screen.getByRole('button', {
        name: 'Criar tarefa',
      }),
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O título deve possuir pelo menos 3 caracteres.',
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid task', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskForm
        task={null}
        isSubmitting={false}
        onSubmit={onSubmit}
        onCancelEdit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Título'), 'Criar testes');

    await user.type(
      screen.getByLabelText('Descrição'),
      'Testar o formulário React',
    );

    await user.selectOptions(screen.getByLabelText('Status'), 'IN_PROGRESS');

    await user.click(
      screen.getByRole('button', {
        name: 'Criar tarefa',
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Criar testes',
      description: 'Testar o formulário React',
      status: 'IN_PROGRESS',
    });
  });

  it('fills the form when editing a task', () => {
    const task: Task = {
      id: '9b68b301-4203-43cd-af73-9fc499804be7',
      title: 'Tarefa existente',
      description: 'Descrição existente',
      status: TaskStatus.IN_PROGRESS,
      createdAt: '2026-07-18T20:00:00.000Z',
      updatedAt: '2026-07-18T20:00:00.000Z',
    };

    render(
      <TaskForm
        task={task}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Editar tarefa',
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('Título')).toHaveValue('Tarefa existente');

    expect(screen.getByLabelText('Descrição')).toHaveValue(
      'Descrição existente',
    );

    expect(screen.getByLabelText('Status')).toHaveValue(TaskStatus.IN_PROGRESS);
  });

  it('cancels editing and shows submitting label', async () => {
    const user = userEvent.setup();
    const onCancelEdit = vi.fn();
    const task: Task = {
      id: '9b68b301-4203-43cd-af73-9fc499804be7',
      title: 'Tarefa existente',
      description: null,
      status: TaskStatus.PENDING,
      createdAt: '2026-07-18T20:00:00.000Z',
      updatedAt: '2026-07-18T20:00:00.000Z',
    };

    const { rerender } = render(
      <TaskForm
        task={task}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancelEdit={onCancelEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelEdit).toHaveBeenCalled();

    rerender(
      <TaskForm
        task={task}
        isSubmitting
        onSubmit={vi.fn()}
        onCancelEdit={onCancelEdit}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Salvando...' }),
    ).toBeInTheDocument();
  });

  it('falls back to PENDING when status parse fails', () => {
    render(
      <TaskForm
        task={null}
        isSubmitting={false}
        onSubmit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Status'), {
      target: { name: 'status', value: 'INVALID' },
    });

    expect(screen.getByLabelText('Status')).toHaveValue(TaskStatus.PENDING);
  });
});
