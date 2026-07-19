/**
 * Alerta de erro amigável — delega a mensagem a `extractErrorMessage`.
 */
import { extractErrorMessage } from '../lib/api-error';

type ErrorMessageProps = {
  error: unknown;
  title?: string;
};

export function ErrorMessage({
  error,
  title = 'Não foi possível concluir a operação',
}: ErrorMessageProps) {
  const message = extractErrorMessage(error);

  return (
    <div className="alert alert-error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
