import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
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
  if (!isAxiosError(error)) {
    throw new BadGatewayException(
      'Unexpected error while communicating with the API',
    );
  }

  const axiosError = error as AxiosError<ApiErrorBody>;

  if (axiosError.code === 'ECONNABORTED') {
    throw new GatewayTimeoutException(
      'The API did not respond within the expected time',
    );
  }

  if (!axiosError.response) {
    throw new BadGatewayException('The API is unavailable');
  }

  const statusCode = axiosError.response.status || HttpStatus.BAD_GATEWAY;

  const response = axiosError.response.data;

  throw new HttpException(
    {
      statusCode,
      error: response?.error ?? 'API Error',
      message:
        response?.message ??
        'An error occurred while communicating with the API',
    },
    statusCode,
  );
}
