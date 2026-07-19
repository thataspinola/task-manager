/**
 * Exception Filter pattern: normaliza HttpException e erros Prisma
 * no mesmo formato JSON (path, method, timestamp).
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { Prisma } from '../../generated/prisma/client.js'

type NestExceptionResponse = {
  message?: string | string[]
  error?: string
}

type ErrorBody = {
  statusCode: number
  error: string
  message: string | string[]
  path: string
  method: string
  timestamp: string
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()

    const body =
      exception instanceof Prisma.PrismaClientKnownRequestError
        ? this.mapPrismaError(exception, request)
        : this.mapHttpError(exception, request)

    if (body.statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    response.status(body.statusCode).json(body)
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
    request: Request,
  ): ErrorBody {
    const mapped = this.resolvePrismaCode(exception.code)

    return {
      statusCode: mapped.statusCode,
      error: mapped.error,
      message: mapped.message,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
    }
  }

  /** Códigos Prisma mais comuns em CRUD → HTTP semântico */
  private resolvePrismaCode(code: string): {
    statusCode: number
    error: string
    message: string
  } {
    switch (code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: 'A record with this unique field already exists',
        }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Record not found',
        }
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: 'Related record not found',
        }
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Database request failed',
        }
    }
  }

  private mapHttpError(exception: unknown, request: Request): ErrorBody {
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null

    const parsedResponse =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as NestExceptionResponse)
        : null

    return {
      statusCode,
      error: parsedResponse?.error ?? this.resolveErrorName(statusCode),
      message: this.resolveMessage(exception, exceptionResponse, parsedResponse),
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
    }
  }

  private resolveMessage(
    exception: unknown,
    exceptionResponse: string | object | null,
    parsedResponse: NestExceptionResponse | null,
  ): string | string[] {
    if (parsedResponse?.message) {
      return parsedResponse.message
    }

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse
    }

    if (exception instanceof HttpException) {
      return exception.message
    }

    return 'Internal server error'
  }

  private resolveErrorName(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request'
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized'
      case HttpStatus.FORBIDDEN:
        return 'Forbidden'
      case HttpStatus.NOT_FOUND:
        return 'Not Found'
      case HttpStatus.CONFLICT:
        return 'Conflict'
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity'
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service Unavailable'
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error'
      default:
        return 'Http Exception'
    }
  }
}
