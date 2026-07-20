import axios from 'axios';
import { extractErrorMessage } from './api-error';

describe('extractErrorMessage', () => {
  it('reads string and array messages from axios errors', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    expect(
      extractErrorMessage({
        response: { data: { message: 'Título inválido' } },
      }),
    ).toBe('Título inválido');

    expect(
      extractErrorMessage({
        response: { data: { message: ['A', 'B'] } },
      }),
    ).toBe('A. B');
  });

  it('handles timeout, network and generic cases', () => {
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);

    expect(extractErrorMessage({ code: 'ECONNABORTED' })).toBe(
      'O BFF demorou mais que o esperado para responder.',
    );

    expect(extractErrorMessage({})).toBe('Não foi possível acessar o BFF.');

    expect(
      extractErrorMessage({
        response: { data: {} },
      }),
    ).toBe('Ocorreu um erro inesperado.');

    vi.spyOn(axios, 'isAxiosError').mockReturnValue(false);

    expect(extractErrorMessage(new Error('falhou'))).toBe('falhou');
    expect(extractErrorMessage(null)).toBe('Ocorreu um erro inesperado.');
  });
});
