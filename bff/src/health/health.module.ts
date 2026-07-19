/** Módulo do endpoint `/api/health`. */
import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module.js';
import { HealthController } from './health.controller.js';

@Module({
  imports: [MetricsModule],
  controllers: [HealthController],
})
export class HealthModule {}
