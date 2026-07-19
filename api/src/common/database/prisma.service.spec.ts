/// <reference types="jest" />

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}))

jest.mock('../../generated/prisma/client.js', () => {
  class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined)
    $disconnect = jest.fn().mockResolvedValue(undefined)

    constructor(options?: unknown) {
      void options
    }
  }

  return { PrismaClient: MockPrismaClient }
})

import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaService } from './prisma.service.js'

describe('PrismaService', () => {
  const createConfigService = (databaseUrl?: string): ConfigService =>
    ({
      get: jest.fn().mockReturnValue(databaseUrl),
    }) as unknown as ConfigService

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws when DATABASE_URL is missing', () => {
    expect(() => new PrismaService(createConfigService())).toThrow(
      'DATABASE_URL is required',
    )
  })

  it('creates the PostgreSQL adapter with DATABASE_URL', () => {
    const service = new PrismaService(
      createConfigService('postgresql://user:pass@localhost:5432/db'),
    )

    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: 'postgresql://user:pass@localhost:5432/db',
    })
    expect(service).toBeInstanceOf(PrismaService)
  })

  it('connects on module init', async () => {
    const service = new PrismaService(
      createConfigService('postgresql://user:pass@localhost:5432/db'),
    )

    await service.onModuleInit()

    expect(service.$connect).toHaveBeenCalledTimes(1)
  })

  it('disconnects on module destroy', async () => {
    const service = new PrismaService(
      createConfigService('postgresql://user:pass@localhost:5432/db'),
    )

    await service.onModuleDestroy()

    expect(service.$disconnect).toHaveBeenCalledTimes(1)
  })
})
