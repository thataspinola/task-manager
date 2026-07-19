/**
 * Formato JSON de erro do BFF (`AllExceptionsFilter`).
 *
 * Exemplo:
 * `{ statusCode: 400, error: "Bad Request", message: ["title must be..."] }`
 *
 * Usado em `ErrorMessage` para ler `message` tipada.
 */
export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  method?: string;
  timestamp?: string;
};
