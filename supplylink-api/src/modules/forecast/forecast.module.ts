import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ForecastController } from './forecast.controller';
import { ForecastService } from './forecast.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [ForecastController],
  providers: [ForecastService, PrismaService],
  exports: [ForecastService],
})
export class ForecastModule {}
