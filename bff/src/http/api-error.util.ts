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
import { isAxiosError } from 'axios';

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

  const axiosError = error;

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

  if (statusCode === 408) {
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
  const names: Record<number, string> = {
    [HttpStatus.BAD_REQUEST]: 'Bad Request',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
    [HttpStatus.FORBIDDEN]: 'Forbidden',
    [HttpStatus.NOT_FOUND]: 'Not Found',
    [HttpStatus.CONFLICT]: 'Conflict',
    [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [HttpStatus.BAD_GATEWAY]: 'Bad Gateway',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [HttpStatus.GATEWAY_TIMEOUT]: 'Gateway Timeout',
  };

  return names[statusCode] ?? 'HTTP Error';
}
