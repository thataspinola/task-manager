import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request, Response } from 'express';
import type { Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';
import { HTTP_REQUESTS_SECONDS } from './metrics.constants.js';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(HTTP_REQUESTS_SECONDS)
    private readonly httpDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const path = this.normalizePath(request);
    const end = this.httpDuration.startTimer({
      method: request.method,
      path,
      service: 'bff',
    });

    return next.handle().pipe(
      tap({
        next: () => {
          end({ status: String(response.statusCode) });
        },
        error: () => {
          const code = Number(response.statusCode);
          const status = code >= 400 ? code : 500;
          end({ status: String(status) });
        },
      }),
    );
  }

  private normalizePath(request: Request): string {
    const route = request.route as { path?: string } | undefined;
    const routePath = route?.path;
    if (typeof routePath === 'string' && routePath.length > 0) {
      const base = request.baseUrl ?? '';
      return `${base}${routePath}`;
    }

    if (typeof request.path === 'string' && request.path.length > 0) {
      return request.path;
    }

    return 'unknown';
  }
}
