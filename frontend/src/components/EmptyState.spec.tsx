import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('shows empty list copy without filters', () => {
    render(<EmptyState hasFilters={false} />);

    expect(
      screen.getByRole('heading', { name: 'Sua lista está vazia' }),
    ).toBeInTheDocument();
  });

  it('shows filtered empty copy with filters', () => {
    render(<EmptyState hasFilters />);

    expect(
      screen.getByRole('heading', { name: 'Nenhuma tarefa encontrada' }),
    ).toBeInTheDocument();
  });
});
