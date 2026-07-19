/**
 * Exception Filter pattern: JSON de erro uniforme
 * (path, method, timestamp). Registrado via APP_FILTER (DI).
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { captureServerException } from '../../observability/sentry.js';
type HttpErrorBody = {
  statusCode?: number;
  error?: string;
  message?: string | string[];
};

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionBody =
      exception instanceof HttpException ? exception.getResponse() : null;

    const parsedBody =
      typeof exceptionBody === 'object' && exceptionBody !== null
        ? (exceptionBody as HttpErrorBody)
        : null;

    const message = this.resolveMessage(exception, exceptionBody, parsedBody);
    const error = parsedBody?.error ?? this.resolveErrorName(statusCode);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.originalUrl}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
      captureServerException(exception);
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      path: request.originalUrl,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
  }

  private resolveMessage(
    exception: unknown,
    exceptionBody: string | object | null,
    parsedBody: HttpErrorBody | null,
  ): string | string[] {
    if (parsedBody?.message !== undefined) {
      return parsedBody.message;
    }

    if (typeof exceptionBody === 'string') {
      return exceptionBody;
    }

    if (exception instanceof HttpException) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private resolveErrorName(statusCode: number): string {
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
      case HttpStatus.REQUEST_TIMEOUT:
        return 'Request Timeout';
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
}
