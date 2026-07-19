/**
 * Módulo raiz do BFF (Module pattern + DI).
 * Env, HTTP client, health, Tasks; AllExceptionsFilter via APP_FILTER.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { SentryModule } from '@sentry/nestjs/setup';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { envValidationSchema } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { HttpClientModule } from './http/http-client.module.js';
import { MetricsModule } from './metrics/metrics.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    HttpClientModule,
    MetricsModule,
    HealthModule,
    TasksModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
