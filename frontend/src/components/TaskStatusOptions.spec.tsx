import { render, screen } from '@testing-library/react';
import { TaskStatusOptions } from './TaskStatusOptions';

describe('TaskStatusOptions', () => {
  it('renders status options', () => {
    render(
      <select>
        <TaskStatusOptions />
      </select>,
    );

    expect(
      screen.getByRole('option', { name: 'Pendente' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Todos' }),
    ).not.toBeInTheDocument();
  });

  it('includes all option when requested', () => {
    render(
      <select>
        <TaskStatusOptions includeAll />
      </select>,
    );

    expect(screen.getByRole('option', { name: 'Todos' })).toBeInTheDocument();
  });
});
