/// <reference types="jest" />

import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import type { Response } from 'express'
import { PrismaService } from '../common/database/prisma.service.js'
import { HealthController } from './health.controller.js'

describe('HealthController', () => {
  let controller: HealthController
  let prisma: { $queryRaw: jest.Mock }
  let res: { status: jest.Mock }

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    }
    res = {
      status: jest.fn().mockReturnThis(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile()

    controller = module.get(HealthController)
  })

  it('returns ok when the database responds', async () => {
    const result = await controller.check(res as unknown as Response)

    expect(prisma.$queryRaw).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(result).toMatchObject({
      status: 'ok',
      database: 'connected',
    })
    expect(result.timestamp).toEqual(expect.any(String))
  })

  it('returns degraded with 503 when the database fails', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('connection refused'))

    const result = await controller.check(res as unknown as Response)

    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE)
    expect(result).toMatchObject({
      status: 'degraded',
      database: 'disconnected',
    })
    expect(result.timestamp).toEqual(expect.any(String))
  })
})
