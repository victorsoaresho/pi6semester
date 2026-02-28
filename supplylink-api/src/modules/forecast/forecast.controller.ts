import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ForecastService } from './forecast.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Forecast')
@ApiBearerAuth()
@Controller('forecast')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('alerts')
  @Roles(Role.FACTORY)
  @ApiOperation({ summary: 'Listar alertas de reposição para a fábrica' })
  getAlerts(@CurrentUser('id') userId: string) {
    return this.forecastService.getAlerts(userId);
  }

  @Get(':productId')
  @Roles(Role.FACTORY)
  @ApiOperation({ summary: 'Obter previsão de demanda para um produto' })
  @ApiQuery({ name: 'horizon', required: false, enum: ['30', '60', '90'] })
  getForecast(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
    @Query('horizon') horizon?: string,
  ) {
    const horizonDays = horizon ? parseInt(horizon, 10) : 30;
    return this.forecastService.getForecast(userId, productId, horizonDays);
  }

  @Post('trigger')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Disparar treinamento manual do modelo ML' })
  triggerTraining() {
    return this.forecastService.triggerTraining();
  }
}
