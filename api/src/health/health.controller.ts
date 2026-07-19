/**
 * Health check: confirma processo + conectividade com o PostgreSQL.
 * Se o banco falhar, responde 503 com status `degraded` (sem derrubar a app).
 */
import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { PrismaService } from '../common/database/prisma.service.js'
import { HealthMetricsService } from '../metrics/health-metrics.service.js'

export type HealthResponse = {
  status: 'ok' | 'degraded'
  database: 'connected' | 'disconnected'
  timestamp: string
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthMetrics: HealthMetricsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar a disponibilidade da API e do banco',
  })
  @ApiOkResponse({
    description: 'Aplicação e banco estão disponíveis',
    schema: {
      example: {
        status: 'ok',
        database: 'connected',
        timestamp: '2026-07-18T20:00:00.000Z',
      },
    },
  })
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponse> {
    const timestamp = new Date().toISOString()

    try {
      await this.prisma.$queryRaw`SELECT 1`
      this.healthMetrics.setComponentHealth('database', true)
      this.healthMetrics.setComponentHealth('app', true)

      return {
        status: 'ok',
        database: 'connected',
        timestamp,
      }
    } catch {
      this.healthMetrics.setComponentHealth('database', false)
      this.healthMetrics.setComponentHealth('app', false)
      res.status(HttpStatus.SERVICE_UNAVAILABLE)

      return {
        status: 'degraded',
        database: 'disconnected',
        timestamp,
      }
    }
  }
}
