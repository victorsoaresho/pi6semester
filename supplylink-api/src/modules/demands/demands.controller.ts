import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DemandsService } from './demands.service';
import { CreateDemandDto } from './dto/create-demand.dto';

@ApiTags('Demands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('FACTORY')
@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar demandas da fábrica autenticada' })
  findAll(
    @CurrentUser('id') factoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.demandsService.findAll(
      factoryId,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de uma demanda' })
  findById(
    @Param('id') id: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.demandsService.findById(id, factoryId);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova demanda' })
  create(
    @CurrentUser('id') factoryId: string,
    @Body() dto: CreateDemandDto,
  ) {
    return this.demandsService.create(factoryId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar demanda (somente se OPEN)' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') factoryId: string,
    @Body() dto: CreateDemandDto,
  ) {
    return this.demandsService.update(id, factoryId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar demanda' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') factoryId: string,
  ) {
    return this.demandsService.cancel(id, factoryId);
  }
}
