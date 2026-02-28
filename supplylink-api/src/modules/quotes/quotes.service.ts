import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RequestQuoteDto } from './dto/request-quote.dto';
import { RespondQuoteDto } from './dto/respond-quote.dto';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async requestQuotes(factoryId: string, dto: RequestQuoteDto) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: dto.demandId },
    });

    if (!demand) throw new NotFoundException('Demanda não encontrada');
    if (demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para esta demanda');

    const quoteRequests = await this.prisma.$transaction(async (tx) => {
      // Atualiza status da demanda para IN_NEGOTIATION
      await tx.demand.update({
        where: { id: dto.demandId },
        data: { status: 'IN_NEGOTIATION' },
      });

      // Cria um QuoteRequest para cada fornecedor
      return Promise.all(
        dto.supplierIds.map((supplierId) =>
          tx.quoteRequest.create({
            data: {
              demandId: dto.demandId,
              supplierId,
            },
          }),
        ),
      );
    });

    return quoteRequests;
  }

  async findRequests(factoryId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { demand: { factoryId } },
      include: {
        demand: true,
        supplier: { select: { id: true, companyName: true, email: true } },
        response: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findRequestById(id: string, factoryId: string) {
    const request = await this.prisma.quoteRequest.findUnique({
      where: { id },
      include: {
        demand: true,
        supplier: { select: { id: true, companyName: true, email: true } },
        response: true,
      },
    });

    if (!request) throw new NotFoundException('Solicitação de cotação não encontrada');
    if (request.demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para acessar esta cotação');

    return request;
  }

  async findReceived(supplierId: string) {
    return this.prisma.quoteRequest.findMany({
      where: { supplierId },
      include: {
        demand: {
          include: {
            factory: { select: { id: true, companyName: true, email: true } },
          },
        },
        response: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async respond(requestId: string, supplierId: string, dto: RespondQuoteDto) {
    const request = await this.prisma.quoteRequest.findUnique({
      where: { id: requestId },
      include: { response: true },
    });

    if (!request) throw new NotFoundException('Solicitação de cotação não encontrada');
    if (request.supplierId !== supplierId)
      throw new ForbiddenException('Sem permissão para responder esta cotação');
    if (request.response)
      throw new BadRequestException('Esta cotação já foi respondida');

    return this.prisma.$transaction(async (tx) => {
      await tx.quoteRequest.update({
        where: { id: requestId },
        data: { status: 'ANSWERED' },
      });

      return tx.quoteResponse.create({
        data: {
          quoteRequestId: requestId,
          unitPrice: dto.unitPrice,
          totalPrice: dto.totalPrice,
          leadTimeDays: dto.leadTimeDays,
          conditions: dto.conditions,
        },
      });
    });
  }

  async accept(requestId: string, factoryId: string) {
    const request = await this.prisma.quoteRequest.findUnique({
      where: { id: requestId },
      include: { demand: true },
    });

    if (!request) throw new NotFoundException('Solicitação de cotação não encontrada');
    if (request.demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para aceitar esta cotação');
    if (request.status !== 'ANSWERED')
      throw new BadRequestException('Apenas cotações respondidas podem ser aceitas');

    return this.prisma.quoteRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });
  }

  async reject(requestId: string, factoryId: string) {
    const request = await this.prisma.quoteRequest.findUnique({
      where: { id: requestId },
      include: { demand: true },
    });

    if (!request) throw new NotFoundException('Solicitação de cotação não encontrada');
    if (request.demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para rejeitar esta cotação');
    if (request.status !== 'ANSWERED')
      throw new BadRequestException('Apenas cotações respondidas podem ser rejeitadas');

    return this.prisma.quoteRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });
  }

  async compareQuotes(demandId: string, factoryId: string) {
    const demand = await this.prisma.demand.findUnique({
      where: { id: demandId },
    });

    if (!demand) throw new NotFoundException('Demanda não encontrada');
    if (demand.factoryId !== factoryId)
      throw new ForbiddenException('Sem permissão para acessar esta demanda');

    return this.prisma.quoteRequest.findMany({
      where: { demandId },
      include: {
        supplier: { select: { id: true, companyName: true, email: true } },
        response: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
