/**
 * Adapter Prisma 7: PrismaClient + driver `pg` (`@prisma/adapter-pg`).
 * Conecta no init do módulo e desconecta no shutdown do Nest.
 */
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL')

    if (!connectionString) {
      throw new Error('DATABASE_URL is required')
    }

    super({
      adapter: new PrismaPg({ connectionString }),
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
