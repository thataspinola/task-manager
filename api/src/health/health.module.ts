/** Módulo do endpoint `/api/health`. */
import { Module } from '@nestjs/common'
import { HealthController } from './health.controller.js'

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
