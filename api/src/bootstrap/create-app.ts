import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js'
import { AppModule } from '../app.module.js'
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js'

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

export function configureApp(app: INestApplication): INestApplication {
  const configService = app.get(ConfigService)

  app.setGlobalPrefix('api')
  app.enableCors(resolveCorsOptions(configService))
  app.useGlobalPipes(createValidationPipe())
  app.useGlobalFilters(new PrismaExceptionFilter())
  app.enableShutdownHooks()

  return app
}

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule)
  return configureApp(app)
}

export async function bootstrap(): Promise<INestApplication> {
  const app = await createApp()
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)

  await app.listen(port)
  console.log(`API running at http://localhost:${port}/api`)

  return app
}
