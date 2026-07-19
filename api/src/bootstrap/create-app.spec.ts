/// <reference types="jest" />

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module.js'
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js'
import {
  bootstrap,
  configureApp,
  createApp,
  createValidationPipe,
  resolveCorsOptions,
} from './create-app.js'

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}))

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

  it('configures api prefix, cors, pipes and prisma filter', () => {
    const result = configureApp(app)

    expect(setGlobalPrefix).toHaveBeenCalledWith('api')
    expect(enableCors).toHaveBeenCalledWith(true)
    expect(useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe))
    expect(useGlobalFilters).toHaveBeenCalledWith(
      expect.any(PrismaExceptionFilter),
    )
    expect(enableShutdownHooks).toHaveBeenCalled()
    expect(result).toBe(app)
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
