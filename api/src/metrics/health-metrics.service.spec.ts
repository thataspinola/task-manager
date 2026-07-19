/// <reference types="jest" />

import { HealthMetricsService } from './health-metrics.service.js'

describe('HealthMetricsService', () => {
  it('sets gauge to 1 when healthy and 0 when degraded', () => {
    const set = jest.fn()
    const service = new HealthMetricsService({ set } as never)

    service.setComponentHealth('database', true)
    expect(set).toHaveBeenCalledWith(
      { service: 'api', component: 'database' },
      1,
    )

    service.setComponentHealth('database', false)
    expect(set).toHaveBeenCalledWith(
      { service: 'api', component: 'database' },
      0,
    )
  })
})
