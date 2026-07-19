/**
 * Adapter / Translator: AxiosError da API → HttpException Nest
 * (timeout, conexão recusada, status HTTP upstream).
 */
import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  RequestTimeoutException,
} from '@nestjs/common';
import { AxiosError, isAxiosError } from 'axios';

type ApiErrorBody = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
  path?: string;
  method?: string;
  timestamp?: string;
};

export function throwApiError(error: unknown): never {
  if (!isAxiosError<ApiErrorBody>(error)) {
    throw new BadGatewayException({
      error: 'Bad Gateway',
      message: 'Unexpected error while communicating with the internal API',
    });
  }

  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    throw new GatewayTimeoutException({
      error: 'Gateway Timeout',
      message: 'The internal API did not respond within the expected time',
    });
  }

  if (axiosError.code === 'ECONNREFUSED') {
    throw new BadGatewayException({
      error: 'Bad Gateway',
      message: 'The internal API is unavailable',
    });
  }

  if (!axiosError.response) {
    throw new BadGatewayException({
      error: 'Bad Gateway',
      message: 'It was not possible to communicate with the internal API',
    });
  }

  const statusCode = normalizeStatusCode(axiosError.response.status);
  const responseBody = axiosError.response.data;

  if (statusCode === HttpStatus.REQUEST_TIMEOUT) {
    throw new RequestTimeoutException({
      error: responseBody?.error ?? 'Request Timeout',
      message: responseBody?.message ?? 'The internal API request timed out',
    });
  }

  throw new HttpException(
    {
      statusCode,
      error: responseBody?.error ?? resolveHttpErrorName(statusCode),
      message: responseBody?.message ?? 'The internal API returned an error',
    },
    statusCode,
  );
}

/** Status fora de 4xx/5xx viram 502 (resposta inesperada da API). */
function normalizeStatusCode(statusCode: number): number {
  if (statusCode >= 400 && statusCode <= 599) {
    return statusCode;
  }

  return HttpStatus.BAD_GATEWAY;
}

function resolveHttpErrorName(statusCode: number): string {
  switch (statusCode) {
    case HttpStatus.BAD_REQUEST:
      return 'Bad Request';
    case HttpStatus.UNAUTHORIZED:
      return 'Unauthorized';
    case HttpStatus.FORBIDDEN:
      return 'Forbidden';
    case HttpStatus.NOT_FOUND:
      return 'Not Found';
    case HttpStatus.CONFLICT:
      return 'Conflict';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'Unprocessable Entity';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal Server Error';
    case HttpStatus.BAD_GATEWAY:
      return 'Bad Gateway';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'Service Unavailable';
    case HttpStatus.GATEWAY_TIMEOUT:
      return 'Gateway Timeout';
    default:
      return 'HTTP Error';
  }
}
