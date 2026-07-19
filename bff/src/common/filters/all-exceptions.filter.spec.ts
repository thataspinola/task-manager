/// <reference types="jest" />

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();
  const status = jest.fn().mockReturnThis();
  const json = jest.fn();
  const error = jest.spyOn(filter['logger'], 'error').mockImplementation();

  const createHost = (): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/api/tasks/1',
        }),
        getResponse: () => ({ status, json }),
      }),
    }) as unknown as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    error.mockRestore();
  });

  it('maps HttpException object responses', () => {
    filter.catch(
      new BadRequestException({
        message: ['title is too short'],
        error: 'Bad Request',
      }),
      createHost(),
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['title is too short'],
        path: '/api/tasks/1',
        method: 'GET',
      }),
    );
  });

  it('maps HttpException string responses', () => {
    filter.catch(new HttpException('plain', HttpStatus.FORBIDDEN), createHost());

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Forbidden',
        message: 'plain',
      }),
    );
  });

  it('maps HttpException object without message', () => {
    filter.catch(
      new HttpException({ error: 'Bad Request' }, HttpStatus.BAD_REQUEST),
      createHost(),
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Http Exception',
      }),
    );
  });

  it('maps NotFoundException', () => {
    filter.catch(new NotFoundException('missing'), createHost());

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'missing',
      }),
    );
  });

  it('maps unknown errors to 500 and logs', () => {
    filter.catch(new Error('boom'), createHost());

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error).toHaveBeenCalled();
  });

  it('maps non-error values to 500', () => {
    filter.catch('weird', createHost());

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    );
  });

  it.each([
    [HttpStatus.BAD_REQUEST, 'Bad Request'],
    [HttpStatus.UNAUTHORIZED, 'Unauthorized'],
    [HttpStatus.FORBIDDEN, 'Forbidden'],
    [HttpStatus.NOT_FOUND, 'Not Found'],
    [HttpStatus.CONFLICT, 'Conflict'],
    [HttpStatus.REQUEST_TIMEOUT, 'Request Timeout'],
    [HttpStatus.UNPROCESSABLE_ENTITY, 'Unprocessable Entity'],
    [HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
    [HttpStatus.BAD_GATEWAY, 'Bad Gateway'],
    [HttpStatus.SERVICE_UNAVAILABLE, 'Service Unavailable'],
    [HttpStatus.GATEWAY_TIMEOUT, 'Gateway Timeout'],
    [HttpStatus.I_AM_A_TEAPOT, 'HTTP Error'],
  ] as const)('resolves error name for status %s', (statusCode, errorName) => {
    filter.catch(new HttpException('x', statusCode), createHost());

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: errorName }),
    );
  });
});
