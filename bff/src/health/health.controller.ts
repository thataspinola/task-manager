import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { throwApiError } from '../http/api-error.util.js';

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
  async check() {
    try {
      await firstValueFrom(this.httpService.get('/health'));

      return {
        status: 'ok',
        api: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      throwApiError(error);
    }
  }
}
