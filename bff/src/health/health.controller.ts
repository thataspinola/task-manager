/**
 * Health do BFF: consulta `/health` da API interna.
 * Se a API falhar, responde 503 `degraded` (não derruba o processo).
 */
import { HttpService } from '@nestjs/axios';
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';

export type HealthResponse = {
  status: 'ok' | 'degraded';
  api: 'connected' | 'disconnected';
  timestamp: string;
};

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly httpService: HttpService) {}

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

      return {
        status: 'ok',
        api: 'connected',
        timestamp,
      };
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);

      return {
        status: 'degraded',
        api: 'disconnected',
        timestamp,
      };
    }
  }
}
