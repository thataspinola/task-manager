/**
 * Módulo raiz: configura env, banco e features da aplicação.
 */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { SentryModule } from '@sentry/nestjs/setup'
import { PrismaModule } from './common/database/prisma.module.js'
import { envValidationSchema } from './config/env.validation.js'
import { HealthModule } from './health/health.module.js'
import { MetricsModule } from './metrics/metrics.module.js'
import { TasksModule } from './tasks/task.module.js'

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        // Variáveis extras do SO/CI não devem derrubar o boot
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule,
    MetricsModule,
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
