import {
  Controller,
  Get,
  Post,
  Patch,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Criar pedido a partir de cotação aceita' })
  create(
    @CurrentUser('id') factoryId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.create(factoryId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos (filtrado por role)' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findAll(
      userId,
      role,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get('history')
  @Roles('FACTORY')
  @ApiOperation({ summary: 'Histórico de pedidos entregues da fábrica' })
  getHistory(
    @CurrentUser('id') factoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getHistory(
      factoryId,
      page ? +page : 1,
      limit ? +limit : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um pedido' })
  findById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.findById(id, userId);
  }

  @Patch(':id/status')
  @Roles('SUPPLIER')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') supplierId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, supplierId, dto);
  }
}
