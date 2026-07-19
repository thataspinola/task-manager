/// <reference types="jest" />

import { of, throwError } from 'rxjs';
import { HttpMetricsInterceptor } from './http-metrics.interceptor.js';

describe('HttpMetricsInterceptor', () => {
  const end = jest.fn();
  const startTimer = jest.fn(() => end);
  let interceptor: HttpMetricsInterceptor;

  beforeEach(() => {
    end.mockClear();
    startTimer.mockClear();
    interceptor = new HttpMetricsInterceptor({
      startTimer,
    } as never);
  });

  const httpContext = (overrides: {
    path?: string | undefined;
    routePath?: string | undefined;
    baseUrl?: string | undefined;
    statusCode?: number;
    omitRoute?: boolean;
  }) => {
    const request: Record<string, unknown> = {
      method: 'GET',
      path: overrides.path,
      baseUrl: overrides.baseUrl,
    };
    if (!overrides.omitRoute) {
      request.route =
        overrides.routePath !== undefined
          ? { path: overrides.routePath }
          : undefined;
    }
    const response = { statusCode: overrides.statusCode ?? 200 };

    return {
      getType: () => 'http' as const,
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    };
  };

  it('skips non-http contexts', (done) => {
    const context = {
      getType: () => 'rpc' as const,
    };

    interceptor
      .intercept(context as never, { handle: () => of('ok') })
      .subscribe(() => {
        expect(startTimer).not.toHaveBeenCalled();
        done();
      });
  });

  it('records duration on success with route path', (done) => {
    const context = httpContext({
      routePath: '/tasks/:id',
      baseUrl: '/api',
      statusCode: 200,
    });

    interceptor
      .intercept(context as never, { handle: () => of('ok') })
      .subscribe(() => {
        expect(startTimer).toHaveBeenCalledWith({
          method: 'GET',
          path: '/api/tasks/:id',
          service: 'bff',
        });
        expect(end).toHaveBeenCalledWith({ status: '200' });
        done();
      });
  });

  it('uses empty base when baseUrl is undefined', (done) => {
    const context = httpContext({
      routePath: '/health',
      baseUrl: undefined,
    });

    interceptor
      .intercept(context as never, { handle: () => of('ok') })
      .subscribe(() => {
        expect(startTimer).toHaveBeenCalledWith(
          expect.objectContaining({ path: '/health' }),
        );
        done();
      });
  });

  it('falls back to request.path when route is missing', (done) => {
    const context = httpContext({ path: '/api/health', omitRoute: true });

    interceptor
      .intercept(context as never, { handle: () => of('ok') })
      .subscribe(() => {
        expect(startTimer).toHaveBeenCalledWith(
          expect.objectContaining({ path: '/api/health' }),
        );
        done();
      });
  });

  it('uses unknown when path and route are empty', (done) => {
    const context = httpContext({ path: '', routePath: '' });

    interceptor
      .intercept(context as never, { handle: () => of('ok') })
      .subscribe(() => {
        expect(startTimer).toHaveBeenCalledWith(
          expect.objectContaining({ path: 'unknown' }),
        );
        done();
      });
  });

  it('records 500 on handler error when status is not set', (done) => {
    const context = httpContext({ statusCode: 200, path: '/x' });

    interceptor
      .intercept(context as never, {
        handle: () => throwError(() => new Error('boom')),
      })
      .subscribe({
        error: () => {
          expect(end).toHaveBeenCalledWith({ status: '500' });
          done();
        },
      });
  });

  it('records existing error status when already >= 400', (done) => {
    const context = httpContext({ statusCode: 503, path: '/x' });

    interceptor
      .intercept(context as never, {
        handle: () => throwError(() => new Error('boom')),
      })
      .subscribe({
        error: () => {
          expect(end).toHaveBeenCalledWith({ status: '503' });
          done();
        },
      });
  });
});
