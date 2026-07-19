/// <reference types="jest" />

import { HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { of, throwError } from 'rxjs';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;
  let httpService: { get: jest.Mock };
  let res: { status: jest.Mock };

  beforeEach(async () => {
    httpService = { get: jest.fn() };
    res = { status: jest.fn().mockReturnThis() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HttpService, useValue: httpService }],
    }).compile();

    controller = module.get(HealthController);
  });

  it('returns ok when the API health responds', async () => {
    httpService.get.mockReturnValue(of({ data: { status: 'ok' } }));

    const result = await controller.check(res as unknown as Response);

    expect(httpService.get).toHaveBeenCalledWith('/health');
    expect(res.status).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      status: 'ok',
      api: 'connected',
    });
  });

  it('returns degraded with 503 when the API is unavailable', async () => {
    httpService.get.mockReturnValue(throwError(() => new Error('down')));

    const result = await controller.check(res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(result).toMatchObject({
      status: 'degraded',
      api: 'disconnected',
    });
  });
});
