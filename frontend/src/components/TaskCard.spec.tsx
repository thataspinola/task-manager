import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStatus, type Task } from '../types/task';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  const task: Task = {
    id: '9b68b301-4203-43cd-af73-9fc499804be7',
    title: 'Criar frontend',
    description: 'Criar a interface React',
    status: TaskStatus.PENDING,
    createdAt: '2026-07-18T20:00:00.000Z',
    updatedAt: '2026-07-18T20:00:00.000Z',
  };

  it('renders task information', () => {
    render(
      <TaskCard
        task={task}
        isDeleting={false}
        isUpdating={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Criar frontend',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Criar a interface React')).toBeInTheDocument();

    expect(
      screen.getByText((_, element) => {
        return (
          element?.tagName === 'SPAN' &&
          element.classList.contains('status-badge') &&
          element.textContent === 'Pendente'
        );
      }),
    ).toBeInTheDocument();
  });

  it('requests task editing', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <TaskCard
        task={task}
        isDeleting={false}
        isUpdating={false}
        onEdit={onEdit}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Editar',
      }),
    );

    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it('requests a status change', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskCard
        task={task}
        isDeleting={false}
        isUpdating={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText('Alterar status'),
      TaskStatus.COMPLETED,
    );

    expect(onStatusChange).toHaveBeenCalledWith(task, TaskStatus.COMPLETED);
  });

  it('shows fallback description and deleting label', () => {
    render(
      <TaskCard
        task={{ ...task, description: null }}
        isDeleting
        isUpdating={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Sem descrição.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Excluindo...' }),
    ).toBeInTheDocument();
  });

  it('ignores invalid status values', () => {
    const onStatusChange = vi.fn();

    render(
      <TaskCard
        task={task}
        isDeleting={false}
        isUpdating={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={onStatusChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Alterar status'), {
      target: { value: 'INVALID' },
    });

    expect(onStatusChange).not.toHaveBeenCalled();
  });
});
