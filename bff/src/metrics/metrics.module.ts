/**
 * Métricas Prometheus: endpoint /api/metrics + histogram HTTP + gauge de health.
 */
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  makeGaugeProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { HealthMetricsService } from './health-metrics.service.js';
import { HttpMetricsInterceptor } from './http-metrics.interceptor.js';
import {
  APP_HEALTH_STATUS,
  HTTP_REQUESTS_SECONDS,
} from './metrics.constants.js';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultLabels: {
        service: 'bff',
      },
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: HTTP_REQUESTS_SECONDS,
      help: 'Duração das requisições HTTP em segundos',
      labelNames: ['method', 'path', 'status', 'service'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    makeGaugeProvider({
      name: APP_HEALTH_STATUS,
      help: 'Status de health (1=ok, 0=degraded)',
      labelNames: ['service', 'component'],
    }),
    HealthMetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  exports: [HealthMetricsService, PrometheusModule],
})
export class MetricsModule {}
