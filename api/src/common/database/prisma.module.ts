/** Expõe PrismaService globalmente para modules de feature e health. */
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service.js'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
