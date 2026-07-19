import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common'
import type { Response } from 'express'
import { Prisma } from '../../generated/prisma/client.js'

type ErrorBody = {
  statusCode: number
  message: string
  error: string
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>()
    const body = this.mapError(exception)

    response.status(body.statusCode).json(body)
  }

  private mapError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ErrorBody {
    switch (exception.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with this unique field already exists',
          error: 'Conflict',
        }
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        }
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related record not found',
          error: 'Bad Request',
        }
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database request failed',
          error: 'Internal Server Error',
        }
    }
  }
}
