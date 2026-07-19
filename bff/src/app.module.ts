import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { HealthModule } from './health/health.module.js';
import { HttpClientModule } from './http/http-client.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),

        PORT: Joi.number().port().default(3002),

        API_BASE_URL: Joi.string().uri().required(),

        FRONTEND_ORIGIN: Joi.string().uri().required(),

        HTTP_TIMEOUT: Joi.number().integer().min(100).max(30000).default(5000),
      }),

      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    HttpClientModule,
    HealthModule,
    TasksModule,
  ],
})
export class AppModule {}
