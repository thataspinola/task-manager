/// <reference types="jest" />

import { HealthMetricsService } from './health-metrics.service.js';

describe('HealthMetricsService', () => {
  it('sets gauge to 1 when healthy and 0 when degraded', () => {
    const set = jest.fn();
    const service = new HealthMetricsService({ set } as never);

    service.setComponentHealth('api', true);
    expect(set).toHaveBeenCalledWith({ service: 'bff', component: 'api' }, 1);

    service.setComponentHealth('api', false);
    expect(set).toHaveBeenCalledWith({ service: 'bff', component: 'api' }, 0);
  });
});
