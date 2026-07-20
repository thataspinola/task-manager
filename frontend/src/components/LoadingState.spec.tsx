import { render, screen } from '@testing-library/react';
import { LoadingState } from './LoadingState';

describe('LoadingState', () => {
  it('renders loading status', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando tarefas...',
    );
  });
});
