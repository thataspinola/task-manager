import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, TaskStatus } from '../src/generated/prisma/client.js'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined')
}

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({
  adapter,
})

async function main(): Promise<void> {
  console.log('Starting database seed...')

  await prisma.task.deleteMany()

  await prisma.task.createMany({
    data: [
      {
        title: 'Finalizar API NestJS',
        description: 'Concluir CRUD, validações e testes',
        status: TaskStatus.IN_PROGRESS,
      },
      {
        title: 'Criar BFF NestJS',
        description: 'Criar a camada entre o frontend e a API',
        status: TaskStatus.PENDING,
      },
      {
        title: 'Criar frontend React',
        description: 'Criar a interface do gerenciador de tarefas',
        status: TaskStatus.PENDING,
      },
      {
        title: 'Configurar banco PostgreSQL',
        description: 'Criar banco, migration e Prisma Client',
        status: TaskStatus.COMPLETED,
      },
    ],
  })

  const total = await prisma.task.count()

  console.log(`Seed completed. ${total} tasks created.`)
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
