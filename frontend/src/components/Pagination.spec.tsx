import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('moves to the next page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        meta={{
          page: 1,
          limit: 10,
          total: 30,
          totalPages: 3,
        }}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Próxima',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('moves to the previous page', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        meta={{
          page: 2,
          limit: 10,
          total: 30,
          totalPages: 3,
        }}
        onPageChange={onPageChange}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Anterior',
      }),
    );

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('does not render when there is only one page', () => {
    const { container } = render(
      <Pagination
        meta={{
          page: 1,
          limit: 10,
          total: 5,
          totalPages: 1,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
