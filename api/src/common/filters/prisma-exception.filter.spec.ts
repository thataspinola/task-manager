/// <reference types="jest" />

import { ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Prisma } from '../../generated/prisma/client.js'
import { PrismaExceptionFilter } from './prisma-exception.filter.js'

describe('PrismaExceptionFilter', () => {
  const filter = new PrismaExceptionFilter()
  const status = jest.fn().mockReturnThis()
  const json = jest.fn()

  const createHost = (): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ status, json }),
      }),
    }) as unknown as ArgumentsHost

  const createError = (
    code: string,
  ): Prisma.PrismaClientKnownRequestError =>
    new Prisma.PrismaClientKnownRequestError('prisma error', {
      code,
      clientVersion: '7.8.0',
    })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('maps P2002 to 409 Conflict', () => {
    filter.catch(createError('P2002'), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT)
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'A record with this unique field already exists',
      error: 'Conflict',
    })
  })

  it('maps P2025 to 404 Not Found', () => {
    filter.catch(createError('P2025'), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND)
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Record not found',
      error: 'Not Found',
    })
  })

  it('maps P2003 to 400 Bad Request', () => {
    filter.catch(createError('P2003'), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Related record not found',
      error: 'Bad Request',
    })
  })

  it('maps unknown codes to 500', () => {
    filter.catch(createError('P9999'), createHost())

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database request failed',
      error: 'Internal Server Error',
    })
  })
})
