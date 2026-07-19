import {
  Controller,
  Get,
  HttpStatus,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { PrismaService } from '../common/database/prisma.service.js'

export type HealthResponse = {
  status: 'ok' | 'degraded'
  database: 'connected' | 'disconnected'
  timestamp: string
}

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthResponse> {
    const timestamp = new Date().toISOString()

    try {
      await this.prisma.$queryRaw`SELECT 1`

      return {
        status: 'ok',
        database: 'connected',
        timestamp,
      }
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE)

      return {
        status: 'degraded',
        database: 'disconnected',
        timestamp,
      }
    }
  }
}
