/**
 * Bootstrap compartilhado entre produção, e2e e testes.
 * Centraliza prefixo `/api`, CORS, ValidationPipe, filter, Swagger e listen.
 */
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '../app.module.js'
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js'

export type ConfigureAppOptions = {
  /** Override: `false` desliga docs mesmo fora de produção */
  swagger?: boolean
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
}

export function resolveCorsOptions(
  configService: ConfigService,
): boolean | CorsOptions {
  const originRaw = configService.get<string>('CORS_ORIGIN')
  const origin = typeof originRaw === 'string' ? originRaw.trim() : ''

  if (!origin || origin === '*') {
    return true
  }

  return {
    origin: origin.split(',').map((value) => value.trim()).filter(Boolean),
  }
}

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription(
      'API REST para gerenciamento de tarefas utilizando NestJS, Prisma e PostgreSQL.',
    )
    .setVersion('1.0.0')
    .addTag('Health', 'Verificação de disponibilidade da aplicação')
    .addTag('Tasks', 'Operações de gerenciamento de tarefas')
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    customSiteTitle: 'Task Manager API Docs',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
}

export function configureApp(
  app: INestApplication,
  options: ConfigureAppOptions = {},
): INestApplication {
  const configService = app.get(ConfigService)
  const nodeEnv = configService.get<string>('NODE_ENV', 'development')
  // Em produção o Swagger fica off por padrão (menos superfície de ataque)
  const enableSwagger = options.swagger ?? nodeEnv !== 'production'

  app.setGlobalPrefix('api')
  app.enableCors(resolveCorsOptions(configService))
  app.useGlobalPipes(createValidationPipe())
  app.useGlobalFilters(new AllExceptionsFilter())
  app.enableShutdownHooks()

  if (enableSwagger) {
    setupSwagger(app)
  }

  return app
}

export async function createApp(
  options?: ConfigureAppOptions,
): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule)
  return configureApp(app, options)
}

export async function bootstrap(): Promise<INestApplication> {
  const app = await createApp()
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)

  await app.listen(port)
  console.log(`API: http://localhost:${port}/api`)
  console.log(`Swagger: http://localhost:${port}/api/docs`)

  return app
}
