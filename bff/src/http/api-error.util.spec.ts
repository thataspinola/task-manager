/// <reference types="jest" />

import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  HttpStatus,
  RequestTimeoutException,
} from '@nestjs/common';
import { AxiosError, AxiosHeaders } from 'axios';
import { throwApiError } from './api-error.util.js';

function createAxiosError(options: {
  code?: string;
  status?: number;
  data?: unknown;
  hasResponse?: boolean;
}): AxiosError {
  const error = new AxiosError('request failed');
  error.code = options.code;

  if (options.hasResponse === false) {
    error.response = undefined;
    return error;
  }

  if (options.status !== undefined) {
    error.response = {
      status: options.status,
      statusText: 'Error',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: options.data ?? {},
    };
  }

  return error;
}

describe('throwApiError', () => {
  it('maps non-axios errors to BadGateway', () => {
    expect(() => throwApiError(new Error('boom'))).toThrow(BadGatewayException);
  });

  it('maps ECONNABORTED and ETIMEDOUT to GatewayTimeout', () => {
    expect(() =>
      throwApiError(createAxiosError({ code: 'ECONNABORTED', hasResponse: false })),
    ).toThrow(GatewayTimeoutException);

    expect(() =>
      throwApiError(createAxiosError({ code: 'ETIMEDOUT', hasResponse: false })),
    ).toThrow(GatewayTimeoutException);
  });

  it('maps ECONNREFUSED to BadGateway', () => {
    expect(() =>
      throwApiError(createAxiosError({ code: 'ECONNREFUSED', hasResponse: false })),
    ).toThrow(BadGatewayException);
  });

  it('maps missing response to BadGateway', () => {
    expect(() =>
      throwApiError(createAxiosError({ hasResponse: false })),
    ).toThrow(BadGatewayException);
  });

  it('maps request timeout status', () => {
    expect(() =>
      throwApiError(
        createAxiosError({
          status: HttpStatus.REQUEST_TIMEOUT,
          data: {},
        }),
      ),
    ).toThrow(RequestTimeoutException);
  });

  it('maps request timeout with body fields', () => {
    try {
      throwApiError(
        createAxiosError({
          status: HttpStatus.REQUEST_TIMEOUT,
          data: { error: 'Custom', message: 'slow' },
        }),
      );
    } catch (error) {
      expect(error).toBeInstanceOf(RequestTimeoutException);
      expect((error as RequestTimeoutException).getResponse()).toMatchObject({
        error: 'Custom',
        message: 'slow',
      });
    }
  });

  it('maps API http errors preserving body', () => {
    try {
      throwApiError(
        createAxiosError({
          status: HttpStatus.NOT_FOUND,
          data: { error: 'Not Found', message: 'Task missing' },
        }),
      );
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect((error as HttpException).getResponse()).toMatchObject({
        message: 'Task missing',
      });
    }
  });

  it('maps unexpected status codes to BadGateway', () => {
    try {
      throwApiError(createAxiosError({ status: 204, data: {} }));
    } catch (error) {
      expect((error as HttpException).getStatus()).toBe(HttpStatus.BAD_GATEWAY);
    }
  });

  it.each([
    [HttpStatus.BAD_REQUEST, 'Bad Request'],
    [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
    [HttpStatus.FORBIDDEN, 'Forbidden'],
    [HttpStatus.NOT_FOUND, 'Not Found'],
    [HttpStatus.CONFLICT, 'Conflict'],
    [HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity'],
    [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
    [HttpStatus.BAD_GATEWAY, 'Bad Gateway'],
    [HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable'],
    [HttpStatus.GATEWAY_TIMEOUT, 'Gateway Timeout'],
    [418, 'HTTP Error'],
  ] as const)('resolves default error name for %s', (status, errorName) => {
    try {
      throwApiError(createAxiosError({ status, data: {} }));
    } catch (error) {
      expect((error as HttpException).getResponse()).toMatchObject({
        error: errorName,
        message: 'The internal API returned an error',
      });
    }
  });
});
