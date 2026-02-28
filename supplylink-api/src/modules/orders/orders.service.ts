import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async create(factoryId: string, dto: CreateOrderDto) {
    const quoteResponse = await this.prisma.quoteResponse.findUnique({
      where: { id: dto.quoteResponseId },
      include: {
        quoteRequest: {
          include: { demand: true },
        },
      },
    });

    if (!quoteResponse)
      throw new NotFoundException('Resposta de cotação não encontrada');

    const { quoteRequest } = quoteResponse;

    if (quoteRequest.demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para criar pedido a partir desta cotação');
    if (quoteRequest.status !== 'ACCEPTED')
      throw new BadRequestException('A cotação precisa estar aceita para gerar um pedido');

    const existingOrder = await this.prisma.order.findUnique({
      where: { quoteResponseId: dto.quoteResponseId },
    });
    if (existingOrder)
      throw new BadRequestException('Já existe um pedido para esta cotação');

    return this.prisma.order.create({
      data: {
        quoteResponseId: dto.quoteResponseId,
        factoryId,
        supplierId: quoteRequest.supplierId,
      },
      include: { quoteResponse: true },
    });
  }

  async findAll(userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where =
      role === 'FACTORY' ? { factoryId: userId } : { supplierId: userId };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          quoteResponse: {
            include: {
              quoteRequest: { include: { demand: true } },
            },
          },
          factory: { select: { id: true, companyName: true } },
          supplier: { select: { id: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        quoteResponse: {
          include: {
            quoteRequest: { include: { demand: true } },
          },
        },
        factory: { select: { id: true, companyName: true, email: true } },
        supplier: { select: { id: true, companyName: true, email: true } },
      },
    });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.factoryId !== userId && order.supplierId !== userId)
      throw new ForbiddenException('Sem permissão para acessar este pedido');

    return order;
  }

  async updateStatus(id: string, supplierId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });

    if (!order) throw new NotFoundException('Pedido não encontrado');
    if (order.supplierId !== supplierId)
      throw new ForbiddenException('Sem permissão para atualizar este pedido');

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });

    this.ordersGateway.emitStatusUpdate(id, dto.status);

    return updated;
  }

  async getHistory(factoryId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { factoryId, status: 'DELIVERED' },
        include: {
          quoteResponse: {
            include: {
              quoteRequest: { include: { demand: true } },
            },
          },
          supplier: { select: { id: true, companyName: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: { factoryId, status: 'DELIVERED' } }),
    ]);

    return { data, total, page, limit };
  }
}
