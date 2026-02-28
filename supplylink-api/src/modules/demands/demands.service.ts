import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateDemandDto } from './dto/create-demand.dto';

@Injectable()
export class DemandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(factoryId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.demand.findMany({
        where: { factoryId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.demand.count({ where: { factoryId } }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string, factoryId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id },
      include: { quoteRequests: { include: { response: true } } },
    });

    if (!demand) throw new NotFoundException('Demanda não encontrada');
    if (demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para acessar esta demanda');

    return demand;
  }

  async create(factoryId: string, dto: CreateDemandDto) {
    return this.prisma.demand.create({
      data: {
        factoryId,
        productName: dto.productName,
        quantity: dto.quantity,
        unit: dto.unit,
        neededBy: new Date(dto.neededBy),
        conditions: dto.conditions,
      },
    });
  }

  async update(id: string, factoryId: string, dto: Partial<CreateDemandDto>) {
    const demand = await this.prisma.demand.findUnique({ where: { id } });

    if (!demand) throw new NotFoundException('Demanda não encontrada');
    if (demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para atualizar esta demanda');
    if (demand.status !== 'OPEN')
      throw new BadRequestException('Apenas demandas com status OPEN podem ser editadas');

    return this.prisma.demand.update({
      where: { id },
      data: {
        ...(dto.productName && { productName: dto.productName }),
        ...(dto.quantity != null && { quantity: dto.quantity }),
        ...(dto.unit && { unit: dto.unit }),
        ...(dto.neededBy && { neededBy: new Date(dto.neededBy) }),
        ...(dto.conditions !== undefined && { conditions: dto.conditions }),
      },
    });
  }

  async cancel(id: string, factoryId: string) {
    const demand = await this.prisma.demand.findUnique({ where: { id } });

    if (!demand) throw new NotFoundException('Demanda não encontrada');
    if (demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para cancelar esta demanda');

    return this.prisma.demand.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
