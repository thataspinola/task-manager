/// <reference types="jest" />

import { Test } from '@nestjs/testing';
import { AppModule } from './app.module.js';
import { HealthModule } from './health/health.module.js';
import { HttpClientModule } from './http/http-client.module.js';
import { TasksModule } from './tasks/tasks.module.js';

describe('Application modules', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      API_BASE_URL: 'http://localhost:3001/api',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('wires AppModule providers', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleRef.get(AppModule)).toBeDefined();
    expect(moduleRef.get(HttpClientModule)).toBeDefined();
    expect(moduleRef.get(TasksModule)).toBeDefined();
    expect(moduleRef.get(HealthModule)).toBeDefined();
    await moduleRef.close();
  });
});
