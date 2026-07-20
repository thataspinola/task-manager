import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskStatus } from '../types/task';
import { TaskFilters } from './TaskFilters';

describe('TaskFilters', () => {
  it('submits the search text', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(
      <TaskFilters
        search=""
        status={undefined}
        onSearchChange={onSearchChange}
        onStatusChange={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText('Buscar'), 'React');

    await user.click(
      screen.getByRole('button', {
        name: 'Buscar',
      }),
    );

    expect(onSearchChange).toHaveBeenCalledWith('React');
  });

  it('changes the status filter', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskFilters
        search=""
        status={undefined}
        onSearchChange={vi.fn()}
        onStatusChange={onStatusChange}
        onClear={vi.fn()}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText('Status'),
      TaskStatus.COMPLETED,
    );

    expect(onStatusChange).toHaveBeenCalledWith(TaskStatus.COMPLETED);
  });

  it('clears the status filter to all', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();

    render(
      <TaskFilters
        search=""
        status={TaskStatus.PENDING}
        onSearchChange={vi.fn()}
        onStatusChange={onStatusChange}
        onClear={vi.fn()}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Status'), '');

    expect(onStatusChange).toHaveBeenCalledWith(undefined);
  });
});
