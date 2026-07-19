import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './common/database/prisma.module.js'
import { envValidationSchema } from './config/env.validation.js'
import { TasksModule } from './tasks/task.module.js'
import { HealthModule } from './health/health.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    PrismaModule,
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
