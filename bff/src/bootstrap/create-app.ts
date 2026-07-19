/**
 * Factory / bootstrap do BFF (produção, e2e e testes).
 * Prefixo `/api`, CORS do front, ValidationPipe, Swagger e listen.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../app.module.js';

export type ConfigureAppOptions = {
  swagger?: boolean;
};

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
}

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Manager BFF')
    .setDescription(
      'Backend for Frontend responsável pela comunicação entre o React e a API interna.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Disponibilidade do BFF e da API')
    .addTag('Tasks', 'Proxy tipado das operações de tarefas')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Task Manager BFF Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): INestApplication {
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const enableSwagger = options.swagger ?? nodeEnv !== 'production';

  app.setGlobalPrefix('api');
  app.useGlobalPipes(createValidationPipe());
  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.enableShutdownHooks();

  if (enableSwagger) {
    setupSwagger(app);
  }

  return app;
}

export async function createApp(
  options?: ConfigureAppOptions,
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  return configureApp(app, options);
}

export async function bootstrap(): Promise<INestApplication> {
  const app = await createApp();
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3002);

  await app.listen(port);
  console.log(`BFF: http://localhost:${port}/api`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);

  return app;
}
