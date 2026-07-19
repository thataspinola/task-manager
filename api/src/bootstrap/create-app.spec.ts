/// <reference types="jest" />

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from '../app.module.js'
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter.js'
import {
  bootstrap,
  configureApp,
  createApp,
  createValidationPipe,
  resolveCorsOptions,
  setupSwagger,
} from './create-app.js'

jest.mock('../app.module.js', () => ({
  AppModule: class AppModule {},
}))

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}))

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger') as typeof import('@nestjs/swagger')
  const chain = {
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addTag: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  }

  return {
    ...actual,
    DocumentBuilder: jest.fn(() => chain),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  }
})

describe('create-app bootstrap', () => {
  const listen = jest.fn().mockResolvedValue(undefined)
  const useGlobalPipes = jest.fn()
  const useGlobalFilters = jest.fn()
  const enableShutdownHooks = jest.fn()
  const setGlobalPrefix = jest.fn()
  const enableCors = jest.fn()
  const configGet = jest.fn()
  const get = jest.fn()

  const app = {
    useGlobalPipes,
    useGlobalFilters,
    enableShutdownHooks,
    setGlobalPrefix,
    enableCors,
    get,
    listen,
  } as unknown as INestApplication

  beforeEach(() => {
    jest.clearAllMocks()
    configGet.mockImplementation((key: string, fallback?: number) => {
      if (key === 'PORT') {
        return fallback
      }

      return undefined
    })
    get.mockReturnValue({ get: configGet })
    jest.mocked(NestFactory.create).mockResolvedValue(app)
  })

  it('creates a validation pipe with the expected options', () => {
    expect(createValidationPipe()).toBeInstanceOf(ValidationPipe)
  })

  it('resolves open CORS when CORS_ORIGIN is empty or *', () => {
    expect(
      resolveCorsOptions({
        get: () => undefined,
      } as unknown as ConfigService),
    ).toBe(true)

    expect(
      resolveCorsOptions({
        get: () => '*',
      } as unknown as ConfigService),
    ).toBe(true)

    expect(
      resolveCorsOptions({
        get: () => '  ',
      } as unknown as ConfigService),
    ).toBe(true)
  })

  it('resolves CORS origins from a comma-separated list', () => {
    expect(
      resolveCorsOptions({
        get: () => 'http://localhost:5173, https://app.example.com',
      } as unknown as ConfigService),
    ).toEqual({
      origin: ['http://localhost:5173', 'https://app.example.com'],
    })
  })

  it('configures api prefix, cors, pipes, filter and swagger', () => {
    const result = configureApp(app)

    expect(setGlobalPrefix).toHaveBeenCalledWith('api')
    expect(enableCors).toHaveBeenCalledWith(true)
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe))
    expect(useGlobalFilters).toHaveBeenCalledWith(
      expect.any(AllExceptionsFilter),
    )
    expect(enableShutdownHooks).toHaveBeenCalled()
    expect(SwaggerModule.setup).toHaveBeenCalled()
    expect(result).toBe(app)
  })

  it('skips swagger when disabled', () => {
    configureApp(app, { swagger: false })

    expect(SwaggerModule.setup).not.toHaveBeenCalled()
  })

  it('skips swagger by default in production', () => {
    configGet.mockImplementation((key: string, fallback?: string | number) => {
      if (key === 'NODE_ENV') {
        return 'production'
      }

      return fallback
    })

    configureApp(app)

    expect(SwaggerModule.setup).not.toHaveBeenCalled()
  })

  it('sets up swagger document metadata', () => {
    setupSwagger(app)

    expect(DocumentBuilder).toHaveBeenCalled()
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, {})
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api/docs',
      app,
      {},
      expect.objectContaining({
        customSiteTitle: 'Task Manager API Docs',
      }),
    )
  })

  it('creates the Nest application and configures it', async () => {
    const result = await createApp()

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule)
    expect(setGlobalPrefix).toHaveBeenCalledWith('api')
    expect(result).toBe(app)
  })

  it('bootstraps and listens on configured PORT', async () => {
    configGet.mockImplementation((key: string, fallback?: number) => {
      if (key === 'PORT') {
        return 4000
      }

      return fallback
    })

    const result = await bootstrap()

    expect(get).toHaveBeenCalledWith(ConfigService)
    expect(listen).toHaveBeenCalledWith(4000)
    expect(result).toBe(app)
  })

  it('bootstraps and listens on 3001 by default', async () => {
    await bootstrap()

    expect(listen).toHaveBeenCalledWith(3001)
  })
})
