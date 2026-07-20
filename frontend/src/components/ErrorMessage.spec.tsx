import axios from 'axios';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders default title and axios message string', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          statusCode: 400,
          error: 'Bad Request',
          message: 'Título inválido',
        },
      },
      toJSON: () => ({}),
    };

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    render(<ErrorMessage error={error} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível concluir a operação',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Título inválido');
  });

  it('joins array messages from the BFF', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    render(
      <ErrorMessage
        error={{
          response: { data: { message: ['A', 'B'] } },
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('A. B');
  });

  it('handles timeout and network errors', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    const { rerender } = render(
      <ErrorMessage error={{ code: 'ECONNABORTED' }} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'O BFF demorou mais que o esperado para responder.',
    );

    rerender(<ErrorMessage error={{}} />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível acessar o BFF.',
    );
  });

  it('falls back when axios has a response without message', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    render(
      <ErrorMessage
        error={{
          response: { data: {} },
        }}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Ocorreu um erro inesperado.',
    );
  });
});
