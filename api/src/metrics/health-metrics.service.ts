import { Injectable } from '@nestjs/common'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import type { Gauge } from 'prom-client'
import { APP_HEALTH_STATUS } from './metrics.constants.js'

@Injectable()
export class HealthMetricsService {
  private readonly serviceName = 'api'

  constructor(
    @InjectMetric(APP_HEALTH_STATUS)
    private readonly healthGauge: Gauge<string>,
  ) {}

  setComponentHealth(component: string, healthy: boolean): void {
    this.healthGauge.set(
      { service: this.serviceName, component },
      healthy ? 1 : 0,
    )
  }
}
