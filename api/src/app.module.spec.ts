/// <reference types="jest" />

describe('Application modules', () => {
  const originalEnv = { ...process.env }

  beforeAll(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/task_manager?schema=public'
    process.env.NODE_ENV = 'test'
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('wires AppModule providers', async () => {
    const { Test } = await import('@nestjs/testing')
    const { AppModule } = await import('./app.module.js')
    const { PrismaModule } = await import('./common/database/prisma.module.js')
    const { PrismaService } = await import(
      './common/database/prisma.service.js'
    )
    const { TasksModule } = await import('./tasks/task.module.js')

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile()

    expect(moduleRef.get(AppModule)).toBeDefined()
    expect(moduleRef.get(PrismaModule)).toBeDefined()
    expect(moduleRef.get(TasksModule)).toBeDefined()
    await moduleRef.close()
  })
})
