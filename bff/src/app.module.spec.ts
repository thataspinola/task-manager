/// <reference types="jest" />

describe('Application modules', () => {
  const originalEnv = { ...process.env };

  beforeAll(() => {
    process.env.API_BASE_URL = 'http://localhost:3001/api';
    process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('wires AppModule providers', async () => {
    const { Test } = await import('@nestjs/testing');
    const { AppModule } = await import('./app.module.js');
    const { HealthModule } = await import('./health/health.module.js');
    const { HttpClientModule } = await import('./http/http-client.module.js');
    const { TasksModule } = await import('./tasks/tasks.module.js');

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
