import { Module } from '@nestjs/common';
import { DemandsController } from './demands.controller';
import { DemandsService } from './demands.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [DemandsController],
  providers: [DemandsService, PrismaService],
  exports: [DemandsService],
})
export class DemandsModule {}
