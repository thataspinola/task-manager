/**
 * Health do BFF: consulta `/health` da API interna.
 * Se a API falhar, responde 503 `degraded` (não derruba o processo).
 */
import { HttpService } from '@nestjs/axios';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { HealthMetricsService } from '../metrics/health-metrics.service.js';

export type HealthResponse = {
  status: 'ok' | 'degraded';
  api: 'connected' | 'disconnected';
  timestamp: string;
};

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly healthMetrics: HealthMetricsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar BFF e API',
  })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        api: 'connected',
        timestamp: '2026-07-18T20:00:00.000Z',
      },
    },
  })
  async check(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponse> {
    const timestamp = new Date().toISOString();

    try {
      await firstValueFrom(this.httpService.get('/health'));
      this.healthMetrics.setComponentHealth('api', true);
      this.healthMetrics.setComponentHealth('app', true);

      return {
        status: 'ok',
        api: 'connected',
        timestamp,
      };
    } catch {
      this.healthMetrics.setComponentHealth('api', false);
      this.healthMetrics.setComponentHealth('app', false);
      res.status(HttpStatus.SERVICE_UNAVAILABLE);

      return {
        status: 'degraded',
        api: 'disconnected',
        timestamp,
      };
    }
  }
}
