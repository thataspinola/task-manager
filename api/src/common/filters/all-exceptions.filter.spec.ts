/// <reference types="jest" />

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common'
import type { ArgumentsHost } from '@nestjs/common'
import { Prisma } from '../../generated/prisma/client.js'
import { AllExceptionsFilter } from './all-exceptions.filter.js'

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter()
  const status = jest.fn().mockReturnThis()
  const json = jest.fn()
  const error = jest.spyOn(filter['logger'], 'error').mockImplementation()

  const createHost = (): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/api/tasks/1',
        }),
        getResponse: () => ({ status, json }),
      }),
    }) as unknown as ArgumentsHost

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    error.mockRestore()
  })

  it('maps HttpException object responses', () => {
    filter.catch(
      new BadRequestException({
        message: ['title is too short'],
        error: 'Bad Request',
      }),
      createHost(),
    )

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: ['title is too short'],
        path: '/api/tasks/1',
        method: 'GET',
      }),
    )
    expect(error).not.toHaveBeenCalled()
  })

  it('maps HttpException string responses', () => {
    filter.catch(new HttpException('plain message', HttpStatus.FORBIDDEN), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: 'plain message',
      }),
    )
  })

  it('maps NotFoundException message fallback', () => {
    filter.catch(new NotFoundException('Task missing'), createHost())

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'Task missing',
      }),
    )
  })

  it('maps unknown errors to 500 and logs them', () => {
    filter.catch(new Error('boom'), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    )
    expect(error).toHaveBeenCalled()
  })

  it('maps non-error unknown values to 500', () => {
    filter.catch('weird', createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    )
  })

  it('maps custom status codes without named errors', () => {
    filter.catch(new HttpException('teapot', HttpStatus.I_AM_A_TEAPOT), createHost())

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.I_AM_A_TEAPOT,
        error: 'Http Exception',
        message: 'teapot',
      }),
    )
  })

  it.each([
    ['P2002', HttpStatus.CONFLICT, 'Conflict'],
    ['P2025', HttpStatus.NOT_FOUND, 'Not Found'],
    ['P2003', HttpStatus.BAD_REQUEST, 'Bad Request'],
    ['P9999', HttpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error'],
  ] as const)('maps Prisma code %s', (code, statusCode, errorName) => {
    const prismaError = new Prisma.PrismaClientKnownRequestError('db', {
      code,
      clientVersion: '7.8.0',
    })

    filter.catch(prismaError, createHost())

    expect(status).toHaveBeenCalledWith(statusCode)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode,
        error: errorName,
        path: '/api/tasks/1',
      }),
    )
  })

  it('maps HttpException object responses without message field', () => {
    filter.catch(
      new HttpException({ error: 'Bad Request' }, HttpStatus.BAD_REQUEST),
      createHost(),
    )

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Http Exception',
      }),
    )
  })

  it('resolves named status codes for auth/validation', () => {
    filter.catch(new HttpException('nope', HttpStatus.BAD_REQUEST), createHost())
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Request' }),
    )

    filter.catch(new HttpException('nope', HttpStatus.UNAUTHORIZED), createHost())
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
    )

    filter.catch(new HttpException('nope', HttpStatus.FORBIDDEN), createHost())
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Forbidden' }),
    )

    filter.catch(new HttpException('nope', HttpStatus.NOT_FOUND), createHost())
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Not Found' }),
    )

    filter.catch(new HttpException('nope', HttpStatus.CONFLICT), createHost())
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Conflict' }),
    )

    filter.catch(
      new HttpException('nope', HttpStatus.UNPROCESSABLE_ENTITY),
      createHost(),
    )
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unprocessable Entity' }),
    )

    filter.catch(
      new HttpException('nope', HttpStatus.SERVICE_UNAVAILABLE),
      createHost(),
    )
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Service Unavailable' }),
    )

    filter.catch(
      new HttpException('nope', HttpStatus.INTERNAL_SERVER_ERROR),
      createHost(),
    )
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Internal Server Error' }),
    )
  })
})
