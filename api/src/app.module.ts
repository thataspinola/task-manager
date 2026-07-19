/**
 * Módulo raiz: configura env, banco e features da aplicação.
 */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './common/database/prisma.module.js'
import { envValidationSchema } from './config/env.validation.js'
import { HealthModule } from './health/health.module.js'
import { TasksModule } from './tasks/task.module.js'

@Module({
  imports: [
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
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
