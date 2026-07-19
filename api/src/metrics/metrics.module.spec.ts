/// <reference types="jest" />

import { MetricsModule } from './metrics.module.js'
import {
  APP_HEALTH_STATUS,
  HTTP_REQUESTS_SECONDS,
} from './metrics.constants.js'

describe('MetricsModule', () => {
  it('exports module and metric names', () => {
    expect(MetricsModule).toBeDefined()
    expect(HTTP_REQUESTS_SECONDS).toBe('http_requests_seconds')
    expect(APP_HEALTH_STATUS).toBe('app_health_status')
  })
})
