/// <reference types="jest" />

import { Test } from '@nestjs/testing'
import { AppModule } from './app.module.js'
import { PrismaModule } from './common/database/prisma.module.js'
import { PrismaService } from './common/database/prisma.service.js'
import { TasksModule } from './tasks/task.module.js'

describe('Application modules', () => {
  it('wires AppModule providers', async () => {
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
