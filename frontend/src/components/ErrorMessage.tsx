import axios from "axios";
import type { ApiErrorResponse } from "../types/api-error";

type ErrorMessageProps = {
  error: unknown;
  title?: string;
};

export function ErrorMessage({
  error,
  title = "Não foi possível concluir a operação",
}: ErrorMessageProps) {
  const message = extractErrorMessage(error);

  return (
    <div className="alert alert-error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(". ");
    }

    if (typeof message === "string") {
      return message;
    }

    if (error.code === "ECONNABORTED") {
      return "O BFF demorou mais que o esperado para responder.";
    }

    if (!error.response) {
      return "Não foi possível acessar o BFF.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}
