/// <reference types="jest" />

import { HttpService } from '@nestjs/axios';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { of, throwError } from 'rxjs';
import { HealthMetricsService } from '../metrics/health-metrics.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;
  let httpService: { get: jest.Mock };
  let healthMetrics: { setComponentHealth: jest.Mock };
  let res: { status: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    healthMetrics = { setComponentHealth: jest.fn() };
    res = { status: jest.fn().mockReturnThis() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: HealthMetricsService, useValue: healthMetrics },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns ok when the API health responds', async () => {
    httpService.get.mockReturnValue(of({ data: { status: 'ok' } }));

    const result = await controller.check(res as unknown as Response);

    expect(httpService.get).toHaveBeenCalledWith('/health');
    expect(res.status).not.toHaveBeenCalled();
    expect(healthMetrics.setComponentHealth).toHaveBeenCalledWith('api', true);
    expect(result).toMatchObject({
      status: 'ok',
      api: 'connected',
    });
  });

  it('returns degraded with 503 when the API is unavailable', async () => {
    httpService.get.mockReturnValue(throwError(() => new Error('down')));

    const result = await controller.check(res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(healthMetrics.setComponentHealth).toHaveBeenCalledWith('api', false);
    expect(result).toMatchObject({
      status: 'degraded',
      api: 'disconnected',
    });
  });
});
