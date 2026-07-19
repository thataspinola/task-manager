import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_ORIGIN'),

    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Manager BFF')
    .setDescription(
      'Backend for Frontend responsável pela comunicação entre o React e a API interna.',
    )
    .setVersion('1.0.0')
    .addTag('Health')
    .addTag('Tasks')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Task Manager BFF Docs',
  });

  const port = configService.get<number>('PORT', 3002);

  await app.listen(port);

  console.log(`BFF: http://localhost:${port}/api`);

  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

void bootstrap();
